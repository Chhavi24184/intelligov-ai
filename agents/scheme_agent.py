def scheme_agent(user_question: str) -> dict:
    """
    Identify whether the user is asking for government scheme information.
    """

    question = user_question.lower().strip()

    scheme_keywords = [
        "scheme",
        "schemes",
        "yojana",
        "government scheme",
        "government program",
        "government assistance",
        "government benefit",
        "government benefits",
        "financial assistance",
        "government support",
        "subsidy",
        "welfare scheme",
        "government help",
        "government opportunity",
        "government opportunities"
    ]

    is_scheme_query = any(
        keyword in question
        for keyword in scheme_keywords
    )

    return {
        "is_scheme_query": is_scheme_query,
        "question": user_question,
        "responsibility": (
            "Identify government scheme related queries and "
            "retrieve relevant scheme information from the RAG system."
        ),
        "fallback": (
            "If relevant scheme information is unavailable, "
            "say that the available scheme data does not contain it."
        )
    }