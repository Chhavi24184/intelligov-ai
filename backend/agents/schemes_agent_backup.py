from services.scheme_service import get_all_schemes, search_schemes
from services.rag_service import search_schemes as rag_search_schemes


class SchemeRecommendationAgent:
    """
    Retrieves relevant government schemes from the scheme database.

    This agent does NOT generate scheme information.
    It only returns schemes that actually exist in schemes.json.
    """

    def run(self, query: str) -> dict:

        if not query or not query.strip():
            return {
                "agent": "SchemeRecommendationAgent",
                "success": False,
                "count": 0,
                "schemes": [],
                "message": "Please provide a valid scheme-related query."
            }

        query_lower = query.lower().strip()

        schemes = get_all_schemes()

        if not schemes:
            return {
                "agent": "SchemeRecommendationAgent",
                "success": True,
                "count": 0,
                "schemes": [],
                "message": (
                    "No government schemes are available "
                    "in the scheme database."
                )
            }

        # ============================================================
        # 1. Normalize common user terms
        # ============================================================

        keyword_groups = {

            # Farmer / Agriculture
            "farmer": [
                "farmer",
                "farmers",
                "kisan",
                "agriculture",
                "agricultural",
                "farming",
                "crop",
                "crops"
            ],

            # Women
            "women": [
                "woman",
                "women",
                "female",
                "girl",
                "girls",
                "mother",
                "mothers",
                "widow",
                "widows"
            ],

            # Students / Education
            "student": [
                "student",
                "students",
                "scholarship",
                "scholarships",
                "education",
                "educational",
                "study",
                "college",
                "school"
            ],

            # Jobs / Employment
            "employment": [
                "job",
                "jobs",
                "employment",
                "employed",
                "unemployed",
                "career",
                "careers",
                "jobseeker",
                "jobseeker"
            ],

            # Business / Entrepreneurship
            "business": [
                "business",
                "businesses",
                "entrepreneur",
                "entrepreneurs",
                "startup",
                "startups",
                "enterprise",
                "enterprises",
                "self-employment",
                "selfemployment"
            ],

            # Healthcare
            "health": [
                "health",
                "healthcare",
                "medical",
                "hospital",
                "treatment",
                "disease"
            ],

            # Housing
            "housing": [
                "housing",
                "house",
                "home",
                "homes"
            ],

            # Pension / Elderly
            "pension": [
                "pension",
                "elderly",
                "senior",
                "seniors",
                "old",
                "retirement"
            ],

            # Skill Development
            "skill": [
                "skill",
                "skills",
                "training",
                "upskilling",
                "reskilling",
                "vocational"
            ],

            # Girl Child
            "girl_child": [
                "girl",
                "girls",
                "daughter",
                "daughters",
                "girlchild"
            ]
        }

        # ============================================================
        # 2. Detect user intent/category
        # ============================================================

        detected_categories = set()

        for category, keywords in keyword_groups.items():

            for keyword in keywords:

                if keyword in query_lower:
                    detected_categories.add(category)
                    break

        # ============================================================
        # 3. Special handling for common scheme queries
        # ============================================================

        exact_scheme_terms = [
            "pm kisan",
            "kisan samman nidhi",
            "pm vishwakarma",
            "pm vishwakarma scheme",
            "pm mudra",
            "mudra",
            "pmjay",
            "pm-jay",
            "ayushman bharat",
            "sukanya samriddhi",
            "atal pension",
            "fasal bima",
            "kisan credit card",
            "soil health card",
            "pm yasasvi",
            "central sector scholarship",
            "national career service",
            "jan shikshan",
            "employment generation"
        ]

        # ============================================================
        # 4. Score every scheme
        # ============================================================

        scored_schemes = []

        for scheme in schemes:

            name = scheme.get("name", "").lower()
            category = scheme.get("category", "").lower()
            description = scheme.get("description", "").lower()
            eligibility = scheme.get("eligibility", "").lower()

            searchable_text = (
                f"{name} "
                f"{category} "
                f"{description} "
                f"{eligibility}"
            )

            score = 0
            matched_keywords = []

            # --------------------------------------------------------
            # A. Exact scheme name matching
            # --------------------------------------------------------

            for term in exact_scheme_terms:

                if term in query_lower and term in searchable_text:

                    score += 20
                    matched_keywords.append(term)

            # --------------------------------------------------------
            # B. Category-based matching
            # --------------------------------------------------------

            if "farmer" in detected_categories:

                if (
                    "farmer" in category
                    or "agriculture" in category
                    or "farmer" in description
                    or "agriculture" in description
                    or "agricultural" in description
                    or "farmer" in eligibility
                ):
                    score += 10
                    matched_keywords.append("farmer")

            if "women" in detected_categories:

                if (
                    "women" in category
                    or "woman" in category
                    or "female" in category
                    or "girl" in category
                    or "women" in description
                    or "woman" in description
                    or "female" in description
                    or "women" in eligibility
                    or "woman" in eligibility
                ):
                    score += 10
                    matched_keywords.append("women")

            if "student" in detected_categories:

                if (
                    "education" in category
                    or "scholarship" in category
                    or "student" in category
                    or "education" in description
                    or "student" in description
                    or "scholarship" in description
                    or "student" in eligibility
                ):
                    score += 10
                    matched_keywords.append("student")

            if "employment" in detected_categories:

                if (
                    "employment" in category
                    or "career" in category
                    or "skill" in category
                    or "employment" in description
                    or "job" in description
                    or "career" in description
                    or "employment" in eligibility
                ):
                    score += 10
                    matched_keywords.append("employment")

            if "business" in detected_categories:

                if (
                    "business" in category
                    or "employment" in category
                    or "enterprise" in category
                    or "business" in description
                    or "entrepreneur" in description
                    or "enterprise" in description
                    or "business" in eligibility
                ):
                    score += 10
                    matched_keywords.append("business")

            if "health" in detected_categories:

                if (
                    "health" in category
                    or "healthcare" in category
                    or "medical" in category
                    or "health" in description
                    or "health" in eligibility
                ):
                    score += 10
                    matched_keywords.append("health")

            if "housing" in detected_categories:

                if (
                    "housing" in category
                    or "house" in category
                    or "housing" in description
                    or "house" in description
                    or "housing" in eligibility
                ):
                    score += 10
                    matched_keywords.append("housing")

            if "pension" in detected_categories:

                if (
                    "pension" in category
                    or "social security" in category
                    or "pension" in description
                    or "elderly" in description
                    or "senior" in description
                    or "pension" in eligibility
                ):
                    score += 10
                    matched_keywords.append("pension")

            if "skill" in detected_categories:

                if (
                    "skill" in category
                    or "training" in category
                    or "skill" in description
                    or "training" in description
                    or "upskill" in description
                    or "skill" in eligibility
                ):
                    score += 10
                    matched_keywords.append("skill")

            if "girl_child" in detected_categories:

                if (
                    "girl child" in category
                    or "girl" in category
                    or "girl child" in description
                    or "girl" in description
                    or "girl child" in eligibility
                ):
                    score += 10
                    matched_keywords.append("girl_child")

            # --------------------------------------------------------
            # C. Direct meaningful-word matching
            # --------------------------------------------------------

            stop_words = {
                "which",
                "what",
                "are",
                "is",
                "the",
                "for",
                "me",
                "can",
                "i",
                "my",
                "available",
                "government",
                "tell",
                "about",
                "scheme",
                "schemes",
                "please",
                "give",
                "show",
                "some",
                "any"
            }

            query_words = [
                word.strip(".,?!")
                for word in query_lower.split()
            ]

            meaningful_words = [
                word
                for word in query_words
                if word not in stop_words and len(word) >= 4
            ]

            for word in meaningful_words:

                # Exact word
                if word in searchable_text:
                    score += 3
                    matched_keywords.append(word)

                # Singular/plural
                elif word.endswith("s") and word[:-1] in searchable_text:
                    score += 3
                    matched_keywords.append(word)

                elif word + "s" in searchable_text:
                    score += 3
                    matched_keywords.append(word)

            # --------------------------------------------------------
            # D. Keep only relevant schemes
            # --------------------------------------------------------

            if score > 0:

                scored_schemes.append({
                    "scheme": scheme,
                    "score": score,
                    "matched_keywords": list(set(matched_keywords))
                })

        # ============================================================
        # 5. Sort by relevance
        # ============================================================

        scored_schemes.sort(
            key=lambda item: item["score"],
            reverse=True
        )

        # ============================================================
        # 6. Extract schemes
        # ============================================================

        unique_schemes = []
        seen = set()

        for item in scored_schemes:

            scheme = item["scheme"]

            scheme_name = scheme.get("name", "").strip()

            if not scheme_name:
                continue

            if scheme_name in seen:
                continue

            seen.add(scheme_name)

            unique_schemes.append(scheme)

        # ============================================================
        # 7. Search service fallback
        # ============================================================

        if not unique_schemes:

            fallback_results = search_schemes(query_lower)

            for scheme in fallback_results:

                scheme_name = scheme.get("name", "").strip()

                if (
                    scheme_name
                    and scheme_name not in seen
                ):
                    seen.add(scheme_name)
                    unique_schemes.append(scheme)

        # ============================================================
        # 8. No results
        # ============================================================

        if not unique_schemes:

            return {
                "agent": "SchemeRecommendationAgent",
                "success": True,
                "count": 0,
                "schemes": [],
                "message": (
                    "No relevant scheme was found in the "
                    "available government scheme database."
                )
            }

        # ============================================================
        # 9. Return top 5 relevant schemes
        # ============================================================

        final_schemes = unique_schemes[:5]

        return {
            "agent": "SchemeRecommendationAgent",
            "success": True,
            "count": len(final_schemes),
            "schemes": final_schemes,
            "message": (
                "Relevant schemes retrieved from the government "
                "scheme database."
            )
        }