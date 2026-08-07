import json
from pathlib import Path


def get_all_schemes():
    data_file = Path(__file__).parent.parent / "data" / "schemes.json"

    with open(data_file, "r", encoding="utf-8") as file:
        return json.load(file)


def get_schemes_by_category(category: str):

    schemes = get_all_schemes()

    return [
        scheme
        for scheme in schemes
        if scheme["category"].lower() == category.lower()
    ]


def search_schemes(keyword: str):

    keyword = keyword.lower()

    schemes = get_all_schemes()

    results = []

    for scheme in schemes:

        if (
            keyword in scheme["name"].lower()
            or keyword in scheme["category"].lower()
            or keyword in scheme["description"].lower()
        ):
            results.append(scheme)

    return results