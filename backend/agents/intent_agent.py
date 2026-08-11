class IntentDetectionAgent:
    """
    Detects the user's intent from a natural-language query.
    """

    def run(self, query: str) -> dict:

        query_lower = query.lower().strip()

        # --------------------------------
        # Eligibility related
        # --------------------------------

        eligibility_keywords = [
            "eligible",
            "eligibility",
            "qualify",
            "qualification",
            "am i eligible",
            "can i apply",
            "do i qualify",
            "eligibility criteria"
        ]

        # --------------------------------
        # Document related
        # --------------------------------

        document_keywords = [
            "document",
            "documents",
            "certificate",
            "aadhaar",
            "proof",
            "paperwork",
            "required documents",
            "what documents",
            "documents required"
        ]

        # --------------------------------
        # Career / Job related
        # --------------------------------

        career_keywords = [
            "job",
            "jobs",
            "career",
            "employment",
            "internship",
            "vacancy",
            "vacancies",
            "work",
            "government job",
            "government jobs",
            "job opportunity",
            "job opportunities"
        ]

        # --------------------------------
        # Scheme related
        # --------------------------------

        scheme_keywords = [
            "scheme",
            "schemes",
            "yojana",
            "government scheme",
            "government schemes",
            "benefit",
            "benefits",
            "welfare",
            "subsidy",

            # Education / Student
            "student",
            "students",
            "scholarship",
            "scholarships",
            "education",
            "educational",
            "college",
            "study",

            # Farmer / Agriculture
            "farmer",
            "farmers",
            "farming",
            "agriculture",
            "agricultural",
            "crop",
            "crops",

            # Women / Girl Child
            "women",
            "woman",
            "female",
            "girl",
            "girls",
            "daughter",

            # Healthcare
            "health",
            "healthcare",
            "medical",
            "hospital",
            "medicine",
            "health insurance",

            # Housing
            "house",
            "home",
            "housing",

            # Business
            "business",
            "startup",
            "loan",
            "entrepreneur",
            "entrepreneurship",

            # Skill development
            "skill training",
            "skill development",
            "training",

            # Pension
            "pension",
            "retirement"
        ]

        # --------------------------------
        # Intent priority
        # --------------------------------

        # Eligibility gets highest priority
        if any(keyword in query_lower for keyword in eligibility_keywords):

            intent = "eligibility"

        # Documents
        elif any(keyword in query_lower for keyword in document_keywords):

            intent = "document"

        # Career / Jobs
        elif any(keyword in query_lower for keyword in career_keywords):

            intent = "career"

        # Schemes / Benefits
        elif any(keyword in query_lower for keyword in scheme_keywords):

            intent = "scheme"

        else:

            intent = "general"

        return {
            "agent": "IntentDetectionAgent",
            "intent": intent,
            "confidence": 0.90
        }