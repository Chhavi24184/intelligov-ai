from agents.orchestrator import OrchestratorAgent
from services.granite_service import granite_client
from services.rag_service import search_full_schemes, _MAX_RELEVANT_DISTANCE
from services.personalization_service import (
    personalise,
    get_profile_completeness,
    build_profile_missing_prompt,
)
from core.logger import logger


# ============================================================
# Create orchestrator once
# ============================================================

orchestrator = OrchestratorAgent()


# ============================================================
# PUBLIC ENTRY POINT
# ============================================================

def generate_reply(
    message: str,
    profile: dict | None = None,
    language: str = "en",
) -> dict:
    """
    Full pipeline:

    USER QUERY + PROFILE
        ↓
    Profile completeness check
        ↓ (if minimum fields missing → ask user to fill profile)
    Intent detection  (OrchestratorAgent → IntentDetectionAgent)
        ↓
    Personalized RAG retrieval  (personalization_service)
        → profile scoring + re-ranking → 3–5 results
        ↓
    Intent-type classification  (scheme / job / internship / scholarship)
        ↓
    IBM Granite grounded explanation  (language-aware, profile-context)
        ↓
    Response  (reply + recommended_scheme + recommended_schemes + intent_type)
    """

    message = message.strip()

    if not message:
        return {
            "reply": "Please enter your question.",
            "recommended_scheme": None,
            "recommended_schemes": [],
            "intent_type": "scheme",
            "agent_flow": [],
        }

    logger.info("=" * 60)
    logger.info(f"USER QUERY: {message}")
    logger.info(f"PROFILE: {_summarise_profile(profile)}")
    logger.info("=" * 60)

    # --------------------------------------------------------
    # Step 1: Intent detection
    # --------------------------------------------------------
    orchestration_result = orchestrator.run(query=message, profile=profile)
    intent_result = orchestration_result.get("intent", {})
    agent_result  = orchestration_result.get("agent_result", {})
    intent        = intent_result.get("intent", "general")

    logger.info(f"INTENT: {intent}")

    if not agent_result:
        return {
            "reply": (
                "I couldn't understand your request. "
                "I can help with government schemes, eligibility, "
                "documents, jobs, scholarships and career opportunities."
            ),
            "recommended_scheme": None,
            "recommended_schemes": [],
            "intent_type": "scheme",
            "agent_flow": ["OrchestratorAgent", "IntentDetectionAgent"],
        }

    # --------------------------------------------------------
    # Step 2: Notification — no scheme context needed
    # --------------------------------------------------------
    if intent == "notification":
        notification = agent_result.get("notification", {})
        reply = (
            f"Notification noted for topic: "
            f"{notification.get('topic', 'general')}. "
            "IntelliGov AI will alert you about relevant "
            "government scheme updates and deadlines."
        )
        return {
            "reply": reply,
            "recommended_scheme": None,
            "recommended_schemes": [],
            "intent_type": "notification",
            "agent_flow": ["OrchestratorAgent", "IntentDetectionAgent", "NotificationAgent"],
        }

    # --------------------------------------------------------
    # Step 3: Profile completeness check
    # If profile has NO minimum fields and the user is asking
    # something profile-dependent, nudge them to fill it first
    # rather than returning irrelevant results.
    # --------------------------------------------------------
    pc = get_profile_completeness(profile)
    profile_dependent = intent in ("eligibility", "scheme", "career")

    if profile_dependent and not pc["has_minimum"]:
        logger.info("PROFILE INCOMPLETE — sending fill-profile prompt")
        nudge = build_profile_missing_prompt(pc["missing"], language)
        return {
            "reply": nudge,
            "recommended_scheme": None,
            "recommended_schemes": [],
            "intent_type": "scheme",
            "profile_missing": True,
            "agent_flow": ["OrchestratorAgent", "IntentDetectionAgent"],
        }

    # --------------------------------------------------------
    # Step 4: Personalised retrieval (3–5 ranked results)
    # --------------------------------------------------------
    personalisation = personalise(
        query=message,
        intent=intent,
        profile=profile,
    )

    context      = personalisation["schemes"]
    intent_type  = personalisation["intent_type"]
    missing_flds = personalisation["missing_fields"]

    logger.info(
        f"PERSONALISATION: type={intent_type} "
        f"results={len(context)} "
        f"profile_missing={personalisation['profile_missing']}"
    )

    # --------------------------------------------------------
    # Step 5: Eligibility agent for explicit eligibility queries
    # (use agent's recommended_schemes if it found some)
    # --------------------------------------------------------
    if intent == "eligibility" and agent_result.get("success") is False:
        # Profile present but agent says incomplete — surface message
        return {
            "reply": agent_result.get(
                "message",
                "Please provide your profile details to check eligibility."
            ),
            "recommended_scheme": None,
            "recommended_schemes": [],
            "intent_type": "scheme",
            "agent_flow": ["OrchestratorAgent", "IntentDetectionAgent", "EligibilityAgent"],
        }

    if intent == "eligibility" and agent_result.get("recommended_schemes"):
        elig_schemes = agent_result["recommended_schemes"][:5]
        if elig_schemes:
            context = elig_schemes   # eligibility agent's output takes priority

    # --------------------------------------------------------
    # Step 6: RAG fallback if still empty
    # --------------------------------------------------------
    if not context:
        try:
            rag_results = search_full_schemes(
                query=message,
                top_k=5,
                distance_threshold=2.0,
            )
            context = [
                {k: v for k, v in s.items() if not k.startswith("_rag_")}
                for s in rag_results if s.get("name")
            ][:5]
            logger.info(f"RAG FALLBACK: {len(context)} schemes")
        except Exception as e:
            logger.warning(f"RAG fallback failed: {e}")
            context = []

    if not context:
        logger.info("NO CONTEXT — returning no-data response")
        return {
            "reply": _no_data_reply(language),
            "recommended_scheme": None,
            "recommended_schemes": [],
            "intent_type": intent_type,
            "agent_flow": ["OrchestratorAgent", "IntentDetectionAgent"],
        }

    # --------------------------------------------------------
    # Step 7: IBM Granite — grounded, personalised, language-aware
    # --------------------------------------------------------
    granite_query = _build_granite_query(message, profile, intent_type)

    logger.info(f"GRANITE: {len(context)} scheme(s), lang={language}, type={intent_type}")

    try:
        reply = granite_client.generate(
            query=granite_query,
            context=context,
            language=language,
            intent_type=intent_type,
        )
    except Exception as e:
        logger.error(f"GRANITE ERROR: {e}")
        reply = _safe_context_reply(context, language)

    logger.info(f"REPLY: {reply[:120]}…")

    # --------------------------------------------------------
    # Step 8: Pick best single scheme + return all
    # --------------------------------------------------------
    recommended_scheme = _pick_best_scheme(message, context)

    # Append a soft nudge if important fields missing but results still shown
    if missing_flds and pc["has_minimum"] and not pc["complete"]:
        nudge_fields = [f for f in missing_flds if f not in pc["present"]][:3]
        if nudge_fields:
            labels = {"education": "education", "district": "district",
                      "interests": "interests", "age": "age",
                      "income": "income", "category": "social category"}
            listed = ", ".join(labels.get(f, f) for f in nudge_fields)
            suffix = {
                "en": f"\n\n_Tip: Add {listed} to your Profile for even more accurate results._",
                "hi": f"\n\n_सुझाव: और सटीक परिणामों के लिए अपनी प्रोफ़ाइल में {listed} जोड़ें।_",
                "pa": f"\n\n_ਸੁਝਾਅ: ਹੋਰ ਸਟੀਕ ਨਤੀਜਿਆਂ ਲਈ ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਵਿੱਚ {listed} ਸ਼ਾਮਲ ਕਰੋ।_",
            }
            # All other languages fall back to English nudge
            reply = reply + suffix.get(language, suffix["en"])

    return {
        "reply": reply,
        "recommended_scheme": recommended_scheme,
        "recommended_schemes": context,
        "intent_type": intent_type,
        "agent_flow": [
            "OrchestratorAgent",
            "IntentDetectionAgent",
            agent_result.get("agent", "PersonalizationEngine"),
            "IBMGranite",
        ],
    }


