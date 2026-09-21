import json
from pathlib import Path

_DATA_FILE = (
    Path(__file__).parent.parent
    / "data"
    / "schemes.json"
)

_schemes_cache: list | None = None


def get_all_schemes() -> list:
    global _schemes_cache
    if _schemes_cache is not None:
        return _schemes_cache
    with open(_DATA_FILE, "r", encoding="utf-8") as file:
        _schemes_cache = json.load(file)
    return _schemes_cache


def get_schemes_by_category(category: str):

    schemes = get_all_schemes()

    return [
        scheme
        for scheme in schemes
        if scheme.get("category", "").lower() == category.lower()
    ]


def search_schemes(keyword: str):

    keyword = keyword.lower().strip()

    schemes = get_all_schemes()

    results = []

    for scheme in schemes:

        if (
            keyword in scheme.get("name", "").lower()
            or keyword in scheme.get("category", "").lower()
            or keyword in scheme.get("description", "").lower()
        ):
            results.append(scheme)

    return results