"""
scheme_service.py
-----------------
Provides government scheme data for IntelliGov AI.

Data source:
  - PRIMARY : backend/data/schemes.json (deduplicated 2,000+ scheme catalogue).
  - RAG     : Government_Schemes.json uses the same schema/catalogue.
  - DYNAMIC : optional myscheme.gov.in API additions when an API key is set.
  - The bundled catalogue always remains available as the baseline.
"""

import json
import logging
import os
from pathlib import Path

try:
    import requests as _requests
    _REQUESTS_AVAILABLE = True
except ImportError:
    _REQUESTS_AVAILABLE = False

logger = logging.getLogger(__name__)

_DATA_FILE = (
    Path(__file__).parent.parent
    / "data"
    / "schemes.json"
)

# In-memory cache — cleared only on restart
_schemes_cache: list | None = None


# =========================================================
# LOAD FROM schemes.json  (authoritative fallback)
# =========================================================

def _load_from_json() -> list:
    global _schemes_cache
    if _schemes_cache is not None:
        return _schemes_cache
    with open(_DATA_FILE, "r", encoding="utf-8") as f:
        _schemes_cache = json.load(f)
    logger.info(f"Loaded {len(_schemes_cache)} schemes from schemes.json")
    return _schemes_cache


# =========================================================
# DYNAMIC FETCH  (myscheme.gov.in)
# Note: the public catalogue API requires an API key.
# Without one it returns HTTP 401.  This function will
# silently return None so callers always fall back to JSON.
# =========================================================

_MYSCHEME_API = "https://api.myscheme.gov.in/search/v4/schemes"
_MYSCHEME_API_KEY = os.getenv("MYSCHEME_API_KEY", "")   # set in .env if you have one


def _try_fetch_dynamic() -> list | None:
    """
    Attempt to pull live scheme data from myscheme.gov.in.
    Returns a normalised list on success, None on any failure.
    """
    if not _REQUESTS_AVAILABLE:
        return None

    # Without an API key this endpoint always returns 401 — skip the call
    if not _MYSCHEME_API_KEY:
        return None

    try:
        resp = _requests.get(
            _MYSCHEME_API,
            params={"lang": "en", "q": "", "from": 0, "size": 30},
            timeout=5,
            headers={
                "Accept": "application/json",
                "Authorization": f"Bearer {_MYSCHEME_API_KEY}",
            },
        )
        if resp.status_code != 200:
            logger.debug(
                f"myscheme.gov.in API returned {resp.status_code} — "
                "using schemes.json fallback"
            )
            return None

        raw  = resp.json()
        hits = (
            raw.get("data", {}).get("hits", [])
            or raw.get("hits", [])
            or []
        )
        if not hits:
            return None

        normalised = []
        for h in hits:
            src  = h.get("_source", h)
            name = src.get("schemeName") or src.get("name", "")
            if not name:
                continue
            normalised.append({
                "id":           src.get("schemeId") or src.get("id"),
                "name":         name,
                "category":     src.get("schemeCategory") or src.get("category", "General"),
                "description":  src.get("briefDescription") or src.get("description", ""),
                "benefits":     src.get("benefitsDescription") or src.get("benefits", ""),
                "eligibility":  src.get("eligibility") or src.get("eligibilityCriteria", ""),
                "documents":    src.get("requiredDocuments") or src.get("documents", []),
                "deadline":     src.get("applicationDeadline") or src.get("deadline", "Ongoing"),
                "official_url": (
                    src.get("applicationUrl")
                    or src.get("schemeUrl")
                    or src.get("official_url", "")
                ),
            })

        if normalised:
            logger.info(f"Live schemes fetched: {len(normalised)} from myscheme.gov.in")
            return normalised

    except Exception as exc:
        logger.debug(f"Dynamic scheme fetch failed: {exc}")

    return None


# =========================================================
# PUBLIC API
# =========================================================

def get_all_schemes() -> list:
    """
    Return the bundled catalogue first, then append any new live records.
    The bundled dataset is the reliable baseline so a live API response with
    only a small page of results can never hide the full local catalogue.
    """
    bundled = list(_load_from_json())
    live = _try_fetch_dynamic()
    if not live:
        return bundled

    known = {
        str(s.get("name", "")).strip().casefold()
        for s in bundled
        if s.get("name")
    }
    for scheme in live:
        name = str(scheme.get("name", "")).strip()
        if name and name.casefold() not in known:
            scheme = dict(scheme)
            scheme["id"] = len(bundled) + 1
            bundled.append(scheme)
            known.add(name.casefold())

    logger.info("Returning %s bundled schemes plus live additions", len(bundled))
    return bundled


def get_schemes_source() -> dict:
    """
    Returns metadata about which data source is currently active.
    Used by the /schemes/source endpoint so the frontend can show
    an honest data-source badge.
    """
    api_key_set = bool(_MYSCHEME_API_KEY)
    return {
        "source":        "bundled JSON + myScheme additions" if api_key_set else "bundled JSON catalogue",
        "source_type":   "hybrid" if api_key_set else "static",
        "total_schemes": len(get_all_schemes()),
        "note": (
            "Bundled catalogue is active; new live records are appended when available."
            if api_key_set
            else
            "Using the bundled deduplicated government-scheme catalogue from backend/data/schemes.json. "
            "Live API additions are optional; set MYSCHEME_API_KEY in backend/.env."
        ),
    }


