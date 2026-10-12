#!/usr/bin/env python3
"""Fetch the public myScheme-derived catalogue and write IntelliGov's 9-field schema."""
import json
import re
import unicodedata
import urllib.request
from collections import Counter

SOURCE_URL = "https://raw.githubusercontent.com/Aryan-Pardeshi/gov-myscheme-dataset/main/gov_myscheme_data.json"
FIELDS = ["id", "name", "category", "description", "benefits", "eligibility", "documents", "deadline", "official_url"]

def clean(value):
    if value is None:
        return ""
    text = unicodedata.normalize("NFKC", str(value)).replace("\ufeff", "").replace("\xa0", " ")
    text = re.sub(r"[\u200b-\u200f\u202a-\u202e]", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()

def norm(value):
    text = unicodedata.normalize("NFKD", clean(value).casefold())
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text).strip()

def category_for(item):
    text = " ".join(clean(item.get(key, "")) for key in
        ["Scheme Name", "Tags / Categories", "Description", "State / UT / Ministry"]).lower()
    groups = [
        ("Agriculture and allied sectors", ["agriculture", "farmer", "kisan", "crop", "fisher", "fishery", "fisheries", "dairy", "livestock", "animal husbandry", "horticulture", "irrigation", "fertilizer", "seed", "sericulture", "coir", "handloom", "weaver"]),
        ("Healthcare and insurance", ["health", "medical", "hospital", "insurance", "ayush", "disease", "maternity", "pregnan", "nutrition", "treatment", "medicine", "patient"]),
        ("Education and scholarships", ["scholarship", "education", "student", "school", "college", "university", "fellowship", "matric", "learning", "academic", "hostel", "tuition", "aicte", "ugc"]),
        ("Entrepreneurship and MSMEs", ["entrepreneur", "startup", "start-up", "msme", "micro and small", "business", "self employment", "self-employment", "loan", "venture", "trade"]),
        ("Manufacturing and industrial sectors", ["manufactur", "industrial", "industry", "factory", "production", "textile", "mining", "steel", "cement", "electronics manufacturing"]),
        ("Jobs, internships and apprenticeships", ["employment", "job", "intern", "apprentice", "skill development", "vocational", "placement", "unemployed youth", "worker", "labour", "labor", "workforce"]),
        ("Social welfare and inclusion", ["pension", "widow", "old age", "senior citizen", "sc/st", "scheduled caste", "scheduled tribe", "minority", "women", "girl child", "child welfare", "orphan", "social security", "transgender", "divyang", "tribal welfare", "bpl", "ration"]),
        ("Energy and environment", ["energy", "solar", "electricity", "renewable", "environment", "climate", "pollution", "forest", "conservation", "waste management", "green"]),
        ("Housing and infrastructure", ["housing", "house", "home", "infrastructure", "road", "urban development", "rural development", "sanitation", "toilet", "drinking water", "water supply", "smart city", "construction"]),
        ("Technology, science and research", ["technology", "science", "research", "innovation", "digital", "artificial intelligence", "computer", "information technology", "r&d", "scientific", "patent", "biotechnology", "space"]),
        ("Transport, tourism and logistics", ["transport", "tourism", "tourist", "logistics", "aviation", "railway", "shipping", "port", "vehicle", "travel"]),
    ]
    for category, keywords in groups:
        if any(word in text for word in keywords):
            return category
    return "Other sectors and public services"

def main():
    request = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "IntelliGovAI-scheme-sync/1.0"})
    with urllib.request.urlopen(request, timeout=90) as response:
        source = json.loads(response.read().decode("utf-8"))
    if isinstance(source, dict):
        source = source.get("data", source.get("schemes", []))
    if not isinstance(source, list):
        raise ValueError("Upstream catalogue was not a JSON list.")

    result, seen_urls, seen_name_region = [], set(), set()
    for item in source:
        name = clean(item.get("Scheme Name") or item.get("schemeName") or item.get("name"))
        if not name:
            continue
        url = clean(item.get("MyScheme URL") or item.get("Official Link") or item.get("official_url") or item.get("schemeUrl"))
        slug = clean(item.get("Scheme Slug") or item.get("slug")).strip("/")
        if not url and slug:
            url = "https://www.myscheme.gov.in/schemes/" + slug
        if not url:
            continue
        if not re.match(r"^https?://", url, re.I):
            continue
        url = "https://" + url.split("://", 1)[-1]
        url_key = url.lower().rstrip("/")
        region = clean(item.get("State / UT / Ministry") or item.get("state") or item.get("ministry"))
        name_region = (norm(name), norm(region))
        if url_key in seen_urls or name_region in seen_name_region:
            continue
        seen_urls.add(url_key)
        seen_name_region.add(name_region)
        result.append({
            "id": len(result) + 1,
            "name": name,
            "category": category_for(item),
            "description": clean(item.get("Description") or item.get("description")),
            "benefits": clean(item.get("Benefits") or item.get("benefits")),
            "eligibility": clean(item.get("Eligibility Criteria") or item.get("Eligibility (General)") or item.get("eligibility") or item.get("eligibilityCriteria")),
            "documents": clean(item.get("Documents Required") or item.get("documents") or item.get("requiredDocuments")),
            "deadline": None,
            "official_url": url,
        })
    if len(result) < 1000:
        raise ValueError(f"Safety check failed: expected 1000+ schemes, got {len(result)}")
    if len({r["name"].casefold() for r in result}) != len(result):
        raise ValueError("Safety check failed: duplicate scheme names remain.")
    for path in ("Government_Schemes.json", "backend/data/schemes.json"):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            f.write("\n")
    print(f"Synced {len(result)} unique schemes to both JSON datasets.")
    print("Category counts:", dict(Counter(r["category"] for r in result)))

if __name__ == "__main__":
    main()
