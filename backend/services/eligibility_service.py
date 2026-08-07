from services.scheme_service import get_all_schemes


def check_eligibility(age, occupation, income, gender, state):

    occupation = occupation.lower().strip()
    gender = gender.lower().strip()
    state = state.lower().strip()

    schemes = get_all_schemes()

    recommended = []

    for scheme in schemes:

        category = scheme["category"].lower()

        # Occupation Based
        if occupation == "farmer" and category == "farmer":
            recommended.append(scheme)

        elif occupation == "student" and category == "education":
            recommended.append(scheme)

        elif occupation == "business" and category == "business":
            recommended.append(scheme)

        elif occupation == "artisan" and category == "artisan":
            recommended.append(scheme)

        # Income Based
        elif income <= 300000 and category == "healthcare":
            recommended.append(scheme)

        # Gender Based
        elif gender == "female" and category == "girl child":
            recommended.append(scheme)

        # Age Based
        elif 18 <= age <= 35 and category == "skill development":
            recommended.append(scheme)

        elif age >= 60 and category == "pension":
            recommended.append(scheme)

        # Employment
        elif occupation in ["unemployed", "job seeker"] and category == "employment":
            recommended.append(scheme)

    return recommended