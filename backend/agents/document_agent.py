class DocumentAssistanceAgent:
    """
    Provides basic document guidance for government services.
    """

    def run(self, query: str) -> dict:

        query_lower = query.lower()

        documents = [
            "Aadhaar Card",
            "Income Certificate",
            "Residence/Domicile Certificate",
            "Bank Account Details",
            "Passport Size Photograph"
        ]

        if "scholarship" in query_lower:
            documents.extend([
                "Educational Certificates",
                "Marksheet",
                "Caste Certificate (if applicable)"
            ])

        elif "farmer" in query_lower:
            documents.extend([
                "Land Ownership/Record Document",
                "Agriculture-related documents"
            ])

        elif "job" in query_lower or "employment" in query_lower:
            documents.extend([
                "Educational Certificates",
                "Resume/CV",
                "Skill Certificates (if applicable)"
            ])

        return {
            "agent": "DocumentAssistanceAgent",
            "success": True,
            "documents": documents,
            "message": (
                "These are commonly required documents. "
                "Exact requirements may vary by scheme."
            )
        }