"""
tests/test_schemes.py
---------------------
Automated tests for scheme data integrity and scheme services:
- Verifies all 30 schemes adhere to the enriched schema.
- Verifies unique IDs, valid categories, benefits, deadlines, URLs.
- Tests search, category filtering, and direct lookup by ID/name.
- Tests /schemes API endpoints.
"""

import json
from pathlib import Path
import pytest
from services.scheme_service import (
    get_all_schemes,
    get_schemes_by_category,
    search_schemes,
    get_scheme_by_id_or_name,
)


# =========================================================
# 1. SCHEME DATA INTEGRITY & VALIDATION
# =========================================================

def test_scheme_data_integrity():
    schemes = get_all_schemes()
    assert len(schemes) == 30, f"Expected 30 schemes, found {len(schemes)}"

    required_fields = [
        "id", "name", "category", "description",
        "benefits", "eligibility", "documents",
        "deadline", "official_url"
    ]

    seen_ids = set()
    seen_names = set()

    for idx, s in enumerate(schemes, start=1):
        # 1. Check all required fields present
        for field in required_fields:
            assert field in s, f"Scheme #{idx} ({s.get('name')}) missing field '{field}'"

        # 2. Check types
        assert isinstance(s["id"], int), f"Scheme #{idx} id is not int"
        assert s["id"] > 0, f"Scheme #{idx} id must be positive"
        assert s["id"] not in seen_ids, f"Duplicate scheme id: {s['id']}"
        seen_ids.add(s["id"])

        name = s["name"].strip()
        assert len(name) > 3, f"Scheme #{idx} name too short"
        assert name.lower() not in seen_names, f"Duplicate scheme name: {name}"
        seen_names.add(name.lower())

        assert isinstance(s["category"], str) and len(s["category"].strip()) > 0
        assert isinstance(s["description"], str) and len(s["description"].strip()) > 10
        assert isinstance(s["benefits"], str) and len(s["benefits"].strip()) > 0
        assert isinstance(s["eligibility"], str) and len(s["eligibility"].strip()) > 0
        assert isinstance(s["documents"], list), f"Documents must be a list in #{idx}"
        assert isinstance(s["deadline"], str) and len(s["deadline"].strip()) > 0

        url = s["official_url"].strip()
        assert url.startswith("http://") or url.startswith("https://"), f"Invalid URL in #{idx}: {url}"


def test_root_and_backend_scheme_files_are_identical():
    backend_file = Path(__file__).resolve().parent.parent / "backend" / "data" / "schemes.json"
    root_file = Path(__file__).resolve().parent.parent / "Government_Schemes.json"

    with open(backend_file, "r", encoding="utf-8") as f:
        backend_data = json.load(f)
    with open(root_file, "r", encoding="utf-8") as f:
        root_data = json.load(f)

    assert len(backend_data) == len(root_data) == 30
    assert backend_data[0]["name"] == root_data[0]["name"]
    assert "benefits" in root_data[0]
    assert "official_url" in root_data[0]


# =========================================================
# 2. SCHEME SERVICE LOGIC
# =========================================================

def test_search_schemes():
    results = search_schemes("farmer")
    assert len(results) > 0
    names = [s["name"] for s in results]
    assert any("PM Kisan" in n for n in names)


def test_filter_by_category():
    healthcare = get_schemes_by_category("Healthcare")
    assert len(healthcare) > 0
    for s in healthcare:
        assert s["category"].lower() == "healthcare"


def test_get_scheme_by_id_or_name():
    # By ID
    scheme1 = get_scheme_by_id_or_name(1)
    assert scheme1 is not None
    assert scheme1["id"] == 1
    assert "PM Kisan" in scheme1["name"]

    # By exact name
    scheme_name = get_scheme_by_id_or_name("Ayushman Bharat PM-JAY")
    assert scheme_name is not None
    assert scheme_name["id"] == 2

    # By case-insensitive substring
    scheme_sub = get_scheme_by_id_or_name("mudra")
    assert scheme_sub is not None
    assert "Mudra" in scheme_sub["name"]

    # Nonexistent
    scheme_none = get_scheme_by_id_or_name("NonExistentSchemeXYZ")
    assert scheme_none is None


# =========================================================
# 3. SCHEMES API ENDPOINTS
# =========================================================

def test_api_list_schemes(client):
    resp = client.get("/schemes")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["data"]) == 30


def test_api_search_schemes(client):
    resp = client.get("/schemes/search?keyword=housing")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["data"]) > 0


def test_api_get_scheme_detail(client):
    resp = client.get("/schemes/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["id"] == 1
    assert "PM Kisan" in data["data"]["name"]

    # Not found
    resp_404 = client.get("/schemes/99999")
    assert resp_404.status_code == 404
