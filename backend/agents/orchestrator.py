from agents.intent_agent import IntentDetectionAgent
from agents.schemes_agent import SchemeRecommendationAgent
from agents.eligibility_agent import EligibilityAgent
from agents.document_agent import DocumentAssistanceAgent
from agents.career_agent import CareerAgent
from agents.policy_agent import PolicyExplanationAgent
from agents.notification_agent import NotificationAgent


class OrchestratorAgent:
    """
    Master Orchestrator Agent.

    Responsibilities:
    1. Receive user query
    2. Detect user intent
    3. Route query to the appropriate specialized agent
    4. Track agent execution flow
    5. Return a unified response
    """

    def __init__(self):

        # ============================================================
        # Initialize Agents
        # ============================================================

        self.intent_agent = IntentDetectionAgent()

        self.scheme_agent = SchemeRecommendationAgent()

        self.eligibility_agent = EligibilityAgent()

        self.document_agent = DocumentAssistanceAgent()

        self.career_agent = CareerAgent()

        self.policy_agent = PolicyExplanationAgent()

        self.notification_agent = NotificationAgent()

    # ================================================================
    # MAIN ORCHESTRATOR
    # ================================================================

    def run(
        self,
        query: str,
        profile: dict | None = None,
        user_id: int | None = None
    ) -> dict:

        # ============================================================
        # 1. Validate Query
        # ============================================================

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

        query = query.strip()

        # ============================================================
        # 2. Initialize Agent Flow
        # ============================================================

        agent_flow = [
            "OrchestratorAgent"
        ]

        # ============================================================
        # 3. Intent Detection
        # ============================================================

        intent_result = self.intent_agent.run(query)

        agent_flow.append(
            "IntentDetectionAgent"
        )

        intent = intent_result.get(
            "intent",
            "general"
        )

        # ============================================================
        # 4. Route Query
        # ============================================================

        # ------------------------------------------------------------
        # SCHEME
        # ------------------------------------------------------------

        if intent == "scheme":

            agent_flow.append(
                "SchemeRecommendationAgent"
            )

            agent_result = self.scheme_agent.run(
                query
            )

        # ------------------------------------------------------------
        # ELIGIBILITY
        # ------------------------------------------------------------

        elif intent == "eligibility":

            agent_flow.append(
                "EligibilityAgent"
            )

            if profile:

                agent_result = self.eligibility_agent.run(
                    profile
                )

            else:

                agent_result = {
                    "agent": "EligibilityAgent",
                    "success": False,
                    "message": (
                        "Please provide age, occupation, income, "
                        "gender and state to check eligibility."
                    )
                }

        # ------------------------------------------------------------
        # DOCUMENT
        # ------------------------------------------------------------

        elif intent == "document":

            agent_flow.append(
                "DocumentAssistanceAgent"
            )

            agent_result = self.document_agent.run(
                query
            )

        # ------------------------------------------------------------
        # CAREER
        # ------------------------------------------------------------

        elif intent == "career":

            agent_flow.append(
                "CareerAgent"
            )

            agent_result = self.career_agent.run(
                query,
                profile
            )

        # ------------------------------------------------------------
        # POLICY EXPLANATION
        # ------------------------------------------------------------

        elif intent == "policy":

            agent_flow.append(
                "PolicyExplanationAgent"
            )

            agent_result = self.policy_agent.run(
                query
            )

        # ------------------------------------------------------------
        # NOTIFICATION
        # ------------------------------------------------------------

        elif intent == "notification":

            agent_flow.append(
                "NotificationAgent"
            )

            agent_result = self.notification_agent.run(
                query,
                user_id
            )

        # ------------------------------------------------------------
        # GENERAL FALLBACK
        # ------------------------------------------------------------

        else:

            agent_flow.append(
                "OrchestratorFallback"
            )

            agent_result = {
                "agent": "OrchestratorAgent",
                "success": True,
                "message": (
                    "I couldn't identify a specific request. "
                    "Please ask about government schemes, "
                    "eligibility, documents, jobs, careers, "
                    "policy information, or notifications."
                )
            }

        # ============================================================
        # 5. Final Unified Response
        # ============================================================

        return {
            "success": True,
            "query": query,
            "intent": intent_result,
            "agent_flow": agent_flow,
            "agent_result": agent_result
        }