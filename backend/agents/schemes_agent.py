from services.scheme_service import get_all_schemes, search_schemes


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

        matched = []

        # --------------------------------
        # 1. Direct retrieval
        # --------------------------------

        for scheme in schemes:

            name = scheme.get("name", "").lower()
            category = scheme.get("category", "").lower()
            description = scheme.get("description", "").lower()

            searchable_text = f"{name} {category} {description}"

            query_words = query_lower.split()

            # At least one meaningful query word should match
            if any(
                len(word) >= 4 and word in searchable_text
                for word in query_words
            ):
                matched.append(scheme)

        # --------------------------------
        # 2. Existing search service fallback
        # --------------------------------

        if not matched:

            for keyword in query_lower.split():

                if len(keyword) < 4:
                    continue

                results = search_schemes(keyword)

                for scheme in results:
                    matched.append(scheme)

        # --------------------------------
        # 3. Remove duplicates
        # --------------------------------

        unique_schemes = []
        seen = set()

        for scheme in matched:

            scheme_name = scheme.get("name", "").strip()

            if scheme_name and scheme_name not in seen:

                seen.add(scheme_name)
                unique_schemes.append(scheme)

        # --------------------------------
        # 4. Safe fallback
        # --------------------------------

        if not unique_schemes:

            return {
                "agent": "SchemeRecommendationAgent",
                "success": True,
                "count": 0,
                "schemes": [],
                "message": (
                    "No relevant scheme was found in the available "
                    "government scheme database."
                )
            }

        # --------------------------------
        # 5. Return grounded results
        # --------------------------------

        return {
            "agent": "SchemeRecommendationAgent",
            "success": True,
            "count": len(unique_schemes),
            "schemes": unique_schemes[:5],
            "message": (
                "Relevant schemes retrieved from the government "
                "scheme database."
            )
        }