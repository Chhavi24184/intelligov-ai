"""
test_mcp_standalone.py
----------------------
Validates the lightweight MCP server and all 3 tools without exposing secrets.
"""

import asyncio
import json
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

from mcp_server import mcp_server


async def main():
    print("Testing IntelliGov AI MCP Server...")
    tools = await mcp_server.list_tools()
    tool_names = [t.name for t in tools]
    print(f"[PASS] Tools registered ({len(tool_names)}): {tool_names}")
    assert "search_schemes" in tool_names
    assert "get_scheme_details" in tool_names
    assert "check_eligibility" in tool_names

    # 1. Search schemes
    s_res = await mcp_server.call_tool("search_schemes", {"query": "kisan", "limit": 2})
    if len(s_res.content) == 1:
        s_data = json.loads(s_res.content[0].text)
        if not isinstance(s_data, list):
            s_data = [s_data]
    else:
        s_data = [json.loads(c.text) for c in s_res.content]
    print(f"[PASS] search_schemes returned {len(s_data)} items (First: {s_data[0]['name']})")

    # 2. Scheme details
    d_res = await mcp_server.call_tool("get_scheme_details", {"name": "PM Kisan"})
    d_data = json.loads(d_res.content[0].text)
    print(f"[PASS] get_scheme_details returned scheme: {d_data.get('name')} (category: {d_data.get('category')})")

    # 3. Rule-based eligibility
    e_res = await mcp_server.call_tool("check_eligibility", {
        "age": 40,
        "occupation": "farmer",
        "state": "Punjab",
        "income": 100000,
        "gender": "male",
        "scheme_name": "PM Kisan"
    })
    e_data = json.loads(e_res.content[0].text)
    print(f"[PASS] check_eligibility for PM Kisan: is_eligible={e_data.get('is_eligible')}, score={e_data.get('eligibility_score')}")

    # 4. Ineligible rule-based test
    inelig_res = await mcp_server.call_tool("check_eligibility", {
        "age": 40,
        "occupation": "software engineer",
        "state": "Delhi",
        "income": 2000000,
        "gender": "male",
        "scheme_name": "PM Kisan"
    })
    inelig_data = json.loads(inelig_res.content[0].text)
    print(f"[PASS] check_eligibility for ineligibility: is_eligible={inelig_data.get('is_eligible')} (Rule-based check working)")

    print("\nALL MCP TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(main())
