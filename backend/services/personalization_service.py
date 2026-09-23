"""
personalization_service.py
--------------------------
Profile-aware scheme filtering, ranking, and selection.

Pipeline:
  1.  RAG semantic retrieval (up to 12 candidates from ChromaDB)
  2.  Intent-type classification (scheme / job / internship / scholarship)
  3.  Profile eligibility scoring (age, occupation, category, income,
      state, education, interests)
  4.  Re-rank by combined (RAG + eligibility) score
  5.  Return top 3–5 results with eligibility reasons

Never invents data — every returned scheme comes verbatim from
schemes.json (or a live source that follows the same schema).
"""

from __future__ import annotations
import re
from services.rag_service import search_full_schemes, _MAX_RELEVANT_DISTANCE
from services.scheme_service import get_all_schemes
from core.logger import logger


# ============================================================
# HARD ELIGIBILITY EXCLUSION
# Parses scheme.eligibility text for common categorical/income
# constraints and returns True if the user is *clearly* ineligible.
# Conservative: only excludes when the mismatch is unambiguous.
# ============================================================

# Income midpoints for the profile dropdown options
_INCOME_MIDPOINT = {
    "below ₹1 lakh":   50_000,
    "₹1–2.5 lakh":    175_000,
    "₹2.5–5 lakh":    375_000,
    "₹5–8 lakh":      650_000,
    "above ₹8 lakh":  900_000,
}

def _is_clearly_ineligible(scheme: dict, profile: dict | None) -> bool:
    """
    Return True only when the user's profile clearly fails a hard
    eligibility rule stated in the scheme's eligibility text.

    Checks:
      1. Category-restricted schemes (OBC/EBC/DNT/SC/ST/Minority/EWS/PwD)
         — exclude if user's category is not in the allowed set.
      2. Income-capped schemes (e.g. "income below ₹2.5 lakh")
         — exclude if user's income is clearly above the cap.
      3. Age-gated schemes (exact age mentions like "aged 18–40")
         — exclude if user's age is outside the stated range.

    Never excludes if the relevant profile field is missing.
    """
    if not profile:
        return False

    elig_raw  = scheme.get("eligibility", "") or ""
    elig      = elig_raw.lower()

    # ------------------------------------------------------------------
    # 1. Category checks
    # ------------------------------------------------------------------
    user_cat = (profile.get("category") or "").lower().strip()

    # Schemes exclusively for OBC/EBC/DNT
    if user_cat and re.search(r'\b(obc|ebc|dnt)\b', elig):
        # Only exclude if the scheme says "OBC/EBC/DNT categories" (restrictive)
        # and does NOT say "all" or "general" or omit category
        if not re.search(r'\b(all|general|any)\b', elig):
            if user_cat not in ("obc", "ebc", "dnt", "sc", "st", "minority"):
                logger.debug(
                    f"ELIGIBILITY FILTER: excluding {scheme.get('name')!r} "
                    f"(requires OBC/EBC/DNT, user is {user_cat!r})"
                )
                return True

    # Schemes exclusively for SC/ST (and no "women or" / "general" broadener)
    if user_cat and re.search(r'\b(sc/st|sc or st|sc and st)\b', elig):
        if not re.search(r'\b(all|general|any)\b', elig):
            if user_cat not in ("sc", "st"):
                logger.debug(
                    f"ELIGIBILITY FILTER: excluding {scheme.get('name')!r} "
                    f"(requires SC/ST, user is {user_cat!r})"
                )
                return True

    # ------------------------------------------------------------------
    # 2. Income cap checks
    # ------------------------------------------------------------------
    user_income_str = (profile.get("income") or "").strip()
    user_income     = _INCOME_MIDPOINT.get(user_income_str)

    if user_income is not None:
        # Pattern: "income below X lakh" or "family income below X lakh"
        cap_match = re.search(
            r'income\s+(?:below|less than|not exceeding|up to|upto)\s+'
            r'(?:rs\.?\s*|₹\s*)?(\d+(?:\.\d+)?)\s*lakh',
            elig,
        )
        if cap_match:
            cap_lakhs  = float(cap_match.group(1))
            cap_rupees = cap_lakhs * 100_000
            # Exclude if user's midpoint income clearly exceeds the cap
            # Use a small margin to avoid borderline false-exclusions
            if user_income > cap_rupees * 1.15:
                logger.debug(
                    f"ELIGIBILITY FILTER: excluding {scheme.get('name')!r} "
                    f"(income cap ₹{cap_rupees:,.0f}, user ~₹{user_income:,.0f})"
                )
                return True

    # ------------------------------------------------------------------
    # 3. Age range checks (only when age explicitly stated in eligibility)
    # ------------------------------------------------------------------
    user_age = profile.get("age")
    if user_age:
        try:
            user_age = int(user_age)
        except (ValueError, TypeError):
            user_age = None

    if user_age:
        # Pattern: "aged X to Y" / "age X–Y" / "between X and Y years"
        age_match = re.search(
            r'age[ds]?\s+(\d+)\s*(?:to|-|–)\s*(\d+)',
            elig,
        )
        if age_match:
            lo, hi = int(age_match.group(1)), int(age_match.group(2))
            if user_age < lo or user_age > hi:
                logger.debug(
                    f"ELIGIBILITY FILTER: excluding {scheme.get('name')!r} "
                    f"(age range {lo}–{hi}, user age {user_age})"
                )
                return True

    return False


