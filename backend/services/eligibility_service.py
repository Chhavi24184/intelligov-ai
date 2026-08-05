from services.scheme_service import get_all_schemes


def check_eligibility(age, occupation):
    occupation = occupation.lower()

    schemes = get_all_schemes()
    recommended = []

    for scheme in schemes:
        category = scheme["category"].lower()

        if occupation == "farmer" and category == "farmer":
            recommended.append(scheme)

        elif occupation == "student" and category == "education":
            recommended.append(scheme)

        elif occupation == "business" and category == "business":
            recommended.append(scheme)

        elif occupation == "artisan" and category == "artisan":
            recommended.append(scheme)

    return recommended