# ============================================================
# HELPERS
# ============================================================

def _summarise_profile(profile: dict | None) -> str:
    if not profile:
        return "none"
    keys = ["age", "state", "occupation", "income", "category"]
    parts = [f"{k}={profile[k]}" for k in keys if profile.get(k)]
    return ", ".join(parts) or "empty"


def _build_granite_query(message: str, profile: dict | None, intent_type: str) -> str:
    """Prepend compact profile context to the user query for Granite."""
    if not profile:
        return message
    parts = []
    for k, label in [
        ("age", "Age"), ("state", "State"), ("occupation", "Occupation"),
        ("income", "Income"), ("category", "Category"),
        ("education", "Education"), ("interests", "Interests"),
    ]:
        v = profile.get(k)
        if v:
            parts.append(f"{label}: {v}")
    if not parts:
        return message
    profile_line = "User: " + ", ".join(parts) + "."
    return f"{profile_line}\n\nQuery: {message}"


def _no_data_reply(language: str) -> str:
    msgs = {
        "en": (
            "I couldn't find enough relevant government scheme information "
            "for your query.\n\nI can help with:\n"
            "• Government schemes (farming, education, health, housing, business)\n"
            "• Scholarships & skill development\n"
            "• Jobs, internships & career opportunities\n"
            "• Scheme eligibility & required documents\n\n"
            "Please try rephrasing or fill your Profile for personalised results."
        ),
        "hi": (
            "आपकी क्वेरी के लिए पर्याप्त जानकारी नहीं मिली।\n\n"
            "मैं इनमें मदद कर सकता हूँ:\n"
            "• सरकारी योजनाएँ • छात्रवृत्ति • नौकरियाँ/इंटर्नशिप • पात्रता जाँच\n\n"
            "कृपया अपनी प्रोफ़ाइल भरें या प्रश्न दोबारा पूछें।"
        ),
        "pa": (
            "ਤੁਹਾਡੀ ਸਵਾਲ ਲਈ ਕਾਫ਼ੀ ਜਾਣਕਾਰੀ ਨਹੀਂ ਮਿਲੀ।\n\n"
            "ਮੈਂ ਇਹਨਾਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:\n"
            "• ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ • ਵਜ਼ੀਫ਼ੇ • ਨੌਕਰੀਆਂ • ਯੋਗਤਾ ਜਾਂਚ\n\n"
            "ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਭਰੋ ਜਾਂ ਸਵਾਲ ਦੁਬਾਰਾ ਪੁੱਛੋ।"
        ),
    }
    # All other Indian languages fall back to English (Granite will translate when active)
    return msgs.get(language, msgs["en"])


