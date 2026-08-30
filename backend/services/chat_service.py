from agents.orchestrator import OrchestratorAgent
from services.granite_service import granite_client
from services.rag_service import search_full_schemes
from core.logger import logger


# ============================================================
# Create orchestrator once
# ============================================================

orchestrator = OrchestratorAgent()


def generate_reply(message: str, profile: dict | None = None):
    """
    Main chat pipeline:

    USER QUERY
        ↓
    Intent detection (OrchestratorAgent)
        ↓
    Dynamic retrieval from schemes.json via ChromaDB RAG
        ↓
    Relevant government schemes
        ↓
    Grounded context
        ↓
    IBM Granite → grounded natural-language response
        ↓
    Final response (reply + recommended_scheme + recommended_schemes)
    """

    message = message.strip()

    # --------------------------------------------------------
    # Empty message
    # --------------------------------------------------------

    if not message:
        return {
            "reply": "Please enter your question.",
            "recommended_scheme": None,
            "recommended_schemes": [],
            "agent_flow": []
        }

    logger.info("=" * 60)
    logger.info(f"USER QUERY: {message}")
    logger.info("=" * 60)

    # --------------------------------------------------------
    # Step 1: Orchestrator — intent detection + agent routing
    # --------------------------------------------------------

    orchestration_result = orchestrator.run(
        query=message,
        profile=profile
    )

    intent_result = orchestration_result.get("intent", {})
    agent_result = orchestration_result.get("agent_result", {})
    intent = intent_result.get("intent", "unknown")

    logger.info(f"INTENT DETECTED: {intent}")
    logger.info(f"AGENT RESULT: success={agent_result.get('success')}, agent={agent_result.get('agent')}")

    # --------------------------------------------------------
    # Step 2: Handle empty agent result
    # --------------------------------------------------------

    if not agent_result:
        logger.info("AGENT RESULT: empty — returning fallback")
        return {
            "reply": (
                "I couldn't understand your request. "
                "I can help with government schemes, eligibility, "
                "documents, jobs and career opportunities."
            ),
            "recommended_scheme": None,
            "recommended_schemes": [],
            "agent_flow": [
                "OrchestratorAgent",
                "IntentDetectionAgent"
            ]
        }

    # --------------------------------------------------------
    # Step 3: Eligibility without profile
    # --------------------------------------------------------

    if (
        intent == "eligibility"
        and agent_result.get("success") is False
    ):
        logger.info("ELIGIBILITY: profile missing — returning prompt")
        return {
            "reply": agent_result.get(
                "message",
                "Please provide your profile details to check eligibility."
            ),
            "recommended_scheme": None,
            "recommended_schemes": [],
            "agent_flow": [
                "OrchestratorAgent",
                "IntentDetectionAgent",
                "EligibilityAgent"
            ]
        }

    # --------------------------------------------------------
    # Step 4: Build scheme context for Granite
    #
    # For every intent, we collect scheme objects from the
    # agent result. If the agent returned no schemes, we
    # fall back to a direct RAG search so that Granite always
    # has context to work with.
    # --------------------------------------------------------

    context = _collect_context(agent_result, intent, message)

    logger.info(f"DOCUMENT RESULTS: {len(context)} scheme(s) with documents")
    logger.info(
        f"FINAL CONTEXT: {len(context)} scheme(s) — "
        + (", ".join(s.get("name", "?") for s in context) if context else "(empty)")
    )

    # --------------------------------------------------------
    # Step 5: Notification — no scheme context needed
    # --------------------------------------------------------

    if intent == "notification":
        notification = agent_result.get("notification", {})
        reply = (
            f"Notification request noted for topic: "
            f"{notification.get('topic', 'general')}. "
            "The IntelliGov AI notification service will alert you "
            "about relevant government scheme updates and deadlines."
        )
        logger.info(f"NOTIFICATION RESPONSE (no Granite needed): {reply[:80]}")
        return {
            "reply": reply,
            "recommended_scheme": None,
            "recommended_schemes": [],
            "agent_flow": [
                "OrchestratorAgent",
                "IntentDetectionAgent",
                "NotificationAgent"
            ]
        }

    # --------------------------------------------------------
    # Step 6: No context found for any intent
    # --------------------------------------------------------

    if not context:
        logger.info("NO SCHEME CONTEXT: returning no-data response")
        return {
            "reply": (
                "The available government scheme data does not contain "
                "enough relevant information to answer your question.\n\n"
                "I can help you with:\n"
                "• Government schemes (farming, education, health, housing, "
                "business, skill development, pension)\n"
                "• Scheme eligibility\n"
                "• Required documents\n"
                "• Career opportunities\n\n"
                "Please try rephrasing your question with one of these topics."
            ),
            "recommended_scheme": None,
            "recommended_schemes": [],
            "agent_flow": [
                "OrchestratorAgent",
                "IntentDetectionAgent",
                agent_result.get("agent", "SpecializedAgent")
            ]
        }

    # --------------------------------------------------------
    # Step 7: Call IBM Granite with grounded context
    # --------------------------------------------------------

    logger.info(f"GRANITE CALLED: generating grounded response with {len(context)} scheme(s)")
    logger.debug(f"GRANITE INPUT - Query: {message}")
    if context:
        logger.debug(f"GRANITE INPUT - First scheme: {context[0].get('name')}, has {len(context[0].get('documents', []))} documents")

    try:
        reply = granite_client.generate(
            query=message,
            context=context
        )
    except Exception as e:
        logger.error(f"GRANITE ERROR: {e}")
        # Safe fallback: build a grounded reply from context directly
        reply = _safe_context_reply(context)

    logger.info(f"GRANITE RESPONSE: {reply[:120]}...")
    logger.info(f"FINAL RESPONSE: {reply[:120]}...")

    # --------------------------------------------------------
    # Step 8: Build recommended_scheme (singular, best match)
    # and recommended_schemes (all results)
    #
    # Pick the scheme whose name + category best matches the
    # user query, rather than always using the first result.
    # --------------------------------------------------------

    recommended_scheme = _pick_best_scheme(message, context)
    recommended_schemes = context

    agent_name = agent_result.get("agent", "SpecializedAgent")

    return {
        "reply": reply,
        "recommended_scheme": recommended_scheme,
        "recommended_schemes": recommended_schemes,
        "agent_flow": [
            "OrchestratorAgent",
            "IntentDetectionAgent",
            agent_name,
            "IBMGranite"
        ]
    }