# ============================================================
# CONSTANTS
# ============================================================

MAX_RESULTS = 5
MIN_RESULTS = 3

# Income string → approximate annual rupees (for scoring)
_INCOME_MAP = {
    "below ₹1 lakh":   80_000,
    "₹1–2.5 lakh":    175_000,
    "₹2.5–5 lakh":    375_000,
    "₹5–8 lakh":      650_000,
    "above ₹8 lakh":  900_000,
}

# Category → scheme categories that are specifically beneficial
_CATEGORY_BENEFIT = {
    "sc":      {"social security", "financial inclusion", "rural livelihood", "rural skill development"},
    "st":      {"social security", "financial inclusion", "rural livelihood", "rural skill development"},
    "obc":     {"social security", "financial inclusion", "rural livelihood"},
    "ews":     {"housing", "social security", "financial inclusion"},
    "minority":{"social security", "education"},
    "pwd":     {"social security", "skill development"},
}

# Education → relevant scheme categories
_EDUCATION_BENEFIT = {
    "no formal education":   {"rural employment", "rural skill development"},
    "primary (1–5)":         {"rural employment", "rural skill development"},
    "middle (6–8)":          {"skill development", "rural skill development"},
    "secondary (9–10)":      {"skill development", "apprenticeship"},
    "higher secondary (11–12)": {"skill development", "apprenticeship", "education"},
    "diploma / iti":         {"skill development", "apprenticeship", "employment"},
    "graduate":              {"education", "employment", "entrepreneurship"},
    "post graduate":         {"education", "employment"},
    "phd":                   {"education", "employment"},
}

# Intent → which scheme categories to prioritise
_INTENT_CATEGORY_WEIGHTS: dict[str, dict[str, int]] = {
    "scheme": {
        "farmer": 4, "agriculture": 4, "agriculture energy": 3,
        "healthcare": 4, "housing": 4, "maternity": 3,
        "women welfare": 3, "girl child": 3,
        "insurance": 2, "financial inclusion": 2,
        "social security": 3, "pension": 3,
        "energy": 2, "street vendors": 2,
    },
    "career": {
        "employment": 5, "rural employment": 5,
        "skill development": 4, "rural skill development": 4,
        "apprenticeship": 4, "entrepreneurship": 3,
        "business": 3,
    },
    "scholarship": {
        "education": 5, "girl child": 3,
    },
    "internship": {
        "apprenticeship": 5, "skill development": 3,
    },
    "eligibility": {},   # no category filter — use pure profile scoring
    "document":    {},
    "policy":      {},
    "general":     {},
    "notification": {},
}

# How to classify each scheme category as a "type"
_CATEGORY_TO_TYPE: dict[str, str] = {
    "education":            "scholarship",
    "girl child":           "scholarship",
    "apprenticeship":       "internship",
    "employment":           "job",
    "rural employment":     "job",
    "skill development":    "job",
    "rural skill development": "job",
    "entrepreneurship":     "job",
    "business":             "job",
}


