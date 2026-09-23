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
# CATEGORY HELPERS
# ============================================================

# Schemes that are exclusively for SC/ST/OBC/EWS applicants.
# General category users must NOT be recommended these.
_RESERVED_CATEGORY_KEYWORDS = [
    "obc", "sc/st", "sc / st", "tribal", "minority",
    "scheduled caste", "scheduled tribe", "backward class",
    "dnt", "ebc", "ews",
]

def _scheme_is_reserved_category(scheme: dict) -> str:
    """
    Return which reserved category a scheme is restricted to,
    or empty string if it is open to all.

    Checks both the eligibility text and the scheme name.
    """
    text = " ".join([
        str(scheme.get("eligibility", "")),
        str(scheme.get("name", "")),
        str(scheme.get("description", "")),
    ]).lower()

    if any(k in text for k in ["obc/ebc/dnt", "obc, ebc", "obc ebc"]):
        return "obc"
    if any(k in text for k in ["sc/st", "sc / st", "scheduled caste", "scheduled tribe"]):
        return "sc_st"
    if any(k in text for k in ["ews", "ewis", "economically weaker"]):
        return "ews"
    if any(k in text for k in ["tribal", "dnt"]):
        return "tribal"

    return ""


def _user_can_access(user_category: str, scheme_reserved: str) -> bool:
    """
    Returns True if the user's social category grants access to
    the reserved scheme.

    Rules:
    - Empty reserved → open to all
    - SC/ST reserved → only sc/st users
    - OBC reserved → only obc (and sc/st, as they are backward classes too)
    - EWS reserved → only ews (and below-poverty categories)
    - tribal → only st/tribal
    """
    if not scheme_reserved:
        return True  # scheme is open to all

    uc = user_category.lower().strip()

    if scheme_reserved == "sc_st":
        return uc in ["sc", "st"]
    if scheme_reserved == "obc":
        return uc in ["obc", "sc", "st"]
    if scheme_reserved == "ews":
        return uc in ["ews", "sc", "st", "obc"]
    if scheme_reserved == "tribal":
        return uc in ["st"]

    return True  # unknown reserved — allow


# ============================================================
# INCOME CEILING FOR A SCHEME
# Parse the scheme eligibility text for an income ceiling.
# e.g. "family income below ₹8 lakh" → 800_000
# ============================================================

