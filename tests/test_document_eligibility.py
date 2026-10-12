"""
tests/test_document_eligibility.py
----------------------------------
Unit tests for Document Eligibility Service.
"""

import pytest
from services.document_eligibility_service import check_document_eligibility


def test_empty_required_documents_returns_na():
    """When required_documents is empty, match percentage should be 'N/A'."""
    scheme_with_empty_docs = {
        "name": "Scheme Without Documents",
        "documents": [],
    }
    result = check_document_eligibility(
        scheme=scheme_with_empty_docs,
        available_documents=["Aadhaar Card", "PAN Card"],
    )
    assert result["document_match_percentage"] == "N/A"
    assert result["document_status"] == "No document requirements listed"


def test_missing_documents_key_returns_na():
    """When scheme has no documents key or None, match percentage should be 'N/A'."""
    scheme_none_docs = {
        "name": "Scheme With None Documents",
        "documents": None,
    }
    result = check_document_eligibility(
        scheme=scheme_none_docs,
        available_documents=["Aadhaar Card"],
    )
    assert result["document_match_percentage"] == "N/A"


def test_non_empty_required_documents_returns_percentage():
    """When required_documents are present, match percentage is calculated."""
    scheme = {
        "name": "Scheme With Documents",
        "documents": ["Aadhaar", "Income Certificate"],
    }
    result = check_document_eligibility(
        scheme=scheme,
        available_documents=["Aadhaar Card"],
    )
    assert result["document_match_percentage"] == 50