# ============================================================
# PUBLIC INTERFACE
# ============================================================

def get_profile_completeness(profile: dict | None) -> dict:
    """
    Returns which useful profile fields are present/missing.
    Used by the chat pipeline to ask the user to fill their profile.
    """
    if not profile:
        return {
            "complete": False,
            "present": [],
            "missing": ["age", "state", "occupation", "income", "category"],
            "has_minimum": False,
        }

    useful = ["age", "state", "occupation", "income", "category",
              "education", "district", "interests"]
    minimum = ["occupation", "state"]   # bare minimum for meaningful filtering

    present = [f for f in useful if profile.get(f)]
    missing = [f for f in useful if not profile.get(f)]
    has_min = all(profile.get(f) for f in minimum)

    return {
        "complete": len(missing) == 0,
        "present": present,
        "missing": missing,
        "has_minimum": has_min,
    }


def personalise(
    query: str,
    intent: str,
    profile: dict | None,
) -> dict:
    """
    Main personalisation entry point.

    Returns:
        {
          "schemes":          list[dict],   # 3–5 ranked results
          "intent_type":      str,          # scheme/job/internship/scholarship/general
          "profile_missing":  bool,         # True if profile has no useful data
          "missing_fields":   list[str],    # which fields would improve results
          "total_candidates": int,
        }
    """
    pc = get_profile_completeness(profile)
    intent_type = _resolve_intent_type(query, intent)

    # ----------------------------------------------------------
    # Step 1 — RAG retrieval (12 candidates)
    # ----------------------------------------------------------
    enriched_query = _build_rag_query(query, profile, intent_type)
    try:
        rag_results = search_full_schemes(
            query=enriched_query,
            top_k=12,
            distance_threshold=2.0,   # generous — we filter by profile next
        )
    except Exception as exc:
        logger.warning(f"personalise: RAG failed ({exc}), falling back to full list")
        rag_results = []

    # ----------------------------------------------------------
    # Step 2 — If RAG gave nothing, use full list
    # ----------------------------------------------------------
    if not rag_results:
        rag_results = get_all_schemes()[:12]

    # ----------------------------------------------------------
    # Step 3 — Hard eligibility filter + score each candidate
    # ----------------------------------------------------------
    scored = []
    excluded_count = 0
    for s in rag_results:
        scheme = {k: v for k, v in s.items() if not k.startswith("_rag_")}

        # Hard exclusion: skip schemes where profile clearly fails eligibility
        if _is_clearly_ineligible(scheme, profile):
            excluded_count += 1
            continue

        rag_score = s.get("_rag_score", 0)
        prof_score, reasons = _profile_score(scheme, profile, intent, intent_type)
        total = rag_score * 2 + prof_score
        scored.append((total, prof_score, reasons, scheme))

    if excluded_count:
        logger.info(
            f"personalise: {excluded_count} scheme(s) excluded by eligibility filter"
        )

    # Sort descending
    scored.sort(key=lambda x: x[0], reverse=True)

    # ----------------------------------------------------------
    # Step 4 — Take top MAX_RESULTS, ensure at least MIN_RESULTS
    # ----------------------------------------------------------
    top = scored[:MAX_RESULTS]

    # If fewer than MIN_RESULTS with actual profile signal, pad with next best
    if len(top) < MIN_RESULTS and len(scored) > len(top):
        top = scored[:max(MIN_RESULTS, len(top))]

    # Attach eligibility reasons (key matches what granite_service reads)
    results = []
    for _total, _pscore, reasons, scheme in top:
        out = scheme.copy()
        if reasons:
            out["eligibility_reasons"] = reasons
        out["_intent_type"] = _CATEGORY_TO_TYPE.get(
            scheme.get("category", "").lower(), intent_type
        )
        results.append(out)

    logger.info(
        f"personalise: intent={intent} type={intent_type} "
        f"candidates={len(rag_results)} → returned={len(results)}"
    )

    return {
        "schemes":          results,
        "intent_type":      intent_type,
        "profile_missing":  not pc["has_minimum"],
        "missing_fields":   pc["missing"],
        "total_candidates": len(rag_results),
    }


