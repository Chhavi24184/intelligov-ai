"""
tests/test_mcp_server.py
------------------------
Automated tests for the Model Context Protocol (MCP) server:
- JSON-RPC 2.0 protocol compliance (initialize, ping, tools/list, tools/call)
- Tool execution: search_schemes, get_scheme_details, check_eligibility
- Error handling for unknown tools, invalid parameters, malformed requests
- Integration with FastAPI /mcp HTTP endpoints
"""

import json
import pytest
from mcp_server import (
    MCP_TOOLS,
    handle_json_rpc,
    execute_search_schemes,
    execute_get_scheme_details,
    execute_check_eligibility,
)


# =========================================================
# 1. MCP HANDSHAKE & TOOL DISCOVERY
# =========================================================

def test_mcp_initialize():
    req = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "test-client", "version": "1.0"}
        }
    }
    resp = handle_json_rpc(req)
    assert resp["jsonrpc"] == "2.0"
    assert resp["id"] == 1
    result = resp["result"]
    assert result["protocolVersion"] == "2024-11-05"
    assert "tools" in result["capabilities"]
    assert result["serverInfo"]["name"] == "intelligov-mcp-server"


def test_mcp_ping():
    req = {"jsonrpc": "2.0", "id": 99, "method": "ping"}
    resp = handle_json_rpc(req)
    assert resp["jsonrpc"] == "2.0"
    assert resp["id"] == 99
    assert resp["result"] == {}


def test_mcp_tools_list():
    req = {"jsonrpc": "2.0", "id": 2, "method": "tools/list"}
    resp = handle_json_rpc(req)
    assert resp["jsonrpc"] == "2.0"
    assert resp["id"] == 2
    tools = resp["result"]["tools"]
    tool_names = [t["name"] for t in tools]

    assert "search_schemes" in tool_names
    assert "get_scheme_details" in tool_names
    assert "check_eligibility" in tool_names

    for t in tools:
        assert "description" in t
        assert "inputSchema" in t
        assert t["inputSchema"]["type"] == "object"


# =========================================================
# 2. MCP TOOL EXECUTION VIA JSON-RPC
# =========================================================

def test_mcp_tool_search_schemes():
    req = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "search_schemes",
            "arguments": {"keyword": "farmer"}
        }
    }
    resp = handle_json_rpc(req)
    assert resp["id"] == 3
    content = resp["result"]["content"]
    assert len(content) > 0
    text_data = json.loads(content[0]["text"])

    assert text_data["total_results"] > 0
    assert any("PM Kisan" in s["name"] for s in text_data["schemes"])


def test_mcp_tool_get_scheme_details():
    # By ID
    req_id = {
        "jsonrpc": "2.0",
        "id": 4,
        "method": "tools/call",
        "params": {
            "name": "get_scheme_details",
            "arguments": {"scheme_id": 1}
        }
    }
    resp_id = handle_json_rpc(req_id)
    text_data = json.loads(resp_id["result"]["content"][0]["text"])
    assert text_data["found"] is True
    assert text_data["scheme"]["id"] == 1
    assert "benefits" in text_data["scheme"]

    # By name
    req_name = {
        "jsonrpc": "2.0",
        "id": 5,
        "method": "tools/call",
        "params": {
            "name": "get_scheme_details",
            "arguments": {"scheme_name": "Ayushman Bharat PM-JAY"}
        }
    }
    resp_name = handle_json_rpc(req_name)
    text_data2 = json.loads(resp_name["result"]["content"][0]["text"])
    assert text_data2["found"] is True
    assert text_data2["scheme"]["id"] == 2


def test_mcp_tool_check_eligibility():
    req = {
        "jsonrpc": "2.0",
        "id": 6,
        "method": "tools/call",
        "params": {
            "name": "check_eligibility",
            "arguments": {
                "age": 28,
                "occupation": "farmer",
                "state": "Punjab",
                "income": "below 1 lakh",
                "gender": "male"
            }
        }
    }
    resp = handle_json_rpc(req)
    text_data = json.loads(resp["result"]["content"][0]["text"])
    assert text_data["eligible"] is True
    assert text_data["total_matches"] > 0
    assert any("PM Kisan" in s["name"] for s in text_data["recommended_schemes"])


def test_mcp_unknown_tool_returns_error():
    req = {
        "jsonrpc": "2.0",
        "id": 7,
        "method": "tools/call",
        "params": {
            "name": "unknown_fictional_tool",
            "arguments": {}
        }
    }
    resp = handle_json_rpc(req)
    assert "error" in resp
    assert resp["error"]["code"] == -32601


# =========================================================
# 3. FASTAPI MCP HTTP ENDPOINTS
# =========================================================

def test_api_mcp_tools_list(client):
    resp = client.get("/mcp/tools")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["tools"]) == 3


def test_api_mcp_rpc_endpoint(client):
    req = {
        "jsonrpc": "2.0",
        "id": 101,
        "method": "tools/call",
        "params": {
            "name": "get_scheme_details",
            "arguments": {"scheme_id": 2}
        }
    }
    resp = client.post("/mcp/rpc", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == 101
    assert "Ayushman Bharat" in data["result"]["content"][0]["text"]


def test_api_mcp_direct_tool_call(client):
    resp = client.post(
        "/mcp/tools/search_schemes",
        json={"keyword": "scholarship"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_results"] > 0
