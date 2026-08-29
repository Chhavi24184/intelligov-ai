from services.rag_service import search_full_schemes


class DocumentAssistanceAgent:
    """
    Provides document guidance for government schemes.

    Retrieval strategy:
    1. Semantic RAG search against ChromaDB (schemes.json)
    2. Extract documents directly from retrieved scheme data
    3. Generic fallback if no scheme is found

    This agent does NOT hard-code document lists.
    All document information comes from the scheme database.
    """

    def run(self, query: str) -> dict:

        if not query or not query.strip():
            return {
                "agent": "DocumentAssistanceAgent",
                "success": False,
                "scheme": None,
                "schemes": [],
                "documents": [],
                "message": "Please provide a valid document-related query."
            }

        query = query.strip()

        # ============================================================
        # 1. Retrieve relevant schemes via semantic RAG search
        # ============================================================

        try:
            rag_schemes = search_full_schemes(query=query, top_k=5)
        except Exception as e:
            print(f"DocumentAgent RAG retrieval warning: {e}")
            rag_schemes = []

        # ============================================================
        # 2. Clean internal RAG fields before returning
        # ============================================================

        clean_schemes = []
        for scheme in rag_schemes:
            clean_scheme = {
                key: value
                for key, value in scheme.items()
                if not key.startswith("_rag_")
            }
            if clean_scheme.get("name"):
                clean_schemes.append(clean_scheme)

        # ============================================================
        # 3. No relevant scheme found
        # ============================================================

        if not clean_schemes:
            return {
                "agent": "DocumentAssistanceAgent",
                "success": True,
                "scheme": None,
                "schemes": [],
                "documents": [],
                "message": (
                    "I could not find a relevant government scheme "
                    "in the available database for your document query.\n\n"
                    "Common documents required for most government schemes:\n"
                    "1. Aadhaar Card\n"
                    "2. Bank Account Details\n"
                    "3. Income Certificate\n"
                    "4. Address Proof\n\n"
                    "Please specify the scheme name to get exact requirements."
                )
            }

        # ============================================================
        # 4. Return retrieved schemes and their documents
        #    (chat_service will pass these to Granite for a grounded reply)
        # ============================================================

        # Use the top scheme as the "primary" scheme for legacy field
        top_scheme = clean_schemes[0]
        top_documents = top_scheme.get("documents", [])

        return {
            "agent": "DocumentAssistanceAgent",
            "success": True,
            "scheme": top_scheme.get("name"),
            "schemes": clean_schemes,
            "documents": top_documents,
            "message": (
                f"Document information retrieved from {len(clean_schemes)} "
                "relevant scheme(s) in the database."
            )
        }
