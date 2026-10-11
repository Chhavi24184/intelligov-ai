
"""
Document Eligibility Service
-----------------------------
Compares a user's available documents against the
documents required by a government scheme.
"""


def _normalise_document(document: str) -> str:
    """Normalise document text for comparison."""

    return (
        str(document or "")
        .lower()
        .strip()
        .replace("-", " ")
        .replace("_", " ")
    )


def _document_matches(required: str, available: list[str]) -> bool:
    """
    Check whether a required document is available.

    Uses simple keyword/phrase matching so that variations such as:
    'Aadhaar Card' and 'Aadhaar' are treated as the same document.
    """

    required_text = _normalise_document(required)

    aliases = {
        "aadhaar": ["aadhaar", "aadhar", "aadhaar card", "aadhar card"],
        "pan": ["pan", "pan card"],
        "bank": [
            "bank account",
            "bank account details",
            "bank passbook",
            "bank statement",
        ],
        "income": [
            "income certificate",
            "income proof",
            "income document",
        ],
        "address": [
            "address proof",
            "residence proof",
            "residential proof",
            "domicile",
        ],
        "caste": [
            "caste certificate",
            "category certificate",
            "sc certificate",
            "st certificate",
            "obc certificate",
            "ews certificate",
        ],
        "education": [
            "education certificate",
            "educational certificate",
            "marksheet",
            "mark sheet",
            "degree certificate",
            "school certificate",
        ],
        "passport": ["passport"],
        "voter": ["voter id", "voter card", "election card"],
        "disability": [
            "disability certificate",
            "pwd certificate",
            "benchmark disability certificate",
        ],
    }

    for item in available:
        available_text = _normalise_document(item)

        if required_text in available_text:
            return True

        for alias_group in aliases.values():
            required_matches = any(
                alias in required_text
                for alias in alias_group
            )

            available_matches = any(
                alias in available_text
                for alias in alias_group
            )

            if required_matches and available_matches:
                return True

    return False


def check_document_eligibility(
    scheme: dict,
    available_documents: list[str],
) -> dict:
    """
    Compare available user documents with scheme requirements.
    """

    required_documents = scheme.get("documents", []) or []

    available_documents = [
        str(document).strip()
        for document in (available_documents or [])
        if str(document).strip()
    ]

    matched_documents = []
    missing_documents = []

    for required in required_documents:

        if _document_matches(
            required,
            available_documents
        ):
            matched_documents.append(required)
        else:
            missing_documents.append(required)

    total_required = len(required_documents)

    if total_required == 0:
        match_percentage = 100
    else:
        match_percentage = round(
            (len(matched_documents) / total_required) * 100
        )

    if not required_documents:
        status = "No document requirements listed"
    elif not missing_documents:
        status = "Documents Complete"
    elif matched_documents:
        status = "Partially Complete"
    else:
        status = "Documents Missing"

    return {
        "scheme_name": scheme.get("name", ""),
        "required_documents": required_documents,
        "available_documents": available_documents,
        "matched_documents": matched_documents,
        "missing_documents": missing_documents,
        "document_match_percentage": match_percentage,
        "document_status": status,
    }


def check_documents_for_schemes(
    schemes: list[dict],
    available_documents: list[str],
) -> list[dict]:
    """
    Check document eligibility for multiple schemes.
    """

    results = []

    for scheme in schemes:

        result = check_document_eligibility(
            scheme,
            available_documents,
        )

        results.append(result)

    results.sort(
        key=lambda item: item["document_match_percentage"],
        reverse=True,
    )

    return results