def get_schemes_by_category(category: str) -> list:
    schemes = get_all_schemes()
    return [
        s for s in schemes
        if s.get("category", "").lower() == category.lower()
    ]


def search_schemes(keyword: str) -> list:
    keyword = keyword.lower().strip()
    schemes = get_all_schemes()
    return [
        s for s in schemes
        if (
            keyword in s.get("name", "").lower()
            or keyword in s.get("category", "").lower()
            or keyword in s.get("description", "").lower()
        )
    ]


def get_scheme_by_id_or_name(identifier) -> dict | None:
    """
    Look up a scheme by integer ID or string name (case-insensitive).
    Returns the scheme dict or None if not found.
    """
    if identifier is None:
        return None

    schemes = get_all_schemes()

    # Try numeric ID
    try:
        scheme_id = int(identifier)
        for s in schemes:
            if s.get("id") == scheme_id:
                return s
    except (ValueError, TypeError):
        pass

    # Try name match
    name_str = str(identifier).strip().lower()
    for s in schemes:
        if s.get("name", "").strip().lower() == name_str:
            return s

    # Try substring match if no exact match
    for s in schemes:
        if name_str in s.get("name", "").strip().lower():
            return s

    return None


def compare_two_schemes(scheme1_ref, scheme2_ref) -> dict:
    """
    Compare two government schemes by benefits, eligibility, documents, and official links
    using existing scheme data, safely handling any missing fields.

    Parameters:
        scheme1_ref: int (id), str (name or id), or dict (scheme record)
        scheme2_ref: int (id), str (name or id), or dict (scheme record)

    Returns:
        Dictionary with comparison details and safe fallback values for missing fields.
    """
    s1 = scheme1_ref if isinstance(scheme1_ref, dict) else get_scheme_by_id_or_name(scheme1_ref)
    s2 = scheme2_ref if isinstance(scheme2_ref, dict) else get_scheme_by_id_or_name(scheme2_ref)

    if not s1 or not s2:
        missing = []
        if not s1:
            missing.append(f"Scheme 1 ({scheme1_ref})")
        if not s2:
            missing.append(f"Scheme 2 ({scheme2_ref})")
        return {
            "success": False,
            "message": f"Could not find {' and '.join(missing)} in existing scheme records.",
            "comparison": None,
        }

    def _normalize_scheme(scheme: dict) -> dict:
        """Safely extract required comparison fields handling None, empty, or missing values."""
        name = str(scheme.get("name") or "Unknown Scheme").strip()
        category = str(scheme.get("category") or "General").strip()

        # Benefits (handle string or missing)
        benefits = str(scheme.get("benefits") or "").strip() or "Not specified"

        # Eligibility (handle string or missing)
        eligibility = str(scheme.get("eligibility") or "").strip() or "Not specified"

        # Documents (handle list, None, string or missing)
        raw_docs = scheme.get("documents")
        if isinstance(raw_docs, list):
            docs = [str(d).strip() for d in raw_docs if str(d).strip()]
        elif isinstance(raw_docs, str) and raw_docs.strip():
            docs = [d.strip() for d in raw_docs.split(",") if d.strip()]
        else:
            docs = []

        # Official link / URL (check official_url, link, official_link)
        official_url = (
            str(
                scheme.get("official_url")
                or scheme.get("official_link")
                or scheme.get("link")
                or ""
            ).strip()
            or "Not available"
        )

        deadline = str(scheme.get("deadline") or "").strip() or "Not specified"

        return {
            "id": scheme.get("id"),
            "name": name,
            "category": category,
            "benefits": benefits,
            "eligibility": eligibility,
            "documents": docs,
            "documents_count": len(docs),
            "official_url": official_url,
            "deadline": deadline,
        }

    norm_s1 = _normalize_scheme(s1)
    norm_s2 = _normalize_scheme(s2)

    docs1_lower = {d.lower(): d for d in norm_s1["documents"]}
    docs2_lower = {d.lower(): d for d in norm_s2["documents"]}
    common_docs = [orig for low, orig in docs1_lower.items() if low in docs2_lower]

    comparison = {
        "benefits": {
            norm_s1["name"]: norm_s1["benefits"],
            norm_s2["name"]: norm_s2["benefits"],
        },
        "eligibility": {
            norm_s1["name"]: norm_s1["eligibility"],
            norm_s2["name"]: norm_s2["eligibility"],
        },
        "documents": {
            norm_s1["name"]: norm_s1["documents"],
            norm_s2["name"]: norm_s2["documents"],
            "common_documents": common_docs,
        },
        "official_links": {
            norm_s1["name"]: norm_s1["official_url"],
            norm_s2["name"]: norm_s2["official_url"],
        },
    }

    return {
        "success": True,
        "message": f"Successfully compared '{norm_s1['name']}' and '{norm_s2['name']}'.",
        "scheme_1": norm_s1,
        "scheme_2": norm_s2,
        "comparison": comparison,
    }

