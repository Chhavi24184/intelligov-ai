"""
tests/test_chatbot_rag.py
-------------------------
Automated tests for chatbot and RAG services:
- Query expansion and rewriting
- Intent classification
- IBM Granite watsonx client generation and fallback handling
- End-to-end generate_reply chat generation
- POST /chat API endpoint
"""

import pytest
from services.rag_service import rewrite_query
from agents.orchestrator import OrchestratorAgent
from services.granite_service import MockGraniteClient, IBMGraniteClient, granite_client
from services.chat_service import generate_reply


def test_query_rewriting():
    expanded = rewrite_query("I need education support")
    assert "education" in expanded.lower()
    # Empty query should return as-is
    assert rewrite_query("") == ""


def test_intent_detection():
    orchestrator = OrchestratorAgent()
    intent_scheme = orchestrator.route("Which scheme can give me financial help for agriculture?")
    assert intent_scheme.intent == "scheme"


def test_mock_granite_client():
    mock_client = MockGraniteClient()
    context = [
        {
            "name": "PM Kisan Samman Nidhi",
            "category": "Farmer",
            "description": "Income support for farmers",
            "benefits": "₹6,000 per year",
            "eligibility": "Landholding farmers",
        }
    ]
    reply = mock_client.generate(
        query="What is PM Kisan?",
        context=context,
        language="en",
        intent_type="scheme"
    )
    assert "PM Kisan" in reply
    assert "₹6,000" in reply


def test_granite_client_active_or_fallback():
    # Granite client is instantiated
    assert granite_client is not None
    context = [
        {
            "name": "Ayushman Bharat",
            "category": "Healthcare",
            "description": "Health coverage",
            "benefits": "₹5 lakh health cover",
        }
    ]
    reply = granite_client.generate(
        query="How much coverage in Ayushman Bharat?",
        context=context,
        language="en"
    )
    assert isinstance(reply, str)
    assert len(reply) > 10


def test_generate_reply_flow():
    profile = {
        "age": 28,
        "occupation": "farmer",
        "state": "Punjab",
        "income": "below 1 lakh",
        "category": "general"
    }
    result = generate_reply(
        message="Tell me about schemes for farmers",
        profile=profile,
        language="en"
    )
    assert isinstance(result, dict)
    assert "text" in result
    assert len(result["text"]) > 0


def test_chat_api_endpoint(client):
    response = client.post(
        "/chat",
        json={
            "message": "Which schemes help farmers?",
            "language": "en"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "text" in data["data"]
