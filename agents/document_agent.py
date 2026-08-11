def document_agent(user_question: str) -> dict:
    """
    Identify whether the user is asking about required documents.
    """

    question = user_question.lower()

    document_keywords = [
        "document",
        "documents",
        "paper",
        "papers",
        "required documents",
        "what do i need",
        "proof"
    ]

    is_document_query = any(
        keyword in question
        for keyword in document_keywords
    )

    return {
        "is_document_query": is_document_query,
        "question": user_question,
        "responsibility": "Identify required documents only from retrieved scheme information.",
        "fallback": "If document information is unavailable, say that the available scheme data does not contain it."
    }