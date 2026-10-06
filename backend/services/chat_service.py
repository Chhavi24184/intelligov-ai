import re
from agents.orchestrator import OrchestratorAgent
from services.granite_service import granite_client
from services.rag_service import search_full_schemes, _MAX_RELEVANT_DISTANCE
from services.personalization_service import (
    personalise,
    get_profile_completeness,
    build_profile_missing_prompt,
)
from core.logger import logger
from agents.document_agent import DocumentAssistanceAgent
from services.scheme_service import get_all_schemes


# ============================================================
# Language Detection
# ============================================================

def _detect_language_from_text(text: str, requested_language: str = "en") -> str:
    """
    Automatically detect common Indian scripts when the frontend
    sends the default English language.

    This keeps the existing language pipeline unchanged while
    ensuring Hindi/Punjabi messages reach Granite with the
    correct language instruction.
    """
    if re.search(r"[\u0900-\u097F]", text):
        return "hi"

    if re.search(r"[\u0A00-\u0A7F]", text):
        return "pa"

    return requested_language or "en"


# ============================================================
# Conversational Missing Profile Prompt
# ============================================================

def _build_conversational_missing_prompt(
    missing_fields: list,
    language: str = "en",
) -> str:
    labels = {
        "age": {"en": "age", "hi": "उम्र", "pa": "ਉਮਰ"},
        "occupation": {"en": "occupation", "hi": "पेशा", "pa": "ਪੇਸ਼ਾ"},
        "income": {"en": "annual family income", "hi": "वार्षिक पारिवारिक आय", "pa": "ਸਾਲਾਨਾ ਪਰਿਵਾਰਕ ਆਮਦਨ"},
        "gender": {"en": "gender", "hi": "लिंग", "pa": "ਲਿੰਗ"},
        "state": {"en": "state", "hi": "राज्य", "pa": "ਰਾਜ"},
        "education": {"en": "education", "hi": "शिक्षा", "pa": "ਸਿੱਖਿਆ"},
        "category": {"en": "social category", "hi": "सामाजिक श्रेणी", "pa": "ਸਮਾਜਿਕ ਸ਼੍ਰੇਣੀ"},
        "district": {"en": "district", "hi": "जिला", "pa": "ਜ਼ਿਲ੍ਹਾ"},
    }

    missing = list(dict.fromkeys(missing_fields))
    if not missing:
        return ""

    if language == "hi":
        names = [labels.get(field, {}).get("hi", field) for field in missing]
        if len(names) == 1:
            return f"पात्रता जाँचने के लिए कृपया अपनी {names[0]} बताएं।"
        return "पात्रता जाँचने के लिए कृपया ये जानकारी दें: " + ", ".join(names) + "।"

    if language == "pa":
        names = [labels.get(field, {}).get("pa", field) for field in missing]
        if len(names) == 1:
            return f"ਯੋਗਤਾ ਦੀ ਜਾਂਚ ਕਰਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ {names[0]} ਦੱਸੋ।"
        return "ਯੋਗਤਾ ਦੀ ਜਾਂਚ ਕਰਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਇਹ ਜਾਣਕਾਰੀ ਦਿਓ: " + ", ".join(names) + "।"

    names = [labels.get(field, {}).get("en", field) for field in missing]
    if len(names) == 1:
        return f"To check your eligibility, please provide your {names[0]}."
    if len(names) == 2:
        requested = f"{names[0]} and {names[1]}"
    else:
        requested = ", ".join(names[:-1]) + f", and {names[-1]}"
    return f"To check your eligibility, please provide your {requested}."


# ============================================================
# Scheme Comparison
# ============================================================

