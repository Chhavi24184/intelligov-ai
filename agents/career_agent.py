def career_agent(user_question: str) -> dict:
    """
    Identify whether the user is asking about career,
    employment, skills, or training.
    """

    question = user_question.lower()

    career_keywords = [
        "job",
        "jobs",
        "career",
        "employment",
        "skill",
        "skills",
        "training",
        "vocational",
        "work"
    ]

    is_career_query = any(
        keyword in question
        for keyword in career_keywords
    )

    return {
        "is_career_query": is_career_query,
        "question": user_question,
        "responsibility": "Identify career, employment, skill, and training related scheme information from the RAG context.",
        "fallback": "If relevant career information is unavailable, say that the available scheme data does not contain it."
    }