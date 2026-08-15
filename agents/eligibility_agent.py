def eligibility_agent(user_question: str) -> dict:
    """
    Identify whether the user is asking about eligibility.
    """

    question = user_question.lower()

    eligibility_keywords = [
        "eligible",
        "eligibility",
        "qualify",
        "qualification",
        "who can apply",
        "who is eligible"
    ]

    is_eligibility_query = any(
        keyword in question
        for keyword in eligibility_keywords
    )

    return {
        "is_eligibility_query": is_eligibility_query,
        "question": user_question,
        "responsibility": "Determine eligibility only from retrieved scheme information.",
        "fallback": "If eligibility information is unavailable, say that the available scheme data does not contain it."
    }