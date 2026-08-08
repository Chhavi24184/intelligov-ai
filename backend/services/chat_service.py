from services.scheme_service import get_all_schemes


def generate_reply(message: str):
    message = message.lower()

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

    recommended_schemes = []

    for keyword, category in keyword_map.items():

        if keyword in message:

            for scheme in schemes:

                if (
                    scheme["category"].lower()
                    == category.lower()
                    and scheme not in recommended_schemes
                ):
                    recommended_schemes.append(scheme)

    if recommended_schemes:

        scheme_names = ", ".join(
            scheme["name"] for scheme in recommended_schemes
        )

        return {
            "reply": f"Based on your query, I recommend these government schemes: {scheme_names}.",
            "recommended_schemes": recommended_schemes
        }

    return {
        "reply": (
            "I couldn't understand your requirement. "
            "Please mention your occupation or need such as "
            "Farmer, Student, Business, Healthcare, Housing, "
            "Employment, Skill Training or Pension."
        ),
        "recommended_schemes": []
    }