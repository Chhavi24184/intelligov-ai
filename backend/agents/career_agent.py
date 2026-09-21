from services.rag_service import search_full_schemes


class CareerAgent:
    """
    Provides career and employment guidance by retrieving
    relevant government schemes from the RAG store.
    Career/employment/internship queries are answered
    using scheme data; Granite generation is handled
    centrally by chat_service.
    """

    def run(self, query: str, profile: dict | None = None) -> dict:

        if not query or not query.strip():
            return {
                "agent": "CareerAgent",
                "success": False,
                "schemes": [],
                "message": "Please provide a valid career or employment query."
            }

        # ============================================================
        # Retrieve relevant schemes via RAG
        # ============================================================

        try:
            # Career/internship queries are semantically distant
            # from scheme names in the embedding space; use a
            # higher distance threshold to retrieve relevant results.
            schemes = search_full_schemes(
                query=query,
                top_k=8,
                distance_threshold=2.0
            )
        except Exception as e:
            print(f"CareerAgent RAG warning: {e}")
            schemes = []

        # ============================================================
        # Clean internal RAG metadata before returning
        # ============================================================

        clean_schemes = [
            {k: v for k, v in s.items() if not k.startswith("_rag_")}
            for s in schemes
            if s.get("name")
        ]

        return {
            "agent": "CareerAgent",
            "success": True,
            "schemes": clean_schemes,
            "count": len(clean_schemes),
            "message": "Career and employment schemes retrieved."
        }
