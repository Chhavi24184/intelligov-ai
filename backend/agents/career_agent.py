class CareerAgent:
    """
    Provides basic career and employment guidance.
    """

    def run(self, query: str, profile: dict | None = None) -> dict:

        query_lower = query.lower()

        recommendations = []

        if "student" in query_lower:
            recommendations.extend([
                "Skill development programs",
                "Government internships",
                "Scholarships",
                "Apprenticeship opportunities"
            ])

        if "job" in query_lower or "employment" in query_lower:
            recommendations.extend([
                "Government employment portals",
                "Skill development programs",
                "Apprenticeships",
                "Job opportunities"
            ])

        if "farmer" in query_lower:
            recommendations.extend([
                "Agricultural skill programs",
                "Farmer training programs",
                "Agriculture-related government opportunities"
            ])

        if not recommendations:
            recommendations = [
                "Skill development programs",
                "Government employment opportunities",
                "Internships and apprenticeships"
            ]

        return {
            "agent": "CareerAgent",
            "success": True,
            "recommendations": recommendations
        }