def _compare_schemes(message: str, language: str = "en") -> dict:
    schemes = get_all_schemes()

    if not schemes:
        return {"success": False, "message": "No scheme data is currently available.", "schemes": []}

    query = message.lower()
    matched = []

    for scheme in schemes:
        name = str(scheme.get("name", "")).strip()
        if not name:
            continue
        name_lower = name.lower()
        if name_lower in query:
            matched.append(scheme)
            continue
        tokens = [token for token in name_lower.replace("-", " ").split() if len(token) >= 4]
        if tokens and all(token in query for token in tokens):
            matched.append(scheme)

    unique = []
    seen = set()
    for scheme in matched:
        scheme_id = str(scheme.get("id", scheme.get("name", "")))
        if scheme_id in seen:
            continue
        seen.add(scheme_id)
        unique.append(scheme)

    matched = unique[:2]

    if len(matched) < 2:
        return {
            "success": False,
            "message": "Please mention the names of two government schemes you want to compare.",
            "schemes": matched,
        }

    first, second = matched
    comparison = {
        "scheme_1": {
            "name": first.get("name", ""),
            "category": first.get("category", ""),
            "description": first.get("description", ""),
            "benefits": first.get("benefits", ""),
            "eligibility": first.get("eligibility", ""),
            "documents": first.get("documents", []),
            "deadline": first.get("deadline", ""),
            "official_url": first.get("official_url", ""),
        },
        "scheme_2": {
            "name": second.get("name", ""),
            "category": second.get("category", ""),
            "description": second.get("description", ""),
            "benefits": second.get("benefits", ""),
            "eligibility": second.get("eligibility", ""),
            "documents": second.get("documents", []),
            "deadline": second.get("deadline", ""),
            "official_url": second.get("official_url", ""),
        },
    }

    return {
        "success": True,
        "message": "Scheme comparison generated successfully.",
        "schemes": matched,
        "comparison": comparison,
    }


orchestrator = OrchestratorAgent()
document_agent = DocumentAssistanceAgent()


# ============================================================
# Conversational Profile Extraction
# ============================================================

def _extract_profile_from_message(message: str, profile: dict | None = None) -> dict:
    result = dict(profile or {})
    text = message.lower()

    age_match = re.search(
        r"\b(?:age\s*(?:is|:)?\s*|i\s*am\s+|i'm\s+)(\d{1,3})\s*(?:years?|yrs?)?\b",
        text
    )
    if age_match:
        age = int(age_match.group(1))
        if 1 <= age <= 120:
            result["age"] = age

    income_match = re.search(
        r"(?:income|family income|annual income|yearly income)\s*(?:is|of|:)?\s*(?:rs\.?|₹)?\s*([\d,.]+)\s*(lakh|lakhs|lacs|crore|crores)?",
        text
    )
    if income_match:
        amount = income_match.group(1).replace(",", "")
        unit = (income_match.group(2) or "").lower()
        try:
            value = float(amount)
            if unit in ("lakh", "lakhs", "lacs"):
                value *= 100000
            elif unit in ("crore", "crores"):
                value *= 10000000
            result["income"] = str(int(value))
        except ValueError:
            pass

    if re.search(r"\b(female|woman|women|girl|lady)\b", text):
        result["gender"] = "female"
    elif re.search(r"\b(male|man|men|boy)\b", text):
        result["gender"] = "male"

    occupation_map = {
        "student": "student", "students": "student", "farmer": "farmer",
        "farmers": "farmer", "teacher": "teacher", "teachers": "teacher",
        "job seeker": "job seeker", "jobseeker": "job seeker",
        "unemployed": "unemployed", "business owner": "business owner",
        "businessman": "business owner", "businesswoman": "business owner",
        "entrepreneur": "entrepreneur", "artisan": "artisan",
        "street vendor": "street vendor", "vendor": "street vendor",
        "worker": "worker",
    }
    for keyword, occupation in occupation_map.items():
        if re.search(r"\b" + re.escape(keyword) + r"\b", text):
            result["occupation"] = occupation
            break

    document_map = {
        "aadhaar": "Aadhaar Card", "aadhar": "Aadhaar Card",
        "aadhaar card": "Aadhaar Card", "aadhar card": "Aadhaar Card",
        "pan": "PAN Card", "pan card": "PAN Card",
        "bank account": "Bank Account", "bank passbook": "Bank Passbook",
        "passbook": "Bank Passbook", "income certificate": "Income Certificate",
        "income proof": "Income Certificate", "land records": "Land Records",
        "land record": "Land Records", "ration card": "Ration Card",
        "address proof": "Address Proof", "educational certificate": "Educational Certificate",
        "education certificate": "Educational Certificate", "marksheet": "Marksheet",
        "voter id": "Voter ID", "voter card": "Voter ID",
        "disability certificate": "Disability Certificate",
    }

    detected_documents = list(result.get("available_documents") or result.get("documents") or [])
    for keyword, document_name in document_map.items():
        if re.search(r"\b" + re.escape(keyword) + r"\b", text):
            if document_name not in detected_documents:
                detected_documents.append(document_name)
    if detected_documents:
        result["available_documents"] = detected_documents

    states = [
        "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
        "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand",
        "karnataka", "kerala", "madhya pradesh", "maharashtra", "manipur",
        "meghalaya", "mizoram", "nagaland", "odisha", "punjab", "rajasthan",
        "sikkim", "tamil nadu", "telangana", "tripura", "uttar pradesh",
        "uttarakhand", "west bengal", "delhi", "jammu and kashmir", "ladakh",
        "chandigarh", "puducherry",
    ]
    for state in sorted(states, key=len, reverse=True):
        if re.search(r"\b" + re.escape(state) + r"\b", text):
            result["state"] = state.title()
            break

    return result


