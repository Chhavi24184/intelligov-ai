class IntentDetectionAgent:
    """
    Detects the user's intent from a natural-language query.

    Supported intents:
    - eligibility
    - document
    - career
    - scheme
    - policy
    - notification
    - general
    """

    def run(self, query: str) -> dict:

        # ============================================================
        # 1. Validate Query
        # ============================================================

        if not query or not query.strip():

            return {
                "agent": "IntentDetectionAgent",
                "intent": "general",
                "confidence": 0.0
            }

        query_lower = query.lower().strip()

        # ============================================================
        # 2. Eligibility Related
        # ============================================================

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

        # ============================================================
        # 3. Document Related
        # ============================================================

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

        # ============================================================
        # 4. Career / Job Related
        # ============================================================

        career_keywords = [
            "job",
            "jobs",
            "career",
            "careers",
            "employment",
            "internship",
            "internships",
            "vacancy",
            "vacancies",
            "work",
            "government job",
            "government jobs",
            "job opportunity",
            "job opportunities",
            "job seeker",
            "jobseeker"
        ]

        # ============================================================
        # 5. Notification Related
        # ============================================================

        notification_keywords = [
            "notify",
            "notification",
            "notifications",
            "alert",
            "alerts",
            "remind",
            "reminder",
            "reminders",
            "remember",
            "deadline reminder",
            "application deadline",
            "last date",
            "closing date",
            "deadline"
        ]

        # ============================================================
        # 6. Policy Explanation Related
        # ============================================================

        policy_keywords = [
            "policy",
            "policies",
            "explain policy",
            "explain the policy",
            "policy explanation",
            "what is the policy",
            "how does the scheme work",
            "how does this scheme work",
            "explain this scheme",
            "explain the scheme",
            "what is this scheme",
            "tell me about this scheme",
            "how does pm kisan work",
            "how does pmjay work"
        ]

        # ============================================================
        # 7. Scheme Related
        # ============================================================

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

            # Skill Development
            "skill training",
            "skill development",
            "training",

            # Pension
            "pension",
            "retirement"
        ]

        # ============================================================
        # 8. Intent Priority
        # ============================================================
        #
        # More specific intents are checked first.
        #
        # Example:
        # "What documents are required for scholarship?"
        # -> document
        #
        # "Remind me about scholarship deadline"
        # -> notification
        #
        # "Explain the scholarship policy"
        # -> policy
        #
        # ============================================================

        # ------------------------------------------------------------
        # Notification gets highest priority
        # ------------------------------------------------------------

        if any(
            keyword in query_lower
            for keyword in notification_keywords
        ):

            intent = "notification"

        # ------------------------------------------------------------
        # Eligibility
        # ------------------------------------------------------------

        elif any(
            keyword in query_lower
            for keyword in eligibility_keywords
        ):

            intent = "eligibility"

        # ------------------------------------------------------------
        # Documents
        # ------------------------------------------------------------

        elif any(
            keyword in query_lower
            for keyword in document_keywords
        ):

            intent = "document"

        # ------------------------------------------------------------
        # Policy
        # ------------------------------------------------------------

        elif any(
            keyword in query_lower
            for keyword in policy_keywords
        ):

            intent = "policy"

        # ------------------------------------------------------------
        # Career / Jobs
        # ------------------------------------------------------------

        elif any(
            keyword in query_lower
            for keyword in career_keywords
        ):

            intent = "career"

        # ------------------------------------------------------------
        # Schemes
        # ------------------------------------------------------------

        elif any(
            keyword in query_lower
            for keyword in scheme_keywords
        ):

            intent = "scheme"

        # ------------------------------------------------------------
        # General
        # ------------------------------------------------------------

        else:

            intent = "general"

        # ============================================================
        # 9. Return Intent
        # ============================================================

        return {
            "agent": "IntentDetectionAgent",
            "intent": intent,
            "confidence": 0.90
        }