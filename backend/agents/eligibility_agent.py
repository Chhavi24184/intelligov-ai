from services.eligibility_service import check_eligibility


class EligibilityAgent:
    """
    Checks government scheme eligibility using the existing
    eligibility service.
    """

    def run(self, profile: dict) -> dict:

        required_fields = [
            "age",
            "occupation",
            "income",
            "gender",
            "state"
        ]

        missing_fields = [
            field
            for field in required_fields
            if field not in profile
        ]

        if missing_fields:

            return {
                "agent": "EligibilityAgent",
                "success": False,
                "missing_fields": missing_fields,
                "recommended_schemes": []
            }

        schemes = check_eligibility(
            profile["age"],
            profile["occupation"],
            profile["income"],
            profile["gender"],
            profile["state"]
        )

        return {
            "agent": "EligibilityAgent",
            "success": True,
            "eligible": len(schemes) > 0,
            "total_matches": len(schemes),
            "recommended_schemes": schemes
        }