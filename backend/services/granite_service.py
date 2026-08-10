class MockGraniteClient:
    """
    Mock IBM Granite client for IntelliGov AI.

    This client simulates an LLM response using
    retrieved government scheme information.
    """

    def generate(self, query: str, context: list) -> str:

        # No retrieved information
        if not context:
            return (
                "I could not find a relevant government scheme "
                "in the available government data. "
                "Please try asking about education, farming, "
                "employment, healthcare, housing, business, "
                "skill development, or pensions."
            )

        # Create grounded response
        scheme_names = [
            scheme.get("name", "Unknown Scheme")
            for scheme in context
        ]

        response = (
            f"Based on the available government scheme data, "
            f"the following schemes may be relevant to your query "
            f"'{query}':\n\n"
        )

        for index, scheme in enumerate(context, start=1):

            name = scheme.get("name", "Unknown Scheme")
            category = scheme.get("category", "General")
            description = scheme.get(
                "description",
                "No description available."
            )
            eligibility = scheme.get(
                "eligibility",
                "Eligibility information is not available."
            )

            response += (
                f"{index}. {name}\n"
                f"   Category: {category}\n"
                f"   Description: {description}\n"
                f"   Eligibility: {eligibility}\n\n"
            )

        response += (
            "Note: This response is generated only from "
            "the available government scheme data. "
            "Please verify the latest official eligibility "
            "requirements before applying."
        )

        return response


# Shared mock Granite client
granite_client = MockGraniteClient()