# ============================================================
# HELPER: collect scheme context from agent_result
# ============================================================

def _collect_context(
    agent_result: dict,
    intent: str,
    query: str
) -> list:
    """
    Extract scheme objects from the agent result.
    Falls back to a direct RAG search when the agent
    returned no scheme data.
    """

    context = []

    logger.info(f"_collect_context: intent={intent}, agent_result keys={list(agent_result.keys())}")

    if isinstance(agent_result, dict):

        # Scheme / eligibility agents return "schemes"
        # or "recommended_schemes"
        schemes = agent_result.get("schemes", [])
        if not schemes:
            schemes = agent_result.get("recommended_schemes", [])
        if isinstance(schemes, list) and schemes:
            context = schemes
            logger.info(f"_collect_context: got {len(schemes)} schemes from agent_result")

    # --------------------------------------------------------
    # RAG fallback: if agent returned no schemes, search
    # directly. This covers career, policy, general, and
    # document intents that may have empty agent scheme lists.
    # --------------------------------------------------------

    if not context:
        try:
            logger.info(f"_collect_context: RAG fallback triggered for intent={intent}")
            # For document queries, use lenient distance threshold
            is_doc_query = (intent == "document")
            # Fetch extra candidates so the distance filter
            # still yields up to 5 relevant results.
            rag_results = search_full_schemes(
                query=query,
                top_k=8,
                is_document_query=is_doc_query,
                prefer_with_documents=is_doc_query
            )
            clean = [
                {k: v for k, v in s.items() if not k.startswith("_rag_")}
                for s in rag_results
                if s.get("name")
            ]
            context = clean[:5]
            logger.info(f"_collect_context: RAG fallback returned {len(context)} schemes")
        except Exception as e:
            logger.warning(f"RAG fallback search failed: {e}")
            context = []

    logger.info(f"_collect_context: returning {len(context)} schemes total")
    return context


# ============================================================
# HELPER: build a grounded fallback reply without Granite
# ============================================================

def _safe_context_reply(context: list) -> str:
    """
    Generates a plain-text grounded answer from scheme
    context objects. Used only when Granite itself fails.
    """

    lines = [
        "Based on the available government scheme data, "
        "the following schemes may be relevant:\n"
    ]

    for i, scheme in enumerate(context, start=1):
        name = scheme.get("name", "Unknown Scheme")
        category = scheme.get("category", "General")
        description = scheme.get("description", "")
        eligibility = scheme.get("eligibility", "")
        documents = scheme.get("documents", [])

        lines.append(f"{i}. {name} ({category})")
        if description:
            lines.append(f"   Description: {description}")
        if eligibility:
            lines.append(f"   Eligibility: {eligibility}")
        if documents:
            lines.append(
                "   Documents: " + ", ".join(documents)
            )
        lines.append("")

    lines.append(
        "Please verify the latest official requirements "
        "before applying."
    )

    return "\n".join(lines)


# ============================================================
# HELPER: pick the single best-matching scheme for the query
# ============================================================

def _pick_best_scheme(query: str, context: list) -> dict | None:
    """
    Select the most query-relevant scheme from the retrieved context.

    Scoring (higher = better match):
    - +3  for each query word found in the scheme name
    - +2  for each query word found in the scheme category
    - +1  for each query word found in the scheme description
    - tie-break: keep the first scheme (already sorted by RAG score)
    """

    if not context:
        return None

    if len(context) == 1:
        return context[0]

    query_words = [
        w.strip(".,?!").lower()
        for w in query.split()
        if len(w.strip(".,?!")) >= 4
    ]

    # Stop words that add no signal
    _stop = {
        "what", "which", "where", "when", "who", "why", "how",
        "are", "the", "for", "can", "scheme", "schemes",
        "government", "about", "some", "please", "tell",
    }
    query_words = [w for w in query_words if w not in _stop]

    if not query_words:
        return context[0]

    best_scheme = context[0]
    best_score = -1

    for scheme in context:
        name = scheme.get("name", "").lower()
        category = scheme.get("category", "").lower()
        description = scheme.get("description", "").lower()

        score = 0
        for word in query_words:
            if word in name:
                score += 3
            if word in category:
                score += 2
            if word in description:
                score += 1

        if score > best_score:
            best_score = score
            best_scheme = scheme

    return best_scheme
