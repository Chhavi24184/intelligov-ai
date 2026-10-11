"""
scheme_service.py
-----------------
Provides government scheme data for IntelliGov AI.

Data source:
  - PRIMARY : schemes.json  (30 curated, enriched, verified schemes)
  - DYNAMIC : myscheme.gov.in public API — attempted on each call.
              Returns 401 Unauthorized without an API key, so always
              falls back to the JSON file.  The fallback is intentional
              and the JSON data is the canonical authoritative source.

The schemes.json file is NEVER removed — it is always the safety net.
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
    Return all schemes.
    Tries dynamic source first; falls back to schemes.json.
    """
    live = _try_fetch_dynamic()
    if live:
        return live
    return _load_from_json()


def get_schemes_source() -> dict:
    """
    Returns metadata about which data source is currently active.
    Used by the /schemes/source endpoint so the frontend can show
    an honest data-source badge.
    """
    api_key_set = bool(_MYSCHEME_API_KEY)
    return {
        "source":        "myscheme.gov.in (live)" if api_key_set else "schemes.json (curated)",
        "source_type":   "dynamic" if api_key_set else "static",
        "total_schemes": len(get_all_schemes()),
        "note": (
            "Live data from myscheme.gov.in is active."
            if api_key_set
            else
            "Using 30 curated and enriched government schemes from schemes.json. "
            "To enable live data, set MYSCHEME_API_KEY in backend/.env."
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
