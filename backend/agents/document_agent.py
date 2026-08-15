class DocumentAssistanceAgent:
    """
    Provides document guidance for government schemes and services.
    """

    def run(self, query: str) -> dict:

        query_lower = query.lower().strip()

        # --------------------------------
        # PM Kisan Samman Nidhi
        # --------------------------------

        if (
            "pm kisan" in query_lower
            or "pm-kisan" in query_lower
            or "kisan samman nidhi" in query_lower
        ):

            documents = [
                "Aadhaar Card",
                "Bank Passbook",
                "Land Records"
            ]

            return {
                "agent": "DocumentAssistanceAgent",
                "success": True,
                "scheme": "PM Kisan Samman Nidhi",
                "documents": documents,
                "message": (
                    "For PM Kisan Samman Nidhi, the commonly "
                    "required documents are:\n\n"
                    + "\n".join(
                        f"{i}. {doc}"
                        for i, doc in enumerate(
                            documents,
                            start=1
                        )
                    )
                    + (
                        "\n\nExact requirements may vary "
                        "depending on the application process."
                    )
                )
            }

        # --------------------------------
        # Scholarship
        # --------------------------------

        if (
            "scholarship" in query_lower
            or "scholarships" in query_lower
        ):

            documents = [
                "Aadhaar Card",
                "Income Certificate",
                "Marksheet",
                "Educational Certificate",
                "Caste Certificate (if applicable)"
            ]

            return {
                "agent": "DocumentAssistanceAgent",
                "success": True,
                "scheme": "Scholarship Schemes",
                "documents": documents,
                "message": (
                    "For scholarship schemes, the commonly "
                    "required documents are:\n\n"
                    + "\n".join(
                        f"{i}. {doc}"
                        for i, doc in enumerate(
                            documents,
                            start=1
                        )
                    )
                    + (
                        "\n\nExact requirements may vary "
                        "depending on the scholarship scheme."
                    )
                )
            }

        # --------------------------------
        # PM Vishwakarma
        # --------------------------------

        if (
            "pm vishwakarma" in query_lower
            or "vishwakarma" in query_lower
            or "artisan" in query_lower
            or "craftsman" in query_lower
        ):

            documents = [
                "Aadhaar Card",
                "Occupation Proof",
                "Bank Account Details"
            ]

            return {
                "agent": "DocumentAssistanceAgent",
                "success": True,
                "scheme": "PM Vishwakarma",
                "documents": documents,
                "message": (
                    "For PM Vishwakarma, the commonly "
                    "required documents are:\n\n"
                    + "\n".join(
                        f"{i}. {doc}"
                        for i, doc in enumerate(
                            documents,
                            start=1
                        )
                    )
                    + (
                        "\n\nExact requirements may vary "
                        "depending on the application process."
                    )
                )
            }

        # --------------------------------
        # Farmer-related schemes
        # --------------------------------

        if (
            "farmer" in query_lower
            or "farmers" in query_lower
            or "agriculture" in query_lower
            or "kisan" in query_lower
        ):

            documents = [
                "Aadhaar Card",
                "Land Records",
                "Bank Account Details",
                "Agriculture-related documents"
            ]

            return {
                "agent": "DocumentAssistanceAgent",
                "success": True,
                "scheme": "Farmer-related Government Schemes",
                "documents": documents,
                "message": (
                    "For farmer-related government schemes, "
                    "the commonly required documents are:\n\n"
                    + "\n".join(
                        f"{i}. {doc}"
                        for i, doc in enumerate(
                            documents,
                            start=1
                        )
                    )
                    + (
                        "\n\nExact requirements may vary "
                        "depending on the scheme."
                    )
                )
            }

        # --------------------------------
        # Employment / Job
        # --------------------------------

        if (
            "job" in query_lower
            or "employment" in query_lower
            or "job seeker" in query_lower
        ):

            documents = [
                "Aadhaar Card",
                "Educational Certificates",
                "Resume/CV",
                "Skill Certificates (if applicable)"
            ]

            return {
                "agent": "DocumentAssistanceAgent",
                "success": True,
                "scheme": "Employment / Job Services",
                "documents": documents,
                "message": (
                    "For employment-related services, "
                    "the commonly required documents are:\n\n"
                    + "\n".join(
                        f"{i}. {doc}"
                        for i, doc in enumerate(
                            documents,
                            start=1
                        )
                    )
                    + (
                        "\n\nExact requirements may vary "
                        "depending on the service."
                    )
                )
            }

        # --------------------------------
        # Generic document guidance
        # --------------------------------

        documents = [
            "Aadhaar Card",
            "Income Certificate",
            "Residence/Domicile Certificate",
            "Bank Account Details",
            "Passport Size Photograph"
        ]

        return {
            "agent": "DocumentAssistanceAgent",
            "success": True,
            "scheme": "Government Services",
            "documents": documents,
            "message": (
                "Commonly required documents include:\n\n"
                + "\n".join(
                    f"{i}. {doc}"
                    for i, doc in enumerate(
                        documents,
                        start=1
                    )
                )
                + (
                    "\n\nExact requirements may vary "
                    "depending on the scheme or service."
                )
            )
        }