from services.scheme_service import (
    get_all_schemes,
    search_schemes
)

from services.rag_service import (
    search_full_schemes
)


class SchemeRecommendationAgent:
    """
    Retrieves relevant government schemes.

    Retrieval strategy:

    1. ChromaDB semantic RAG retrieval
    2. RAG semantic relevance score
    3. Category matching
    4. Exact scheme-name matching
    5. Meaningful keyword matching
    6. Existing scheme service fallback

    This agent does NOT generate scheme information.
    It only returns schemes that actually exist
    in schemes.json.
    """

    def run(
        self,
        query: str
    ) -> dict:

        # ========================================================
        # 0. Validate Query
        # ========================================================

        if not query or not query.strip():

            return {
                "agent": "SchemeRecommendationAgent",
                "success": False,
                "count": 0,
                "schemes": [],
                "message": (
                    "Please provide a valid "
                    "scheme-related query."
                )
            }

        query_lower = query.lower().strip()

        # ========================================================
        # 1. Load Government Scheme Database
        # ========================================================

        schemes = get_all_schemes()

        if not schemes:

            return {
                "agent": "SchemeRecommendationAgent",
                "success": True,
                "count": 0,
                "schemes": [],
                "message": (
                    "No government schemes are "
                    "available in the scheme database."
                )
            }

        # ========================================================
        # 2. Semantic RAG Retrieval
        # ========================================================

        rag_schemes = []

        try:

            rag_schemes = search_full_schemes(
                query=query,
                top_k=5
            )

        except Exception as e:

            print(
                f"RAG retrieval warning: {e}"
            )

            rag_schemes = []

        # ========================================================
        # 3. Build RAG Score Map
        # ========================================================

        rag_score_map = {}

        for scheme in rag_schemes:

            scheme_id = str(
                scheme.get(
                    "id",
                    ""
                )
            )

            if not scheme_id:

                continue

            semantic_score = scheme.get(
                "_rag_score",
                0
            )

            # ----------------------------------------------------
            # RAG is supporting evidence.
            #
            # Category and exact matching should
            # have higher priority.
            #
            # Maximum RAG contribution = 15
            # ----------------------------------------------------

            rag_score = min(
                semantic_score * 20,
                15
            )

            rag_score_map[
                scheme_id
            ] = rag_score

        # ========================================================
        # 4. Normalize User Categories
        # ========================================================

        keyword_groups = {

            # ----------------------------------------------------
            # Farmer / Agriculture
            # ----------------------------------------------------

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

            # ----------------------------------------------------
            # Women
            # ----------------------------------------------------

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

            # ----------------------------------------------------
            # Students / Education
            # ----------------------------------------------------

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

            # ----------------------------------------------------
            # Jobs / Employment
            # ----------------------------------------------------

            "employment": [
                "job",
                "jobs",
                "employment",
                "employed",
                "unemployed",
                "career",
                "careers",
                "jobseeker"
            ],

            # ----------------------------------------------------
            # Business / Entrepreneurship
            # ----------------------------------------------------

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
                "selfemployment",
                "loan"
            ],

            # ----------------------------------------------------
            # Healthcare
            # ----------------------------------------------------

            "health": [
                "health",
                "healthcare",
                "medical",
                "hospital",
                "treatment",
                "disease"
            ],

            # ----------------------------------------------------
            # Housing
            # ----------------------------------------------------

            "housing": [
                "housing",
                "house",
                "home",
                "homes"
            ],

            # ----------------------------------------------------
            # Pension / Elderly
            # ----------------------------------------------------

            "pension": [
                "pension",
                "elderly",
                "senior",
                "seniors",
                "old",
                "retirement"
            ],

            # ----------------------------------------------------
            # Skill Development
            # ----------------------------------------------------

            "skill": [
                "skill",
                "skills",
                "training",
                "upskilling",
                "reskilling",
                "vocational"
            ],

            # ----------------------------------------------------
            # Girl Child
            # ----------------------------------------------------

            "girl_child": [
                "girl",
                "girls",
                "daughter",
                "daughters",
                "girlchild"
            ]
        }

        # ========================================================
        # 5. Detect User Categories
        # ========================================================

        detected_categories = set()

        for category, keywords in keyword_groups.items():

            for keyword in keywords:

                if keyword in query_lower:

                    detected_categories.add(
                        category
                    )

                    break

        # ========================================================
        # 6. Exact Scheme Terms
        # ========================================================

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

        # ========================================================
        # 7. Stop Words
        # ========================================================

        stop_words = {

            "which",
            "what",
            "where",
            "when",
            "who",
            "why",
            "how",

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
            "any",

            "need",
            "want",

            "information"
        }

        # ========================================================
        # 8. Meaningful Query Words
        # ========================================================

        query_words = [

            word.strip(
                ".,?!"
            )

            for word in query_lower.split()
        ]

        meaningful_words = [

            word

            for word in query_words

            if (
                word not in stop_words
                and len(word) >= 4
            )
        ]

        # ========================================================
        # 9. Score Every Scheme
        # ========================================================

        scored_schemes = []

        for scheme in schemes:

            scheme_id = str(
                scheme.get(
                    "id",
                    ""
                )
            )

            name = scheme.get(
                "name",
                ""
            ).lower()

            category = scheme.get(
                "category",
                ""
            ).lower()

            description = scheme.get(
                "description",
                ""
            ).lower()

            eligibility = scheme.get(
                "eligibility",
                ""
            ).lower()

            documents = " ".join(
                scheme.get(
                    "documents",
                    []
                )
            ).lower()

            searchable_text = (
                f"{name} "
                f"{category} "
                f"{description} "
                f"{eligibility} "
                f"{documents}"
            )

            score = 0

            matched_keywords = []

            # ====================================================
            # A. RAG Semantic Match
            # ====================================================

            rag_score = rag_score_map.get(
                scheme_id,
                0
            )

            if rag_score > 0:

                score += rag_score

                matched_keywords.append(
                    "semantic_rag_match"
                )

            # ====================================================
            # B. Exact Scheme Match
            # ====================================================

            for term in exact_scheme_terms:

                if (
                    term in query_lower
                    and term in searchable_text
                ):

                    score += 50

                    matched_keywords.append(
                        "exact_scheme_match"
                    )

                    break

            # ====================================================
            # C. Student / Education
            # ====================================================

            if "student" in detected_categories:

                if (
                    "education" in category
                    or "scholarship" in category
                    or "student" in category
                    or "education" in description
                    or "student" in description
                    or "scholarship" in description
                    or "student" in eligibility
                    or "scholarship" in name
                ):

                    score += 30

                    matched_keywords.append(
                        "education"
                    )

            # ====================================================
            # D. Farmer / Agriculture
            # ====================================================

            if "farmer" in detected_categories:

                if (
                    "farmer" in category
                    or "agriculture" in category
                    or "farmer" in description
                    or "agriculture" in description
                    or "agricultural" in description
                    or "farmer" in eligibility
                    or "kisan" in name
                ):

                    score += 30

                    matched_keywords.append(
                        "farmer"
                    )

            # ====================================================
            # E. Women
            # ====================================================

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

                    score += 30

                    matched_keywords.append(
                        "women"
                    )

            # ====================================================
            # F. Employment
            # ====================================================

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

                    score += 30

                    matched_keywords.append(
                        "employment"
                    )

            # ====================================================
            # G. Business
            # ====================================================

            if "business" in detected_categories:

                if (
                    "business" in category
                    or "employment" in category
                    or "enterprise" in category
                    or "entrepreneurship" in category
                    or "business" in description
                    or "entrepreneur" in description
                    or "enterprise" in description
                    or "business" in eligibility
                    or "loan" in description
                ):

                    score += 30

                    matched_keywords.append(
                        "business"
                    )

            # ====================================================
            # H. Healthcare
            # ====================================================

            if "health" in detected_categories:

                if (
                    "health" in category
                    or "healthcare" in category
                    or "medical" in category
                    or "health" in description
                    or "health" in eligibility
                ):

                    score += 30

                    matched_keywords.append(
                        "health"
                    )

            # ====================================================
            # I. Housing
            # ====================================================

            if "housing" in detected_categories:

                if (
                    "housing" in category
                    or "house" in category
                    or "housing" in description
                    or "house" in description
                    or "housing" in eligibility
                ):

                    score += 30

                    matched_keywords.append(
                        "housing"
                    )

            # ====================================================
            # J. Pension
            # ====================================================

            if "pension" in detected_categories:

                if (
                    "pension" in category
                    or "social security" in category
                    or "pension" in description
                    or "elderly" in description
                    or "senior" in description
                    or "pension" in eligibility
                ):

                    score += 30

                    matched_keywords.append(
                        "pension"
                    )

            # ====================================================
            # K. Skill Development
            # ====================================================

            if "skill" in detected_categories:

                if (
                    "skill" in category
                    or "training" in category
                    or "skill" in description
                    or "training" in description
                    or "upskill" in description
                    or "skill" in eligibility
                ):

                    score += 30

                    matched_keywords.append(
                        "skill"
                    )

            # ====================================================
            # L. Girl Child
            # ====================================================

            if "girl_child" in detected_categories:

                if (
                    "girl child" in category
                    or "girl" in category
                    or "girl child" in description
                    or "girl" in description
                    or "girl child" in eligibility
                ):

                    score += 30

                    matched_keywords.append(
                        "girl_child"
                    )

            # ====================================================
            # M. Meaningful Keyword Matching
            # ====================================================

            keyword_matches = 0

            for word in meaningful_words:

                if word in searchable_text:

                    score += 5

                    keyword_matches += 1

                    matched_keywords.append(
                        word
                    )

                elif (
                    word.endswith("s")
                    and word[:-1] in searchable_text
                ):

                    score += 5

                    keyword_matches += 1

                    matched_keywords.append(
                        word
                    )

                elif (
                    word + "s"
                    in searchable_text
                ):

                    score += 5

                    keyword_matches += 1

                    matched_keywords.append(
                        word
                    )

            # ====================================================
            # N. Strong Relevance Bonus
            # ====================================================

            if (
                detected_categories
                and keyword_matches > 0
            ):

                score += 5

                matched_keywords.append(
                    "strong_relevance"
                )

            # ====================================================
            # O. Store Relevant Scheme
            # ====================================================

            if score > 0:

                scored_schemes.append({

                    "scheme": scheme,

                    "score": score,

                    "matched_keywords": list(
                        set(
                            matched_keywords
                        )
                    )
                })

        # ========================================================
        # 10. Sort by Combined Relevance
        # ========================================================

        scored_schemes.sort(
            key=lambda item: item["score"],
            reverse=True
        )

        # ========================================================
        # 11. Extract Unique Schemes
        # ========================================================

        unique_schemes = []

        seen = set()

        for item in scored_schemes:

            scheme = item["scheme"]

            scheme_name = scheme.get(
                "name",
                ""
            ).strip()

            if not scheme_name:

                continue

            if scheme_name in seen:

                continue

            seen.add(
                scheme_name
            )

            # ----------------------------------------------------
            # Remove internal RAG fields
            # before returning result.
            # ----------------------------------------------------

            clean_scheme = {
                key: value
                for key, value in scheme.items()
                if not key.startswith("_rag_")
            }

            unique_schemes.append(
                clean_scheme
            )

        # ========================================================
        # 12. RAG Fallback
        # ========================================================

        if not unique_schemes and rag_schemes:

            for scheme in rag_schemes:

                scheme_name = scheme.get(
                    "name",
                    ""
                ).strip()

                if (
                    scheme_name
                    and scheme_name not in seen
                ):

                    seen.add(
                        scheme_name
                    )

                    clean_scheme = {
                        key: value
                        for key, value
                        in scheme.items()
                        if not key.startswith("_rag_")
                    }

                    unique_schemes.append(
                        clean_scheme
                    )

        # ========================================================
        # 13. Existing Search Service Fallback
        # ========================================================

        if not unique_schemes:

            fallback_results = search_schemes(
                query_lower
            )

            for scheme in fallback_results:

                scheme_name = scheme.get(
                    "name",
                    ""
                ).strip()

                if (
                    scheme_name
                    and scheme_name not in seen
                ):

                    seen.add(
                        scheme_name
                    )

                    unique_schemes.append(
                        scheme
                    )

        # ========================================================
        # 14. No Results
        # ========================================================

        if not unique_schemes:

            return {
                "agent": "SchemeRecommendationAgent",
                "success": True,
                "count": 0,
                "schemes": [],
                "message": (
                    "No relevant scheme was found "
                    "in the available government "
                    "scheme database."
                )
            }

        # ========================================================
        # 15. Return Top 5
        # ========================================================

        final_schemes = unique_schemes[:5]

        return {
            "agent": "SchemeRecommendationAgent",
            "success": True,
            "count": len(final_schemes),
            "schemes": final_schemes,
            "message": (
                "Relevant schemes retrieved using "
                "semantic RAG, category matching, "
                "and relevance ranking."
            )
        }