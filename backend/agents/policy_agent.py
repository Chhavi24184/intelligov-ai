from services.rag_service import search_full_schemes


class PolicyExplanationAgent:
    """
    Retrieves relevant government schemes for policy/explanation
    queries. Granite generation is handled centrally by
    chat_service to avoid duplicate LLM calls.
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
                "message": "Please provide a valid policy or scheme query."
            }

        query = query.strip()

        # ============================================================
        # 2. Retrieve Relevant Schemes using RAG
        # ============================================================

        try:

            schemes = search_full_schemes(
                query=query,
                top_k=5
            )

        except Exception as e:

            print(
                f"Policy RAG retrieval warning: {e}"
            )

            schemes = []

        # ============================================================
        # 3. Clean internal RAG metadata before returning
        # ============================================================

        clean_schemes = [
            {k: v for k, v in s.items() if not k.startswith("_rag_")}
            for s in schemes
            if s.get("name")
        ]

        # ============================================================
        # 4. Return Result — Granite is called by chat_service
        # ============================================================

        return {
            "agent": "PolicyExplanationAgent",
            "success": True,
            "query": query,
            "schemes": clean_schemes,
            "count": len(clean_schemes),
            "message": (
                "Relevant schemes retrieved for policy explanation."
            )
        }