from agents.intent_agent import IntentDetectionAgent
from agents.schemes_agent import SchemeRecommendationAgent
from agents.eligibility_agent import EligibilityAgent
from agents.document_agent import DocumentAssistanceAgent
from agents.career_agent import CareerAgent


class OrchestratorAgent:
    """
    Master agent that routes user queries to the appropriate
    specialized agent.
    """

    def __init__(self):

        self.intent_agent = IntentDetectionAgent()
        self.scheme_agent = SchemeRecommendationAgent()
        self.eligibility_agent = EligibilityAgent()
        self.document_agent = DocumentAssistanceAgent()
        self.career_agent = CareerAgent()

    def run(
        self,
        query: str,
        profile: dict | None = None
    ) -> dict:

        # --------------------------------
        # Step 1: Detect Intent
        # --------------------------------

        intent_result = self.intent_agent.run(query)

        intent = intent_result["intent"]

        # --------------------------------
        # Step 2: Route to Agent
        # --------------------------------

        agent_result = {}

        if intent == "scheme":

            agent_result = self.scheme_agent.run(query)

        elif intent == "eligibility":

            if profile:

                agent_result = self.eligibility_agent.run(profile)

            else:

                agent_result = {
                    "agent": "EligibilityAgent",
                    "success": False,
                    "message": (
                        "Please provide age, occupation, income, "
                        "gender and state to check eligibility."
                    )
                }

        elif intent == "document":

            agent_result = self.document_agent.run(query)

        elif intent == "career":

            agent_result = self.career_agent.run(
                query,
                profile
            )

        else:

            agent_result = {
                "agent": "OrchestratorAgent",
                "success": True,
                "message": (
                    "I can help you with government schemes, "
                    "eligibility, documents, jobs and career opportunities."
                )
            }

        # --------------------------------
        # Step 3: Final Response
        # --------------------------------

        return {
            "success": True,
            "query": query,
            "intent": intent_result,
            "agent_result": agent_result
        }