def _safe_context_reply(context: list, language: str = "en") -> str:
    """Plain-text grounded fallback when Granite fails."""
    if language == "hi":
        header = "उपलब्ध सरकारी डेटा के आधार पर प्रासंगिक योजनाएँ:\n"
    elif language == "pa":
        header = "ਉਪਲਬਧ ਸਰਕਾਰੀ ਡੇਟਾ ਦੇ ਆਧਾਰ 'ਤੇ ਸੰਬੰਧਿਤ ਯੋਜਨਾਵਾਂ:\n"
    else:
        header = "Based on available government data, relevant schemes:\n"

    lines = [header]
    for i, s in enumerate(context, 1):
        lines.append(f"{i}. {s.get('name', '?')} — {s.get('category', '')}")
        if s.get("benefits"):
            lines.append(f"   Benefits: {s['benefits']}")
        if s.get("eligibility"):
            lines.append(f"   Eligibility: {s['eligibility']}")
        if s.get("deadline"):
            lines.append(f"   Deadline: {s['deadline']}")
        lines.append("")
    return "\n".join(lines)


def _pick_best_scheme(query: str, context: list) -> dict | None:
    """Select the single most query-relevant scheme."""
    if not context:
        return None
    if len(context) == 1:
        return context[0]

    stop = {"what","which","where","when","who","why","how","are","the",
            "for","can","scheme","schemes","government","about","some","please","tell"}
    words = [
        w.strip(".,?!").lower() for w in query.split()
        if len(w.strip(".,?!")) >= 4 and w.strip(".,?!").lower() not in stop
    ]
    if not words:
        return context[0]

    best, best_score = context[0], -1
    for s in context:
        name  = s.get("name", "").lower()
        cat   = s.get("category", "").lower()
        desc  = s.get("description", "").lower()
        score = sum(
            (3 if w in name else 0) + (2 if w in cat else 0) + (1 if w in desc else 0)
            for w in words
        )
        if score > best_score:
            best_score, best = score, s
    return best
