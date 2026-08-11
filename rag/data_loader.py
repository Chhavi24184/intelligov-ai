import json
from pathlib import Path


def load_schemes(file_path="Government_Schemes.json"):
    """
    Load government schemes from JSON file.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Government schemes file not found: {file_path}"
        )

    with open(path, "r", encoding="utf-8") as file:
        schemes = json.load(file)

    if not isinstance(schemes, list):
        raise ValueError("Government_Schemes.json must contain a list of schemes.")

    return schemes


def scheme_to_text(scheme):
    """
    Convert a scheme JSON object into searchable text.
    """

    documents = scheme.get("documents", [])

    if isinstance(documents, list):
        documents_text = ", ".join(documents)
    else:
        documents_text = str(documents)

    return f"""
Scheme Name: {scheme.get('name', 'Unknown')}
Category: {scheme.get('category', 'Unknown')}
Description: {scheme.get('description', 'Not available')}
Eligibility: {scheme.get('eligibility', 'Not available')}
Required Documents: {documents_text}
""".strip()


def prepare_documents(schemes):
    """
    Convert all schemes into text documents.
    """

    documents = []

    for scheme in schemes:
        documents.append({
            "id": scheme.get("id"),
            "name": scheme.get("name"),
            "category": scheme.get("category"),
            "text": scheme_to_text(scheme),
            "data": scheme
        })

    return documents