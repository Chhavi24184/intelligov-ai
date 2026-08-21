from agents.intent_agent import IntentDetectionAgent
from agents.schemes_agent import SchemeRecommendationAgent
from agents.eligibility_agent import EligibilityAgent
from agents.document_agent import DocumentAssistanceAgent
from agents.career_agent import CareerAgent


class OrchestratorAgent:
    """
    Master Orchestrator Agent.

    Responsibilities:
    1. Validate user query
    2. Detect user intent
    3. Route query to the correct specialized agent
    4. Pass user profile when required
    5. Return a standardized orchestration result
    """

    def __init__(self):

        # ========================================================
        # Initialize Specialized Agents
        # ========================================================

        self.intent_agent = IntentDetectionAgent()

        self.scheme_agent = SchemeRecommendationAgent()

        self.eligibility_agent = EligibilityAgent()

        self.document_agent = DocumentAssistanceAgent()

        self.career_agent = CareerAgent()

    # ============================================================
    # MAIN ORCHESTRATION METHOD
    # ============================================================

    def run(
        self,
        query: str,
        profile: dict | None = None
    ) -> dict:

        # ========================================================
        # Step 1: Validate Query
        # ========================================================

        if not query or not query.strip():

            return {
                "success": False,
                "query": query,
                "intent": {
                    "agent": "IntentDetectionAgent",
                    "intent": "unknown",
                    "confidence": 0.0
                },
                "agent_flow": [
                    "OrchestratorAgent"
                ],
                "agent_result": {
                    "agent": "OrchestratorAgent",
                    "success": False,
                    "message": "Please provide a valid query."
                }
            }

        # Normalize query

        query = query.strip()

        # ========================================================
        # Step 2: Intent Detection
        # ========================================================

        try:

            intent_result = self.intent_agent.run(query)

        except Exception as e:

            return {
                "success": False,
                "query": query,
                "intent": {
                    "agent": "IntentDetectionAgent",
                    "intent": "unknown",
                    "confidence": 0.0
                },
                "agent_flow": [
                    "OrchestratorAgent",
                    "IntentDetectionAgent"
                ],
                "agent_result": {
                    "agent": "IntentDetectionAgent",
                    "success": False,
                    "message": (
                        "Unable to detect the intent of your request."
                    ),
                    "error": str(e)
                }
            }

        intent = intent_result.get(
            "intent",
            "general"
        )

        # ========================================================
        # Step 3: Initialize Agent Flow
        # ========================================================

        agent_flow = [
            "OrchestratorAgent",
            "IntentDetectionAgent"
        ]

        agent_result = None

        # ========================================================
        # Step 4: Route Scheme Queries
        # ========================================================

        if intent == "scheme":

            agent_flow.append(
                "SchemeRecommendationAgent"
            )

            try:

                agent_result = self.scheme_agent.run(
                    query
                )

            except Exception as e:

                agent_result = {
                    "agent": "SchemeRecommendationAgent",
                    "success": False,
                    "schemes": [],
                    "message": (
                        "Unable to retrieve government schemes "
                        "at the moment."
                    ),
                    "error": str(e)
                }

        # ========================================================
        # Step 5: Route Eligibility Queries
        # ========================================================

        elif intent == "eligibility":

            agent_flow.append(
                "EligibilityAgent"
            )

            # ----------------------------------------------------
            # Profile is required for eligibility checking
            # ----------------------------------------------------

            if not profile:

                agent_result = {
                    "agent": "EligibilityAgent",
                    "success": False,
                    "message": (
                        "Please provide your age, occupation, "
                        "income, gender and state to check "
                        "eligibility."
                    )
                }

            else:

                try:

                    agent_result = self.eligibility_agent.run(
                        profile
                    )

                except Exception as e:

                    agent_result = {
                        "agent": "EligibilityAgent",
                        "success": False,
                        "message": (
                            "Unable to check eligibility "
                            "at the moment."
                        ),
                        "error": str(e)
                    }

        # ========================================================
        # Step 6: Route Document Queries
        # ========================================================

        elif intent == "document":

            agent_flow.append(
                "DocumentAssistanceAgent"
            )

            try:

                agent_result = self.document_agent.run(
                    query
                )

            except Exception as e:

                agent_result = {
                    "agent": "DocumentAssistanceAgent",
                    "success": False,
                    "message": (
                        "Unable to retrieve document "
                        "requirements at the moment."
                    ),
                    "error": str(e)
                }

        # ========================================================
        # Step 7: Route Career Queries
        # ========================================================

        elif intent == "career":

            agent_flow.append(
                "CareerAgent"
            )

            try:

                agent_result = self.career_agent.run(
                    query,
                    profile
                )

            except Exception as e:

                agent_result = {
                    "agent": "CareerAgent",
                    "success": False,
                    "recommendations": [],
                    "message": (
                        "Unable to retrieve career opportunities "
                        "at the moment."
                    ),
                    "error": str(e)
                }

        # ========================================================
        # Step 8: General / Unknown Query
        # ========================================================

        else:

            agent_flow.append(
                "GeneralFallback"
            )

            agent_result = {
                "agent": "OrchestratorAgent",
                "success": True,
                "message": (
                    "I can help you with government schemes, "
                    "eligibility, required documents, jobs, "
                    "employment and career opportunities."
                )
            }

        # ========================================================
        # Step 9: Standardized Final Result
        # ========================================================

        return {
            "success": True,
            "query": query,
            "intent": intent_result,
            "agent_flow": agent_flow,
            "agent_result": agent_result
        }


# ================================================================
# Shared Orchestrator Instance
# ================================================================

orchestrator = OrchestratorAgent()