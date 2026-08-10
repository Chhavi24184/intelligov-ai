from services.scheme_service import get_all_schemes
from services.granite_service import granite_client


def generate_reply(message: str):
    message = message.lower().strip()

    schemes = get_all_schemes()

    keyword_map = {
        "farmer": "Farmer",
        "agriculture": "Farmer",
        "crop": "Farmer",

        "student": "Education",
        "scholarship": "Education",
        "education": "Education",

        "business": "Business",
        "startup": "Business",
        "loan": "Business",
        "entrepreneur": "Business",

        "artisan": "Artisan",
        "craft": "Artisan",

        "health": "Healthcare",
        "hospital": "Healthcare",
        "medical": "Healthcare",
        "insurance": "Healthcare",

        "house": "Housing",
        "home": "Housing",
        "housing": "Housing",

        "employment": "Employment",
        "job": "Employment",
        "unemployed": "Employment",

        "skill": "Skill Development",
        "training": "Skill Development",

        "pension": "Pension",
        "retirement": "Pension",

        "girl": "Girl Child",
        "female": "Girl Child",
        "women": "Girl Child",
        "daughter": "Girl Child"
    }

    retrieved_schemes = []

    # Retrieve schemes based on query
    for keyword, category in keyword_map.items():

        if keyword in message:

            for scheme in schemes:

                if (
                    scheme.get("category", "").lower()
                    == category.lower()
                    and scheme not in retrieved_schemes
                ):
                    retrieved_schemes.append(scheme)

    # No relevant scheme found
    if not retrieved_schemes:
        return {
            "reply": (
                "I couldn't find a relevant government scheme "
                "in the available government data. Please try "
                "asking about education, farming, employment, "
                "healthcare, housing, business, skill development "
                "or pensions."
            ),
            "recommended_schemes": []
        }

    # Limit context sent to LLM
    retrieved_schemes = retrieved_schemes[:5]

    # Generate grounded response using Granite
    reply = granite_client.generate(
        query=message,
        context=retrieved_schemes
    )

    return {
        "reply": reply,
        "recommended_schemes": retrieved_schemes
    }