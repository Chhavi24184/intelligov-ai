def scheme_agent(user_question: str) -> dict:
    """
    Identify whether the user is asking for government scheme information.
    """

    question = user_question.lower()

    scheme_keywords = [
        "scheme",
        "schemes",
        "yojana",
        "government program",
        "government assistance"
    ]

    is_scheme_query = any(
        keyword in question
        for keyword in scheme_keywords
    )

    return {
        "is_scheme_query": is_scheme_query,
        "question": user_question,
        "responsibility": "Find relevant government scheme information from the RAG system."
    }