"""
mcp_server.py
-------------
Lightweight Model Context Protocol (MCP) server for IntelliGov AI.
Exposes tools for:
  1. search_schemes(query, category, limit)
  2. get_scheme_details(scheme_id, name)
  3. check_eligibility(age, occupation, income, state, gender, category, education, scheme_name)

Maintains strictly rule-based eligibility verification through
services.eligibility_service.
"""

import sys
from pathlib import Path
from typing import Optional, Union, Dict, Any, List

# Ensure backend root is on sys.path
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from mcp.server.mcpserver import MCPServer
from services.scheme_service import get_all_schemes, search_schemes as base_search_schemes
from services.eligibility_service import check_eligibility as evaluate_eligibility, _build_eligibility_checklist

mcp_server = MCPServer(
    name="intelligov-mcp-server",
    instructions=(
        "IntelliGov AI MCP Server provides official Indian government scheme search, "
        "detailed scheme parameters, and deterministic rule-based eligibility evaluation."
    )
)


@mcp_server.tool()
def search_schemes(
    query: str = "",
    category: Optional[str] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Search Indian government schemes by keyword query and optional category.

    Args:
        query: Search term for scheme name, description, or domain keywords.
        category: Filter by scheme category (e.g., 'Agriculture', 'Healthcare', 'Education').
        limit: Maximum number of schemes to return (default 10).

    Returns:
        A list of matching scheme summaries.
    """
    if query.strip():
        results = base_search_schemes(query)
    else:
        results = get_all_schemes()

    if category and category.strip():
        cat_lower = category.strip().lower()
        results = [s for s in results if s.get("category", "").lower() == cat_lower]

    trimmed = []
    for s in results[:limit]:
        trimmed.append({
            "id": s.get("id"),
            "name": s.get("name"),
            "category": s.get("category"),
            "description": s.get("description"),
            "deadline": s.get("deadline", "Ongoing"),
            "official_url": s.get("official_url", ""),
        })
    return trimmed


@mcp_server.tool()
def get_scheme_details(
    scheme_id: Optional[Union[int, str]] = None,
    name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Retrieve complete official details for a specific government scheme by ID or name.

    Args:
        scheme_id: The unique ID of the scheme (e.g., 1).
        name: Name or title of the scheme (e.g., 'PM Kisan Samman Nidhi').

    Returns:
        Detailed dictionary containing benefits, eligibility criteria, required documents, and portal URL.
    """
    all_schemes = get_all_schemes()

    if scheme_id is not None:
        scheme_id_str = str(scheme_id).strip()
        for s in all_schemes:
            if str(s.get("id")) == scheme_id_str:
                return s

    if name and name.strip():
        name_lower = name.strip().lower()
        # Exact or substring match
        for s in all_schemes:
            if name_lower == s.get("name", "").lower():
                return s
        for s in all_schemes:
            if name_lower in s.get("name", "").lower():
                return s

    return {
        "error": "Scheme not found",
        "query_id": scheme_id,
        "query_name": name,
    }


@mcp_server.tool()
def check_eligibility(
    age: int,
    occupation: str,
    state: str,
    income: Union[int, float, str] = 0,
    gender: str = "",
    category: str = "",
    education: str = "",
    scheme_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Strictly rule-based eligibility evaluation for Indian citizen government schemes.

    Args:
        age: Citizen age in years.
        occupation: Citizen occupation (e.g., 'farmer', 'student', 'unemployed').
        state: State of residence (e.g., 'Punjab', 'Delhi').
        income: Annual family income (number or descriptor like 'Below ₹1 lakh').
        gender: Gender of the citizen ('male', 'female', etc.).
        category: Social category (e.g., 'General', 'OBC', 'SC', 'ST', 'EWS').
        education: Highest education level (e.g., '10th', 'Graduate').
        scheme_name: Optional scheme name to test eligibility specifically against.

    Returns:
        Structured evaluation with matched criteria, score, status, and eligible schemes list.
    """
    profile = {
        "age": age,
        "occupation": occupation,
        "income": income,
        "gender": gender,
        "state": state,
        "category": category,
        "education": education,
    }

    eligible_schemes = evaluate_eligibility(
        age=age,
        occupation=occupation,
        income=income,
        gender=gender,
        state=state,
        category=category,
        education=education,
    )

    if scheme_name and scheme_name.strip():
        target_lower = scheme_name.strip().lower()
        target_scheme = None
        for s in eligible_schemes:
            if target_lower in s.get("name", "").lower():
                target_scheme = s
                break

        if not target_scheme:
            # Check entire catalogue to see if scheme exists but user is ineligible
            for s in get_all_schemes():
                if target_lower in s.get("name", "").lower():
                    checklist = _build_eligibility_checklist(s, profile)
                    return {
                        "scheme": s.get("name"),
                        "is_eligible": False,
                        "eligibility_score": 0,
                        "checklist": checklist,
                        "reason": "Criteria not satisfied based on deterministic rules."
                    }
            return {
                "error": f"Scheme '{scheme_name}' not found in database.",
                "is_eligible": False
            }

        checklist = _build_eligibility_checklist(target_scheme, profile)
        return {
            "scheme": target_scheme.get("name"),
            "is_eligible": True,
            "eligibility_score": target_scheme.get("eligibility_score", 0),
            "match_reasons": target_scheme.get("eligibility_reasons", []),
            "checklist": checklist,
            "benefits": target_scheme.get("benefits", ""),
            "documents": target_scheme.get("documents", []),
            "official_url": target_scheme.get("official_url", ""),
        }

    # Return top 5 general eligible schemes
    summaries = []
    for s in eligible_schemes[:5]:
        summaries.append({
            "name": s.get("name"),
            "category": s.get("category"),
            "score": s.get("eligibility_score"),
            "match_reasons": s.get("eligibility_reasons", []),
            "benefits": s.get("benefits", ""),
        })

    return {
        "total_eligible_schemes": len(eligible_schemes),
        "top_matches": summaries,
        "evaluated_profile": {
            "age": age,
            "occupation": occupation,
            "state": state,
            "category": category,
        }
    }


if __name__ == "__main__":
    # Support stdio execution for MCP clients
    mcp_server.run()