# ============================================================
# PUBLIC ENTRY POINT
# ============================================================

def generate_reply(
    message: str,
    profile: dict | None = None,
    language: str = "en",
) -> dict:
    message = message.strip()

    if not message:
        return {
            "reply": "Please enter your question.",
            "recommended_scheme": None,
            "recommended_schemes": [],
            "intent_type": "scheme",
            "agent_flow": [],
        }

    # Detect script before any early return so every downstream
    # response/agent receives the correct language.
    language = _detect_language_from_text(message, language)

    profile = _extract_profile_from_message(message, profile)

    logger.info("=" * 60)
    logger.info(f"USER QUERY: {message}")
    logger.info(f"DETECTED LANGUAGE: {language}")
    logger.info(f"PROFILE: {_summarise_profile(profile)}")
    logger.info("=" * 60)

    orchestration_result = orchestrator.run(query=message, profile=profile)
    intent_result = orchestration_result.get("intent", {})
    agent_result = orchestration_result.get("agent_result", {})
    intent = intent_result.get("intent", "general")

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

    if intent == "comparison":
        comparison_result = _compare_schemes(message, language)

        if not comparison_result["success"]:
            return {
                "reply": comparison_result["message"],
                "recommended_scheme": None,
                "recommended_schemes": comparison_result.get("schemes", []),
                "intent_type": "comparison",
                "comparison": comparison_result,
                "agent_flow": [
                    "OrchestratorAgent",
                    "IntentDetectionAgent",
                    "SchemeComparisonAgent",
                ],
            }

        comparison_context = comparison_result["schemes"]
        granite_query = (
            "Compare these two government schemes clearly. "
            "Explain the main differences in eligibility, benefits, "
            "documents, target beneficiaries, and application/deadline "
            "information. Do not invent facts. Use only the supplied "
            "scheme data.\n\n"
            f"User query: {message}"
        )

        try:
            reply = granite_client.generate(
                query=granite_query,
                context=comparison_context,
                language=language,
                intent_type="comparison",
            )
        except Exception as e:
            logger.error(f"COMPARISON GRANITE ERROR: {e}")
            reply = (
                f"{comparison_context[0].get('name', 'Scheme 1')} vs "
                f"{comparison_context[1].get('name', 'Scheme 2')}\n\n"
                f"Eligibility:\n"
                f"• {comparison_context[0].get('eligibility', 'Not available')}\n"
                f"• {comparison_context[1].get('eligibility', 'Not available')}\n\n"
                f"Benefits:\n"
                f"• {comparison_context[0].get('benefits', 'Not available')}\n"
                f"• {comparison_context[1].get('benefits', 'Not available')}"
            )

        return {
            "reply": reply,
            "recommended_scheme": comparison_context[0],
            "recommended_schemes": comparison_context,
            "intent_type": "comparison",
            "comparison": comparison_result["comparison"],
            "agent_flow": [
                "OrchestratorAgent",
                "IntentDetectionAgent",
                "SchemeComparisonAgent",
                "IBMGranite",
            ],
        }

    if intent == "document":
        available_documents = (
            profile.get("available_documents")
            or profile.get("documents")
            or _extract_profile_from_message(message).get("available_documents", [])
        )
        document_result = document_agent.run(query=message, available_documents=available_documents)
        schemes = document_result.get("schemes", [])

        return {
            "reply": document_result.get("message", "Document information retrieved successfully."),
            "recommended_scheme": schemes[0] if schemes else None,
            "recommended_schemes": schemes,
            "intent_type": "document",
            "document_eligibility": document_result.get("document_eligibility", []),
            "available_documents": document_result.get("available_documents", []),
            "agent_flow": [
                "OrchestratorAgent",
                "IntentDetectionAgent",
                "DocumentAssistanceAgent",
            ],
        }

    pc = get_profile_completeness(profile)
    profile_dependent = intent in ("eligibility", "scheme", "career")

    if profile_dependent and not pc["has_minimum"]:
        logger.info("PROFILE INCOMPLETE — asking for missing conversational fields")
        nudge = _build_conversational_missing_prompt(pc["missing"], language)
        return {
            "reply": nudge,
            "recommended_scheme": None,
            "recommended_schemes": [],
            "intent_type": "scheme",
            "profile_missing": True,
            "missing_fields": pc["missing"],
            "agent_flow": ["OrchestratorAgent", "IntentDetectionAgent"],
        }

    personalisation = personalise(query=message, intent=intent, profile=profile)
    context = personalisation["schemes"]
    intent_type = personalisation["intent_type"]
    missing_flds = personalisation["missing_fields"]

    logger.info(
        f"PERSONALISATION: type={intent_type} results={len(context)} "
        f"profile_missing={personalisation['profile_missing']}"
    )

    if intent == "eligibility" and agent_result.get("success") is False:
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
            context = elig_schemes

    if not context:
        try:
            rag_results = search_full_schemes(query=message, top_k=5, distance_threshold=2.0)
            context = [
                {k: v for k, v in s.items() if not k.startswith("_rag_")}
                for s in rag_results if s.get("name")
            ][:5]
            logger.info(f"RAG FALLBACK: {len(context)} schemes")
        except Exception as e:
            logger.warning(f"RAG fallback failed: {e}")
            context = []

    if not context:
        return {
            "reply": _no_data_reply(language),
            "recommended_scheme": None,
            "recommended_schemes": [],
            "intent_type": intent_type,
            "agent_flow": ["OrchestratorAgent", "IntentDetectionAgent"],
        }

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

    recommended_scheme = _pick_best_scheme(message, context)

    if missing_flds and pc["has_minimum"] and not pc["complete"]:
        nudge_fields = [f for f in missing_flds if f not in pc["present"]][:3]
        if nudge_fields:
            labels = {
                "education": "education", "district": "district",
                "interests": "interests", "age": "age",
                "income": "income", "category": "social category",
            }
            suffix = {
                "en": f"\n\n_Tip: Add {', '.join(labels.get(f, f) for f in nudge_fields)} to your Profile for even more accurate results._",
                "hi": f"\n\n_सुझाव: और सटीक परिणामों के लिए अपनी प्रोफ़ाइल में {', '.join(labels.get(f, f) for f in nudge_fields)} जोड़ें।_",
                "pa": f"\n\n_ਸੁਝਾਅ: ਹੋਰ ਸਟੀਕ ਨਤੀਜਿਆਂ ਲਈ ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਵਿੱਚ {', '.join(labels.get(f, f) for f in nudge_fields)} ਸ਼ਾਮਲ ਕਰੋ._",
            }
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
    return msgs.get(language, msgs["en"])


def _safe_context_reply(context: list, language: str = "en") -> str:
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
        name = s.get("name", "").lower()
        cat = s.get("category", "").lower()
        desc = s.get("description", "").lower()
        score = sum(
            (3 if w in name else 0) + (2 if w in cat else 0) + (1 if w in desc else 0)
            for w in words
        )
        if score > best_score:
            best_score, best = score, s
    return best
