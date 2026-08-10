class IntentDetectionAgent:
    """
    Detects the user's intent from a natural-language query.
    """

    def run(self, query: str) -> dict:
        query_lower = query.lower().strip()

        # Scheme related
        scheme_keywords = [
            "scheme",
            "yojana",
            "government scheme",
            "benefit",
            "welfare",
            "subsidy"
        ]

        # Eligibility related
        eligibility_keywords = [
            "eligible",
            "eligibility",
            "qualify",
            "qualification",
            "am i eligible",
            "can i apply"
        ]

        # Career / Job related
        career_keywords = [
            "job",
            "career",
            "employment",
            "internship",
            "skill",
            "work",
            "vacancy"
        ]

        # Document related
        document_keywords = [
            "document",
            "documents",
            "certificate",
            "aadhaar",
            "proof",
            "apply",
            "application"
        ]

        if any(keyword in query_lower for keyword in eligibility_keywords):
            intent = "eligibility"

        elif any(keyword in query_lower for keyword in scheme_keywords):
            intent = "scheme"

        elif any(keyword in query_lower for keyword in career_keywords):
            intent = "career"

        elif any(keyword in query_lower for keyword in document_keywords):
            intent = "document"

        else:
            intent = "general"

        return {
            "agent": "IntentDetectionAgent",
            "intent": intent,
            "confidence": 0.90
        }