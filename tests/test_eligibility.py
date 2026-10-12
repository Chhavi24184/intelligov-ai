"""
tests/test_eligibility.py
-------------------------
Automated tests for eligibility engine:
- Income conversion parsing (strings, lakhs, ranges, integers)
- Category matching and reservation restrictions
- Eligibility matching across diverse demographic profiles
- API endpoints for eligibility calculation and profile matching
"""

import pytest
from services.eligibility_service import (
    _income_to_numeric,
    _scheme_is_reserved_category,
    check_eligibility,
)


# =========================================================
# 1. INCOME CONVERSION
# =========================================================

def test_income_to_numeric():
    assert _income_to_numeric(50000) == 50000
    assert _income_to_numeric("Below ₹1 lakh") == 50000
    assert _income_to_numeric("₹1–2.5 lakh") == 175000
    assert _income_to_numeric("2.5 to 5 lakh") == 375000
    assert _income_to_numeric("Above ₹8 lakh") == 900000
    assert _income_to_numeric("student") == 0
    assert _income_to_numeric(None) == 0


# =========================================================
# 2. RESERVED CATEGORY IDENTIFICATION
# =========================================================

def test_scheme_is_reserved_category():
    obc_scheme = {"name": "Pre-Matric Scholarship for OBC Students", "eligibility": "Students from OBC categories"}
    assert _scheme_is_reserved_category(obc_scheme) == "obc"

    general_scheme = {"name": "PM Kisan Samman Nidhi", "eligibility": "Eligible landholding farmer families"}
    assert _scheme_is_reserved_category(general_scheme) == ""


# =========================================================
# 3. ELIGIBILITY MATCHING PROFILES
# =========================================================

def test_farmer_eligibility():
    results = check_eligibility(
        age=35,
        occupation="farmer",
        income="below 1 lakh",
        gender="male",
        state="Uttar Pradesh"
    )
    assert len(results) > 0
    names = [s["name"] for s in results]
    assert any("PM Kisan" in n for n in names)


def test_student_eligibility():
    results = check_eligibility(
        age=20,
        occupation="student",
        income="1-2.5 lakh",
        gender="male",
        state="Delhi",
        education="12th"
    )
    assert len(results) > 0
    categories = [s.get("category", "") for s in results]
    assert any("Education" in c or "Scholarship" in c for c in categories)


def test_artisan_eligibility():
    results = check_eligibility(
        age=30,
        occupation="artisan",
        income="below 1 lakh",
        gender="female",
        state="Rajasthan"
    )
    assert len(results) > 0
    names = [s["name"] for s in results]
    assert any("Vishwakarma" in n for n in names)


# =========================================================
# 4. ELIGIBILITY API ENDPOINTS
# =========================================================

def test_public_eligibility_calculator_api(client):
    response = client.post(
        "/eligibility",
        json={
            "age": 28,
            "occupation": "farmer",
            "income": "below 1 lakh",
            "gender": "male",
            "state": "Punjab"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["eligible"] is True
    assert len(data["data"]["recommended_schemes"]) > 0


def test_eligibility_calculator_validation_error(client):
    # Missing required field state
    response = client.post(
        "/eligibility",
        json={
            "age": 28,
            "occupation": "farmer",
            "income": 0,
            "state": ""
        }
    )
    assert response.status_code == 422 or response.status_code == 400


def test_match_schemes_by_profile_api(client, auth_headers_user1, test_user_1):
    response = client.get(
        f"/match-schemes/{test_user_1.id}",
        headers=auth_headers_user1
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "schemes" in data["data"]


def test_eligibility_by_profile_api(client, auth_headers_user1, test_user_1):
    response = client.get(
        f"/eligibility/by-profile/{test_user_1.id}",
        headers=auth_headers_user1
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["eligible"] is True
