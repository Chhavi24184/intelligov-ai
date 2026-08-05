import json
from pathlib import Path


def get_all_schemes():
    data_file = Path(__file__).parent.parent / "data" / "schemes.json"

    with open(data_file, "r", encoding="utf-8") as file:
        return json.load(file)