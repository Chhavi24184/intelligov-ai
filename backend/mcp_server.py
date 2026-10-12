"""
backend/mcp_server.py
---------------------
Lightweight Model Context Protocol (MCP) Server for IntelliGov AI.
Exposes working tools for:
  1. search_schemes: Search welfare schemes by keyword and/or category.
  2. get_scheme_details: Fetch complete scheme details by ID or name.
  3. check_eligibility: Evaluate citizen eligibility against schemes.

Compliant with JSON-RPC 2.0 / MCP Protocol (Version 2024-11-05).
Reuses existing backend logic from services/scheme_service.py and services/eligibility_service.py.
"""

import sys
import json
import logging
from typing import Dict, Any, List, Optional

# Setup path so backend modules can be imported
from pathlib import Path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from services.scheme_service import (
    get_all_schemes,
    search_schemes as service_search_schemes,
    get_schemes_by_category,
    get_scheme_by_id_or_name,
)
from services.eligibility_service import check_eligibility as service_check_eligibility

logger = logging.getLogger("mcp_server")
logger.setLevel(logging.INFO)

# =========================================================
# MCP TOOL DEFINITIONS
# =========================================================

MCP_TOOLS: List[Dict[str, Any]] = [
    {
        "name": "search_schemes",
        "description": "Search Indian government welfare schemes by keyword or optional category.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "keyword": {
                    "type": "string",
                    "description": "Search keyword or phrase (e.g. 'farmer', 'scholarship', 'health', 'housing')"
                },
                "category": {
                    "type": "string",
                    "description": "Optional category filter (e.g. 'Farmer', 'Education', 'Healthcare', 'Housing', 'Business')"
                }
            },
            "required": ["keyword"]
        }
    },
    {
        "name": "get_scheme_details",
        "description": "Get complete detailed information about a specific government scheme by its numeric ID or scheme name.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "scheme_id": {
                    "type": "integer",
                    "description": "Numeric scheme ID (1-30)"
                },
                "scheme_name": {
                    "type": "string",
                    "description": "Exact or partial scheme name (e.g., 'PM Kisan Samman Nidhi', 'Ayushman Bharat')"
                }
            }
        }
    },
    {
        "name": "check_eligibility",
        "description": "Check citizen eligibility against government welfare schemes based on demographics (age, occupation, state, income, category, gender, education).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "age": {
                    "type": "integer",
                    "description": "Age of the citizen in years (e.g., 25)"
                },
                "occupation": {
                    "type": "string",
                    "description": "Primary occupation (e.g., 'farmer', 'student', 'artisan', 'business', 'unemployed')"
                },
                "state": {
                    "type": "string",
                    "description": "State or UT of residence in India (e.g., 'Punjab', 'Delhi', 'Maharashtra')"
                },
                "income": {
                    "type": "string",
                    "description": "Annual family income range (e.g., 'below 1 lakh', '1-2.5 lakh', '2.5-5 lakh') or numeric amount"
                },
                "category": {
                    "type": "string",
                    "description": "Social reservation category ('general', 'obc', 'sc', 'st', 'ews', 'tribal')"
                },
                "gender": {
                    "type": "string",
                    "description": "Gender ('male', 'female', 'other')"
                },
                "education": {
                    "type": "string",
                    "description": "Educational qualification (e.g., '10th', '12th', 'graduate', 'postgraduate')"
                }
            },
            "required": ["age", "occupation", "state"]
        }
    }
]


# =========================================================
# TOOL EXECUTION HANDLERS
# =========================================================

def execute_search_schemes(args: Dict[str, Any]) -> Dict[str, Any]:
    keyword = str(args.get("keyword", "")).strip()
    category = args.get("category")

    if not keyword and not category:
        results = get_all_schemes()
    elif category and not keyword:
        results = get_schemes_by_category(category)
    else:
        results = service_search_schemes(keyword)
        if category:
            results = [
                s for s in results
                if str(s.get("category", "")).lower() == str(category).lower()
            ]

    return {
        "total_results": len(results),
        "keyword": keyword,
        "category_filter": category,
        "schemes": [
            {
                "id": s.get("id"),
                "name": s.get("name"),
                "category": s.get("category"),
                "description": s.get("description"),
                "benefits": s.get("benefits"),
                "eligibility": s.get("eligibility"),
                "official_url": s.get("official_url"),
            }
            for s in results
        ]
    }