# ============================================================
# HELPERS
# ============================================================

def _resolve_intent_type(query: str, intent: str) -> str:
    """Map intent + query keywords to a display type."""
    q = query.lower()

    if intent == "career":
        if any(w in q for w in ("intern", "internship", "apprentice")):
            return "internship"
        if any(w in q for w in ("scholar", "fellowship", "stipend")):
            return "scholarship"
        return "job"

    if intent == "scheme":
        if any(w in q for w in ("scholar", "fellowship", "stipend")):
            return "scholarship"
        return "scheme"

    if intent in ("eligibility", "document", "policy", "general", "notification"):
        return "scheme"

    return intent  # fallback keeps the intent name


def _build_rag_query(query: str, profile: dict | None, intent_type: str) -> str:
    """Enrich the query with profile signals for better RAG recall."""
    parts = [query]
    if profile:
        for field in ("occupation", "category", "interests", "education", "state"):
            val = profile.get(field)
            if val:
                parts.append(str(val))
    return " ".join(parts)


def _income_to_int(income_str: str | None) -> int | None:
    """Convert income range string to approximate integer."""
    if not income_str:
        return None
    key = income_str.strip().lower()
    return _INCOME_MAP.get(key)


def _profile_score(
    scheme: dict,
    profile: dict | None,
    intent: str,
    intent_type: str,
) -> tuple[float, list[str]]:
    """
    Score a scheme against the user's profile.
    Returns (score, list_of_human_readable_reasons).
    """
    score = 0.0
    reasons: list[str] = []

    cat = scheme.get("category", "").lower().strip()

    # ---- Intent-category weight ----
    intent_weights = _INTENT_CATEGORY_WEIGHTS.get(intent, {})
    iw = intent_weights.get(cat, 0)
    if iw:
        score += iw

    if not profile:
        # No profile — return intent-only score
        return score, reasons

    # ---- Occupation ----
    occ = (profile.get("occupation") or "").lower().strip()
    if occ:
        occ_map = {
            "farmer":                        {"farmer", "agriculture", "agriculture energy"},
            "agricultural labourer":         {"farmer", "agriculture", "rural employment"},
            "self-employed / business":      {"business", "entrepreneurship", "street vendors"},
            "artisan / craftsperson":        {"artisan"},
            "student":                       {"education", "skill development", "apprenticeship"},
            "daily wage worker":             {"rural employment", "social security", "financial inclusion"},
            "street vendor":                 {"street vendors", "financial inclusion"},
            "unemployed":                    {"employment", "skill development", "rural skill development", "social security"},
            "homemaker":                     {"women welfare", "maternity", "social security"},
            "private sector employee":       {"insurance", "pension", "financial inclusion"},
            "government employee":           {"insurance", "pension"},
        }
        relevant_cats = set()
        for key, cats in occ_map.items():
            if key in occ or occ in key:
                relevant_cats |= cats
        if cat in relevant_cats:
            score += 4
            reasons.append(f"Relevant for {occ}")

    # ---- Social category ----
    soc_cat = (profile.get("category") or "").lower().strip()
    if soc_cat:
        benefit_cats = _CATEGORY_BENEFIT.get(soc_cat, set())
        if cat in benefit_cats:
            score += 2
            reasons.append(f"Benefits {soc_cat.upper()} applicants")

    # ---- Education ----
    edu = (profile.get("education") or "").lower().strip()
    if edu:
        edu_benefit = _EDUCATION_BENEFIT.get(edu, set())
        if cat in edu_benefit:
            score += 2
            reasons.append(f"Suitable for {edu} qualification")

    # ---- Income ----
    income_int = _income_to_int(profile.get("income"))
    if income_int is not None:
        if income_int < 250_000 and cat in {
            "healthcare", "social security", "financial inclusion",
            "housing", "rural livelihood", "women welfare", "maternity",
        }:
            score += 3
            reasons.append("Matches low-income eligibility")
        elif income_int < 500_000 and cat in {"housing", "financial inclusion"}:
            score += 1

    # ---- Age ----
    age = profile.get("age")
    if age:
        try:
            age = int(age)
        except (ValueError, TypeError):
            age = None
    if age:
        if 18 <= age <= 35 and cat in {
            "skill development", "rural skill development",
            "apprenticeship", "employment", "education",
        }:
            score += 2
            reasons.append("Relevant for your age group")
        if age >= 60 and cat in {"pension", "social security"}:
            score += 3
            reasons.append("Eligible as senior citizen")
        if age < 18 and cat in {"girl child", "education"}:
            score += 2
            reasons.append("Eligible for youth/child schemes")

    # ---- Gender (interests proxy) ----
    interests = (profile.get("interests") or "").lower()
    if interests:
        interest_map = {
            "agriculture":            {"farmer", "agriculture", "agriculture energy"},
            "education":              {"education", "skill development"},
            "healthcare":             {"healthcare"},
            "housing":                {"housing"},
            "business / startup":     {"business", "entrepreneurship"},
            "skill development":      {"skill development", "rural skill development", "apprenticeship"},
            "employment":             {"employment", "rural employment"},
            "women welfare":          {"women welfare", "maternity", "girl child"},
            "pension / social security": {"pension", "social security"},
            "energy / solar":         {"energy", "agriculture energy"},
            "insurance":              {"insurance"},
        }
        for interest, cats in interest_map.items():
            if interest.lower() in interests and cat in cats:
                score += 1
                reasons.append(f"Matches your interest: {interest}")
                break

    # ---- State (central vs state-specific) ----
    user_state = (profile.get("state") or "").lower().strip()
    scheme_state = str(scheme.get("state", "all")).lower().strip()
    if scheme_state in ("all", "india", "central", ""):
        score += 1   # universal schemes always relevant
    elif user_state and scheme_state == user_state:
        score += 3
        reasons.append(f"Available in {profile.get('state')}")

    return score, reasons


