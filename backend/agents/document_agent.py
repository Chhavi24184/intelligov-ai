from services.rag_service import search_full_schemes
from core.logger import logger


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
            logger.warning("DocumentAssistanceAgent: empty query")
            return {
                "agent": "DocumentAssistanceAgent",
                "success": False,
                "scheme": None,
                "schemes": [],
                "documents": [],
                "message": "Please provide a valid document-related query."
            }

        query = query.strip()
        logger.info(f"DocumentAssistanceAgent: processing query: {query}")

        # ============================================================
        # 1. Retrieve relevant schemes via semantic RAG search
        #    For document queries, use lenient distance threshold
        #    and prefer schemes with non-empty documents field
        # ============================================================

        try:
            logger.info("DocumentAssistanceAgent: calling search_full_schemes with is_document_query=True, prefer_with_documents=True")
            rag_schemes = search_full_schemes(
                query=query,
                top_k=5,
                is_document_query=True,
                prefer_with_documents=True
            )
            logger.info(f"DocumentAssistanceAgent: RAG returned {len(rag_schemes)} schemes")
        except Exception as e:
            logger.error(f"DocumentAssistanceAgent RAG retrieval error: {e}")
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

        logger.info(f"DocumentAssistanceAgent: cleaned {len(clean_schemes)} schemes")

        # ============================================================
        # 3. No relevant scheme found — fallback to returning ALL schemes with documents
        # ============================================================

        if not clean_schemes:
            logger.info("DocumentAssistanceAgent: no schemes from RAG, trying fallback with all schemes")
            try:
                # Load all schemes and filter for those with documents
                from services.scheme_service import get_all_schemes
                all_schemes = get_all_schemes()
                schemes_with_docs = [
                    s for s in all_schemes
                    if s.get("documents") and len(s.get("documents", [])) > 0
                ]
                if schemes_with_docs:
                    # Return up to 5 schemes with documents
                    clean_schemes = schemes_with_docs[:5]
                    logger.info(f"DocumentAssistanceAgent: fallback returned {len(clean_schemes)} schemes with documents")
            except Exception as e:
                logger.error(f"DocumentAssistanceAgent fallback error: {e}")
        
        # ============================================================
        # 4. Still no schemes — return generic guidance
        # ============================================================

        if not clean_schemes:
            logger.warning("DocumentAssistanceAgent: no schemes found even in fallback")
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
        # 5. Return retrieved schemes and their documents
        #    (chat_service will pass these to Granite for a grounded reply)
        # ============================================================

        # Use the top scheme as the "primary" scheme for legacy field
        top_scheme = clean_schemes[0]
        top_documents = top_scheme.get("documents", [])
        
        logger.info(f"DocumentAssistanceAgent: returning {len(clean_schemes)} schemes, top scheme: {top_scheme.get('name')}")

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