def execute_get_scheme_details(args: Dict[str, Any]) -> Dict[str, Any]:
    scheme_id = args.get("scheme_id")
    scheme_name = args.get("scheme_name")

    identifier = scheme_id if scheme_id is not None else scheme_name
    if identifier is None:
        return {
            "error": "Either 'scheme_id' or 'scheme_name' must be provided."
        }

    scheme = get_scheme_by_id_or_name(identifier)
    if not scheme:
        return {
            "found": False,
            "message": f"Scheme '{identifier}' not found in database."
        }

    return {
        "found": True,
        "scheme": scheme
    }


def execute_check_eligibility(args: Dict[str, Any]) -> Dict[str, Any]:
    age = args.get("age")
    occupation = args.get("occupation", "")
    state = args.get("state", "")
    income = args.get("income", 0)
    category = args.get("category", "")
    gender = args.get("gender", "")
    education = args.get("education", "")

    if age is None:
        return {"error": "Missing required field: 'age'"}
    if not occupation:
        return {"error": "Missing required field: 'occupation'"}
    if not state:
        return {"error": "Missing required field: 'state'"}

    try:
        age_int = int(age)
    except (ValueError, TypeError):
        return {"error": f"Invalid age value: {age}"}

    matched_schemes = service_check_eligibility(
        age=age_int,
        occupation=occupation,
        income=income,
        gender=gender,
        state=state,
        category=category,
        education=education,
    )

    return {
        "eligible": len(matched_schemes) > 0,
        "total_matches": len(matched_schemes),
        "criteria_evaluated": {
            "age": age_int,
            "occupation": occupation,
            "state": state,
            "income": income,
            "category": category,
            "gender": gender,
            "education": education,
        },
        "recommended_schemes": matched_schemes,
    }


# =========================================================
# JSON-RPC DISPATCHER
# =========================================================

def handle_json_rpc(request: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Process an incoming MCP JSON-RPC 2.0 message and produce the response.
    """
    method = request.get("method")
    msg_id = request.get("id")
    params = request.get("params", {})

    # Handshake: initialize
    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "intelligov-mcp-server",
                    "version": "1.0.0"
                }
            }
        }

    # Notification: notifications/initialized (no response needed)
    if method == "notifications/initialized":
        return None

    # Ping
    if method == "ping":
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {}
        }

    # List available tools
    if method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {
                "tools": MCP_TOOLS
            }
        }

    # Call a tool
    if method == "tools/call":
        tool_name = params.get("name")
        tool_args = params.get("arguments", {})

        try:
            if tool_name == "search_schemes":
                output = execute_search_schemes(tool_args)
            elif tool_name == "get_scheme_details":
                output = execute_get_scheme_details(tool_args)
            elif tool_name == "check_eligibility":
                output = execute_check_eligibility(tool_args)
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "error": {
                        "code": -32601,
                        "message": f"Tool '{tool_name}' not found."
                    }
                }

            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": json.dumps(output, indent=2, ensure_ascii=False)
                        }
                    ]
                }
            }
        except Exception as exc:
            logger.exception("Error executing tool %s: %s", tool_name, exc)
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "error": {
                    "code": -32000,
                    "message": f"Execution failed: {str(exc)}"
                }
            }

    # Unknown method
    return {
        "jsonrpc": "2.0",
        "id": msg_id,
        "error": {
            "code": -32601,
            "message": f"Method '{method}' not implemented."
        }
    }


# =========================================================
# STDIO SERVER RUNNER
# =========================================================

def run_stdio():
    """
    Run the MCP server over standard I/O (stdin/stdout).
    Reads line-delimited JSON-RPC requests and writes line-delimited responses.
    """
    sys.stderr.write("IntelliGov AI MCP Server started (stdio mode)\n")
    sys.stderr.flush()

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            req = json.loads(line)
        except json.JSONDecodeError as err:
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": f"Parse error: {err}"}
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()
            continue

        resp = handle_json_rpc(req)
        if resp is not None:
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    run_stdio()
