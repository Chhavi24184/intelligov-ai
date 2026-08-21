from agents.orchestrator import OrchestratorAgent
from services.granite_service import granite_client


# Create orchestrator once
orchestrator = OrchestratorAgent()


def generate_reply(message: str, profile: dict | None = None):

    message = message.strip()

    # --------------------------------
    # Empty message fallback
    # --------------------------------

    if not message:
        return {
            "reply": "Please enter your question.",
            "recommended_schemes": [],
            "agent_flow": []
        }

    # --------------------------------
    # Step 1: Orchestrator
    # --------------------------------

    orchestration_result = orchestrator.run(
        query=message,
        profile=profile
    )

    intent_result = orchestration_result.get("intent", {})
    agent_result = orchestration_result.get("agent_result", {})

    intent = intent_result.get("intent", "unknown")

    # --------------------------------
    # Step 2: Handle fallback
    # --------------------------------

    if not agent_result:
        return {
            "reply": (
                "I couldn't understand your request. "
                "I can help with government schemes, eligibility, "
                "documents, jobs and career opportunities."
            ),
            "recommended_schemes": [],
            "agent_flow": [
                "OrchestratorAgent",
                "IntentDetectionAgent"
            ]
        }

    # --------------------------------
    # Step 3: Eligibility without profile
    # --------------------------------

    if (
        intent == "eligibility"
        and agent_result.get("success") is False
    ):
        return {
            "reply": agent_result.get(
                "message",
                "Please provide your profile details to check eligibility."
            ),
            "recommended_schemes": [],
            "agent_flow": [
                "OrchestratorAgent",
                "IntentDetectionAgent",
                "EligibilityAgent"
            ]
        }

    # --------------------------------
    # Step 4: Prepare RAG context
    # --------------------------------

    context = []

    if isinstance(agent_result, dict):

        # Scheme / eligibility agents
        schemes = agent_result.get("schemes", [])

        if not schemes:
            schemes = agent_result.get(
                "recommended_schemes",
                []
            )

        if isinstance(schemes, list):
            context = schemes

    # --------------------------------
    # Step 5: Document Assistance
    # --------------------------------

    if intent == "document":

        documents = agent_result.get(
            "documents",
            []
        )

        scheme = agent_result.get(
            "scheme",
            None
        )

        # If specific scheme and documents are available
        if scheme and documents:

            reply = (
                f"For {scheme}, the commonly required documents are:\n\n"
                + "\n".join(
                    f"{i}. {doc}"
                    for i, doc in enumerate(
                        documents,
                        start=1
                    )
                )
                + (
                    "\n\nExact requirements may vary depending "
                    "on the scheme and application process."
                )
            )

            recommended_schemes = [
                {
                    "name": scheme,
                    "documents": documents
                }
            ]

        else:

            reply = agent_result.get(
                "message",
                (
                    "These are commonly required documents. "
                    "Exact requirements may vary by scheme."
                )
            )

            recommended_schemes = []

    # --------------------------------
    # Step 6: Granite grounded response
    # --------------------------------

    elif context:

        reply = granite_client.generate(
            query=message,
            context=context
        )

        recommended_schemes = context

    # --------------------------------
    # Step 7: Career / fallback response
    # --------------------------------

    else:

        reply = agent_result.get(
            "message",
            "I found information relevant to your request."
        )

        recommended_schemes = []

        # Career agent may return recommendations
        if agent_result.get("recommendations"):

            reply = (
                "Here are some relevant career opportunities: "
                + ", ".join(
                    agent_result["recommendations"]
                )
            )

    # --------------------------------
    # Step 8: Return final response
    # --------------------------------

    return {
        "reply": reply,
        "recommended_schemes": recommended_schemes,
        "agent_flow": [
            "OrchestratorAgent",
            "IntentDetectionAgent",
            agent_result.get(
                "agent",
                "SpecializedAgent"
            ),
            (
                "Granite"
                if context and intent != "documents"
                else "SpecializedAgent"
            )
        ]
    }
