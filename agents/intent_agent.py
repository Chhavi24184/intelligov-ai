def intent_agent(user_question: str) -> dict:
    """
    Identify the user's primary intent.
    """

    question = user_question.lower()

    if any(word in question for word in [
        "eligible",
        "eligibility",
        "qualify",
        "qualification"
    ]):
        intent = "eligibility"

    elif any(word in question for word in [
        "document",
        "documents",
        "paper",
        "papers",
        "required"
    ]):
        intent = "documents"

    elif any(word in question for word in [
        "job",
        "career",
        "employment",
        "skill",
        "training"
    ]):
        intent = "career"

    elif any(word in question for word in [
        "scheme",
        "schemes",
        "yojana",
        "government program"
    ]):
        intent = "scheme"

    else:
        intent = "general"

    return {
        "intent": intent,
        "question": user_question
    }