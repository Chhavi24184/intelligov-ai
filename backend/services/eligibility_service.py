from services.scheme_service import get_all_schemes


# ============================================================
# INCOME STRING → NUMERIC UPPER BOUND
# Handles both legacy int income and the new string ranges
# like "Below ₹1 lakh", "₹1–3 lakh", "Above ₹8 lakh", etc.
# ============================================================

def _income_to_numeric(income) -> int:
    """
    Convert income (int or range-string) to a comparable integer.
    Returns annual income in INR as an integer.
    """
    if isinstance(income, int):
        return income

    if not income:
        return 0

    s = str(income).lower().replace(",", "").replace("₹", "").strip()

    # Map common phrases to approximate midpoints
    _INCOME_MAP = {
        # Profile dropdown exact strings (after ₹ strip + lower)
        "below 1 lakh":    50_000,
        "below 1":         50_000,
        "1-2.5 lakh":     175_000,
        "1\u20132.5 lakh":175_000,   # en-dash variant  ₹1–2.5 lakh
        "1 to 2.5 lakh":  175_000,
        "2.5-5 lakh":     375_000,
        "2.5\u20135 lakh":375_000,   # en-dash variant  ₹2.5–5 lakh
        "2.5 to 5 lakh":  375_000,
        # Legacy / other representations
        "1-3 lakh":       200_000,
        "1\u20133 lakh":  200_000,
        "1 to 3 lakh":    200_000,
        "3-5 lakh":       400_000,
        "3\u20135 lakh":  400_000,
        "3 to 5 lakh":    400_000,
        "5-8 lakh":       650_000,
        "5\u20138 lakh":  650_000,
        "5 to 8 lakh":    650_000,
        "above 8 lakh":   900_000,
        "above 8":        900_000,
        "no income":            0,
        "nil":                  0,
        "student":              0,
    }

    for key, value in _INCOME_MAP.items():
        if key in s:
            return value

    # Try to extract a number from the string (first match)
    import re
    nums = re.findall(r"\d+(?:\.\d+)?", s)
    if nums:
        # Treat as lakhs if it looks like a lakh-based value (< 100)
        val = float(nums[0])
        if val < 100:
            return int(val * 100_000)
        return int(val)

    return 0


# ============================================================
# ELIGIBILITY CHECKER
# ============================================================

def check_eligibility(
    age,
    occupation,
    income,
    gender,
    state,
    category: str = "",
    education: str = "",
):
    """
    Check user eligibility and recommend relevant government schemes.

    Matching factors:
    - Age
    - Occupation
    - Income (int or range-string)
    - Gender
    - State
    - Social category (SC / ST / OBC / General / EWS)
    - Education level
    """

    occupation = str(occupation or "").lower().strip()
    gender     = str(gender or "").lower().strip()
    state      = str(state or "").lower().strip()
    category   = str(category or "").lower().strip()
    education  = str(education or "").lower().strip()

    income_num = _income_to_numeric(income)

    schemes = get_all_schemes()

    recommended = []

    for scheme in schemes:

        score   = 0
        reasons = []

        scheme_cat = scheme.get("category", "").lower().strip()

        # --------------------------------
        # 1. Occupation Matching
        # --------------------------------

        if occupation == "farmer" and scheme_cat in [
            "farmer", "agriculture"
        ]:
            score += 3
            reasons.append("Matches your occupation")

        elif occupation == "student" and scheme_cat in [
            "education", "scholarship", "skill development"
        ]:
            score += 3
            reasons.append("Relevant for students")

        elif occupation in ["job seeker", "unemployed"] and scheme_cat in [
            "employment", "skill development"
        ]:
            score += 3
            reasons.append("Relevant for job seekers")

        elif occupation == "business" and scheme_cat == "business":
            score += 3
            reasons.append("Relevant for business")

        elif occupation == "artisan" and scheme_cat == "artisan":
            score += 3
            reasons.append("Relevant for artisans")

        # --------------------------------
        # 2. Income Matching
        # --------------------------------

        if income_num <= 300_000:
            if scheme_cat in [
                "healthcare", "welfare", "financial assistance"
            ]:
                score += 2
                reasons.append("Matches low-income criteria")

        # --------------------------------
        # 3. Gender Matching
        # --------------------------------

        if gender == "female":
            if scheme_cat in [
                "women", "girl child", "women empowerment"
            ]:
                score += 2
                reasons.append("Relevant for women")

        # --------------------------------
        # 4. Age Matching
        # --------------------------------

        if 18 <= int(age or 0) <= 35:
            if scheme_cat in ["skill development", "employment"]:
                score += 2
                reasons.append("Relevant for young adults")

        if int(age or 0) >= 60:
            if scheme_cat in ["pension", "senior citizen", "social security"]:
                score += 3
                reasons.append("Relevant for senior citizens")

        # --------------------------------
        # 5. Social Category Matching
        # --------------------------------

        if category in ["sc", "st", "obc"]:
            if scheme_cat in [
                "sc/st welfare", "tribal welfare", "minority welfare",
                "social welfare", "welfare", "scholarship"
            ]:
                score += 2
                reasons.append(f"Available for {category.upper()} applicants")

        if category == "ews":
            if scheme_cat in ["housing", "scholarship", "employment", "welfare"]:
                score += 2
                reasons.append("Relevant for EWS applicants")

        # --------------------------------
        # 6. Education Matching
        # --------------------------------

        if education in ["10th", "matric", "secondary"]:
            if scheme_cat in ["skill development", "employment"]:
                score += 1
                reasons.append("Available for matriculation holders")

        elif education in ["12th", "higher secondary", "intermediate"]:
            if scheme_cat in ["scholarship", "skill development", "employment"]:
                score += 1
                reasons.append("Available for 12th pass applicants")

        elif education in ["graduate", "graduation", "bachelor"]:
            if scheme_cat in ["scholarship", "employment", "career"]:
                score += 1
                reasons.append("Available for graduates")

        # --------------------------------
        # 7. State Matching
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
            scheme_result["match_score"]          = score
            scheme_result["eligibility_reasons"]  = reasons
            recommended.append(scheme_result)

    # Highest relevance first
    recommended.sort(
        key=lambda x: x["match_score"],
        reverse=True,
    )

    return recommended
