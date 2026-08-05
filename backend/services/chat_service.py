from services.scheme_service import get_all_schemes


def generate_reply(message: str):
    message = message.lower()

    schemes = get_all_schemes()

    if "farmer" in message:
        for scheme in schemes:
            if scheme["category"] == "Farmer":
                return {
                    "reply": f"I recommend {scheme['name']}.",
                    "recommended_scheme": scheme
                }

    elif "student" in message:
        for scheme in schemes:
            if scheme["category"] == "Education":
                return {
                    "reply": f"I recommend {scheme['name']}.",
                    "recommended_scheme": scheme
                }

    elif "business" in message:
        for scheme in schemes:
            if scheme["category"] == "Business":
                return {
                    "reply": f"I recommend {scheme['name']}.",
                    "recommended_scheme": scheme
                }
    elif "health" in message or "hospital" in message:
        for scheme in schemes:
            if scheme["category"] == "Healthcare":
                return {
                    "reply": f"I recommend {scheme['name']}.",
                    "recommended_scheme": scheme
                }

    elif "house" in message or "home" in message:
        for scheme in schemes:
            if scheme["category"] == "Housing":
                return {
                    "reply": f"I recommend {scheme['name']}.",
                    "recommended_scheme": scheme
                }

    elif "job" in message or "employment" in message:
        for scheme in schemes:
            if scheme["category"] == "Employment":
                return {
                    "reply": f"I recommend {scheme['name']}.",
                    "recommended_scheme": scheme
                }
    elif "artisan" in message or "craft" in message:
        for scheme in schemes:
            if scheme["category"] == "Artisan":
                return {
                    "reply": f"I recommend {scheme['name']}.",
                    "recommended_scheme": scheme
                }

 
    return {
        "reply": "Please tell me your occupation (e.g. Farmer, Student, Business, Artisan) or your need (healthcare, housing, employment) so I can recommend a suitable government scheme.",
        "recommended_scheme": None
    }