# ============================================================
# MISSING-PROFILE PROMPT BUILDER
# ============================================================

_PROFILE_PROMPTS = {
    "en": (
        "To give you personalised recommendations, I need a few details.\n"
        "Please go to **Profile** and fill in: {missing}.\n"
        "I'll then show you only the schemes you're most likely eligible for."
    ),
    "hi": (
        "आपको व्यक्तिगत सिफारिशें देने के लिए मुझे कुछ जानकारी चाहिए।\n"
        "कृपया **प्रोफ़ाइल** पर जाकर भरें: {missing}।\n"
        "फिर मैं केवल वे योजनाएँ दिखाऊँगा जिनके लिए आप पात्र हो सकते हैं।"
    ),
    "pa": (
        "ਤੁਹਾਨੂੰ ਨਿੱਜੀ ਸਿਫ਼ਾਰਸ਼ਾਂ ਦੇਣ ਲਈ ਮੈਨੂੰ ਕੁਝ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ।\n"
        "ਕਿਰਪਾ ਕਰਕੇ **ਪ੍ਰੋਫਾਈਲ** 'ਤੇ ਜਾ ਕੇ ਭਰੋ: {missing}।\n"
        "ਫਿਰ ਮੈਂ ਕੇਵਲ ਉਹ ਯੋਜਨਾਵਾਂ ਦਿਖਾਵਾਂਗਾ ਜਿਨ੍ਹਾਂ ਲਈ ਤੁਸੀਂ ਯੋਗ ਹੋ ਸਕਦੇ ਹੋ।"
    ),
}

_FIELD_LABELS = {
    "age": "age", "state": "state/UT", "occupation": "occupation",
    "income": "income range", "category": "social category",
    "education": "education level", "district": "district",
    "interests": "interests",
}


def build_profile_missing_prompt(missing_fields: list[str], language: str = "en") -> str:
    labels = [_FIELD_LABELS.get(f, f) for f in missing_fields[:4]]
    missing_str = ", ".join(labels)
    template = _PROFILE_PROMPTS.get(language, _PROFILE_PROMPTS["en"])
    return template.format(missing=missing_str)
