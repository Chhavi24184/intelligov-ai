"""
backend/api/mcp.py
------------------
HTTP Router for Model Context Protocol (MCP) inspection and execution.
Enables testing and interacting with MCP tools over HTTP.
"""

from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional

from mcp_server import (
    MCP_TOOLS,
    execute_search_schemes,
    execute_get_scheme_details,
    execute_check_eligibility,
    handle_json_rpc,
)

router = APIRouter(
    prefix="/mcp",
    tags=["Model Context Protocol"]
)


@router.get("/tools")
def list_tools():
    """List all available tools in the MCP server."""
    return {
        "protocolVersion": "2024-11-05",
        "tools": MCP_TOOLS
    }


@router.post("/rpc")
def json_rpc_endpoint(request: Dict[str, Any] = Body(...)):
    """Standard JSON-RPC 2.0 endpoint for MCP protocol clients."""
    result = handle_json_rpc(request)
    if result is None:
        return {"status": "ok"}
    return result


@router.post("/tools/{tool_name}")
def call_tool_direct(tool_name: str, arguments: Dict[str, Any] = Body(...)):
    """Convenience REST endpoint to call an MCP tool directly."""
    if tool_name == "search_schemes":
        return execute_search_schemes(arguments)
    elif tool_name == "get_scheme_details":
        return execute_get_scheme_details(arguments)
    elif tool_name == "check_eligibility":
        return execute_check_eligibility(arguments)
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Tool '{tool_name}' not found."
        )
