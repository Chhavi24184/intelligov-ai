from services.rag_service import search_full_schemes
from services.granite_service import granite_client


class PolicyExplanationAgent:
    """
    Explains government schemes using retrieved
    government scheme data.
    """

    def run(self, query: str) -> dict:

        # ============================================================
        # 1. Validate Query
        # ============================================================

        if not query or not query.strip():

            return {
                "agent": "PolicyExplanationAgent",
                "success": False,
                "query": query,
                "schemes": [],
                "explanation": "",
                "message": "Please provide a valid policy or scheme query."
            }

        query = query.strip()

        # ============================================================
        # 2. Retrieve Relevant Schemes using RAG
        # ============================================================

        try:

            schemes = search_full_schemes(
                query=query,
                top_k=3
            )

        except Exception as e:

            print(
                f"Policy RAG retrieval warning: {e}"
            )

            schemes = []

        # ============================================================
        # 3. No Relevant Scheme Found
        # ============================================================

        if not schemes:

            return {
                "agent": "PolicyExplanationAgent",
                "success": True,
                "query": query,
                "schemes": [],
                "explanation": "",
                "message": (
                    "I could not find a relevant government scheme "
                    "in the available government scheme database."
                )
            }

        # ============================================================
        # 4. Generate Grounded Explanation
        # ============================================================

        try:

            explanation = granite_client.generate(
                query,
                schemes
            )

        except Exception as e:

            print(
                f"Granite generation warning: {e}"
            )

            explanation = (
                "Relevant government scheme information was found, "
                "but an explanation could not be generated."
            )

        # ============================================================
        # 5. Return Result
        # ============================================================

        return {
            "agent": "PolicyExplanationAgent",
            "success": True,
            "query": query,
            "schemes": schemes,
            "explanation": explanation,
            "count": len(schemes),
            "message": (
                "Policy explanation generated using "
                "RAG-grounded government scheme data."
            )
        }