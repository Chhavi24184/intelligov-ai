def intent_agent(user_question: str) -> dict:
    """
    Identify the user's primary intent.
    """

    question = user_question.lower().strip()

    eligibility_keywords = [
        "eligible",
        "eligibility",
        "qualify",
        "qualification",
        "who can apply",
        "who is eligible",
        "can i apply",
        "can i get",
        "am i eligible",
        "do i qualify",
        "is this for me",
        "can i avail",
        "can i benefit"
    ]

    document_keywords = [
        "document",
        "documents",
        "paper",
        "papers",
        "required documents",
        "what documents",
        "what do i need",
        "what should i submit",
        "what should i upload",
        "proof",
        "certificate",
        "id proof",
        "income certificate",
        "domicile",
        "aadhaar",
        "bank details"
    ]

    career_keywords = [
        "job",
        "jobs",
        "career",
        "employment",
        "skill",
        "skills",
        "training",
        "vocational",
        "work",
        "internship",
        "internships",
        "employment opportunity",
        "career opportunity"
    ]

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

    if any(keyword in question for keyword in eligibility_keywords):
        intent = "eligibility"

    elif any(keyword in question for keyword in document_keywords):
        intent = "documents"

    elif any(keyword in question for keyword in career_keywords):
        intent = "career"

    elif any(keyword in question for keyword in scheme_keywords):
        intent = "scheme"

    else:
        intent = "general"

    return {
        "intent": intent,
        "question": user_question
    }