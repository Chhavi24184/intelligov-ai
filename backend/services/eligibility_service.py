from services.scheme_service import get_all_schemes


def check_eligibility(age, occupation, income, gender, state):
    """
    Check user eligibility and recommend relevant government schemes.

    Matching factors:
    - Age
    - Occupation
    - Income
    - Gender
    - State
    """

    occupation = occupation.lower().strip()
    gender = gender.lower().strip()
    state = state.lower().strip()

    schemes = get_all_schemes()

    recommended = []

    for scheme in schemes:

        score = 0
        reasons = []

        category = scheme.get("category", "").lower().strip()

        # --------------------------------
        # 1. Occupation Matching
        # --------------------------------

        if occupation == "farmer" and category in [
            "farmer",
            "agriculture"
        ]:
            score += 3
            reasons.append("Matches your occupation")

        elif occupation == "student" and category in [
            "education",
            "scholarship",
            "skill development"
        ]:
            score += 3
            reasons.append("Relevant for students")

        elif occupation in ["job seeker", "unemployed"] and category in [
            "employment",
            "skill development"
        ]:
            score += 3
            reasons.append("Relevant for job seekers")

        elif occupation == "business" and category == "business":
            score += 3
            reasons.append("Relevant for business")

        elif occupation == "artisan" and category == "artisan":
            score += 3
            reasons.append("Relevant for artisans")

        # --------------------------------
        # 2. Income Matching
        # --------------------------------

        if income <= 300000:
            if category in [
                "healthcare",
                "welfare",
                "financial assistance"
            ]:
                score += 2
                reasons.append("Matches low-income criteria")

        # --------------------------------
        # 3. Gender Matching
        # --------------------------------

        if gender == "female":
            if category in [
                "women",
                "girl child",
                "women empowerment"
            ]:
                score += 2
                reasons.append("Relevant for women")

        # --------------------------------
        # 4. Age Matching
        # --------------------------------

        if 18 <= age <= 35:
            if category in [
                "skill development",
                "employment"
            ]:
                score += 2
                reasons.append("Relevant for young adults")

        if age >= 60:
            if category in [
                "pension",
                "senior citizen",
                "social security"
            ]:
                score += 3
                reasons.append("Relevant for senior citizens")

        # --------------------------------
        # 5. State Matching
        # --------------------------------

        scheme_state = str(
            scheme.get("state", "all")
        ).lower().strip()

        if scheme_state in ["all", "india", "central"]:
            score += 1

        elif scheme_state == state:
            score += 3
            reasons.append("Available in your state")

        # --------------------------------
        # Add relevant schemes
        # --------------------------------

        if score >= 3:

            scheme_result = scheme.copy()

            scheme_result["match_score"] = score
            scheme_result["eligibility_reasons"] = reasons

            recommended.append(scheme_result)

    # Highest relevance first
    recommended.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return recommended