def _parse_scheme_income_ceiling(scheme: dict) -> int:
    """
    Extract the maximum income allowed by the scheme from its
    eligibility text.  Returns 0 if no ceiling is mentioned
    (meaning the scheme has no income restriction).
    """
    import re
    text = " ".join([
        str(scheme.get("eligibility", "")),
        str(scheme.get("description", "")),
        str(scheme.get("benefits", "")),
    ]).lower().replace("₹", "").replace(",", "")

    # Patterns like "income below X lakh" or "income under X lakh"
    # or "family income below X lakh", "income not exceeding X lakh"
    patterns = [
        r"income\s+(?:below|under|less than|not exceed\w*|up to)\s+(\d+(?:\.\d+)?)\s*lakh",
        r"annual\s+income\s+(?:below|under|less than|not exceed\w*|up to)\s+(\d+(?:\.\d+)?)\s*lakh",
        r"(?:below|under)\s+(\d+(?:\.\d+)?)\s*lakh\s+(?:per|annual|yearly)",
    ]

    for pat in patterns:
        m = re.search(pat, text)
        if m:
            return int(float(m.group(1)) * 100_000)

    return 0  # no income ceiling found


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

    Matching factors (higher score = better match):
    - Occupation  (3 pts direct match)
    - Income      (2 pts low-income bonus; hard-exclude above ceiling)
    - Gender      (2 pts women-specific schemes)
    - Age         (2-3 pts age-specific schemes)
    - Social category (2 pts; hard-exclude reserved schemes)
    - Education   (1 pt)
    - State       (1-3 pts)

    Hard exclusions (never recommend, regardless of score):
    - Reserved-category schemes where user's category doesn't qualify
    - Income-ceiling schemes where user's income is above ceiling
    """

    occupation = str(occupation or "").lower().strip()
    gender     = str(gender or "").lower().strip()
    state      = str(state or "").lower().strip()
    category   = str(category or "").lower().strip()
    education  = str(education or "").lower().strip()

    income_num = _income_to_numeric(income)

    # Normalise occupation strings from the frontend dropdown
    # so partial / compound values still match scheme categories.
    _OCC_ALIASES = {
        "agricultural labourer":  "farmer",
        "self-employed":          "business",
        "self employed":          "business",
        "business":               "business",
        "artisan":                "artisan",
        "craftsperson":           "artisan",
        "artisan / craftsperson": "artisan",
        "street vendor":          "street vendor",
        "unemployed":             "job seeker",
        "job seeker":             "job seeker",
        "homemaker":              "general",
        "private sector":         "general",
        "government employee":    "general",
        "daily wage":             "job seeker",
        "other":                  "general",
    }
    for alias, canonical in _OCC_ALIASES.items():
        if alias in occupation:
            occupation = canonical
            break

    schemes = get_all_schemes()

    recommended = []

    for scheme in schemes:

        score   = 0
        reasons = []

        # Lowercase category for matching — use `in` for substring check
        scheme_cat = scheme.get("category", "").lower().strip()

        # --------------------------------------------------------
        # HARD EXCLUSION 1: Reserved-category schemes
        # e.g. OBC-only → skip for General/EWS users
        # --------------------------------------------------------
        reserved = _scheme_is_reserved_category(scheme)
        if reserved and not _user_can_access(category, reserved):
            continue

        # --------------------------------------------------------
        # HARD EXCLUSION 2: Income ceiling
        # If scheme says "income below X lakh" and user is above it
        # --------------------------------------------------------
        ceiling = _parse_scheme_income_ceiling(scheme)
        if ceiling > 0 and income_num > ceiling:
            continue

        # --------------------------------------------------------
        # 1. Occupation Matching  (substring-safe)
        # --------------------------------------------------------

        if occupation == "farmer" and (
            "farmer" in scheme_cat or "agriculture" in scheme_cat
        ):
            score += 3
            reasons.append("Matches your occupation")

        elif occupation == "student" and (
            "education" in scheme_cat
            or "scholarship" in scheme_cat
            or "skill" in scheme_cat
            or "apprenticeship" in scheme_cat
        ):
            score += 3
            reasons.append("Relevant for students")

        elif occupation in ["job seeker", "unemployed"] and (
            "employment" in scheme_cat or "skill" in scheme_cat
        ):
            score += 3
            reasons.append("Relevant for job seekers")

        elif occupation == "business" and (
            "business" in scheme_cat or "entrepreneur" in scheme_cat
        ):
            score += 3
            reasons.append("Relevant for business owners")

        elif occupation == "artisan" and "artisan" in scheme_cat:
            score += 3
            reasons.append("Relevant for artisans")

        elif occupation == "street vendor" and "street vendor" in scheme_cat:
            score += 3
            reasons.append("Relevant for street vendors")

        # --------------------------------------------------------
        # 2. Income Matching  (low-income bonus)
        # --------------------------------------------------------

        if income_num <= 300_000:
            if any(k in scheme_cat for k in [
                "healthcare", "welfare", "financial", "social security",
                "livelihood", "rural", "insurance"
            ]):
                score += 2
                reasons.append("Matches low-income criteria")

        # --------------------------------------------------------
        # 3. Gender Matching
        # --------------------------------------------------------

        if gender == "female":
            if any(k in scheme_cat for k in [
                "women", "girl", "maternity", "empowerment"
            ]):
                score += 2
                reasons.append("Relevant for women")

        # --------------------------------------------------------
        # 4. Age Matching
        # --------------------------------------------------------

        age_int = int(age or 0)

        if 18 <= age_int <= 35:
            if any(k in scheme_cat for k in ["skill", "employment", "apprenticeship"]):
                score += 2
                reasons.append("Relevant for young adults")

        if age_int >= 60:
            if any(k in scheme_cat for k in ["pension", "senior", "social security"]):
                score += 3
                reasons.append("Relevant for senior citizens")

        # --------------------------------------------------------
        # 5. Social Category Matching
        # --------------------------------------------------------

        if category in ["sc", "st", "obc"]:
            if any(k in scheme_cat for k in [
                "welfare", "tribal", "minority", "scholarship", "livelihood"
            ]):
                score += 2
                reasons.append(f"Available for {category.upper()} applicants")

        if category == "ews":
            if any(k in scheme_cat for k in [
                "housing", "scholarship", "employment", "welfare", "financial"
            ]):
                score += 2
                reasons.append("Relevant for EWS applicants")

        # --------------------------------------------------------
        # 6. Education Matching
        # --------------------------------------------------------

        # Use substring matching so dropdown values like "10th / Matric"
        # and simple strings like "10th" both match correctly.
        if any(k in education for k in ["10th", "matric", "secondary", "class 10", "below"]):
            if any(k in scheme_cat for k in ["skill", "employment"]):
                score += 1
                reasons.append("Available for matriculation holders")

        elif any(k in education for k in ["12th", "higher secondary", "intermediate", "class 12"]):
            if any(k in scheme_cat for k in ["scholarship", "skill", "employment"]):
                score += 1
                reasons.append("Available for 12th pass applicants")

        elif any(k in education for k in ["graduate", "graduation", "bachelor", "ug", "diploma", "iti"]):
            if any(k in scheme_cat for k in ["scholarship", "employment", "career", "apprenticeship"]):
                score += 1
                reasons.append("Available for graduates / diploma holders")

        # --------------------------------------------------------
        # 7. State Matching
        # --------------------------------------------------------

        scheme_state = str(
            scheme.get("state", "all")
        ).lower().strip()

        if scheme_state in ["all", "india", "central", ""]:
            score += 1   # central / all-India scheme bonus

        elif scheme_state == state:
            score += 3
            reasons.append("Available in your state")

        # --------------------------------------------------------
        # Universal schemes: give all citizens a base score
        # for open welfare, financial inclusion, and insurance
        # --------------------------------------------------------

        if any(k in scheme_cat for k in [
            "financial inclusion", "insurance", "pension"
        ]):
            if score == 0:
                score += 2
                reasons.append("Open to eligible citizens")

        # --------------------------------------------------------
        # Add scheme if it scores high enough
        # --------------------------------------------------------

        if score >= 3:
            scheme_result = scheme.copy()
            scheme_result["match_score"]         = score
            scheme_result["eligibility_reasons"] = reasons
            recommended.append(scheme_result)

    # Highest relevance first
    recommended.sort(
        key=lambda x: x["match_score"],
        reverse=True,
    )

    return recommended
