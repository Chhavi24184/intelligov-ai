from fastapi import APIRouter

from models.chat import ChatRequest
from services.chat_service import generate_reply
from core.logger import logger


router = APIRouter()


@router.post("/chat")
def chat(request: ChatRequest):

    query = request.query_text

    logger.info(
        f"Chat API Called | Message: {query}"
    )

    profile = (
        request.profile.model_dump()
        if request.profile
        else None
    )

    # Language comes from request-level field or from profile
    language = (
        request.language
        or (profile.get("language") if profile else None)
        or "en"
    )

    response = generate_reply(
        query,
        profile,
        language=language
    )

    if isinstance(response, dict) and "reply" in response and "text" not in response:
        response["text"] = response["reply"]

    answer = response.get("reply") or response.get("text") or ""
    sources = response.get("recommended_schemes") or []

    return {
        "success": True,
        "message": "Chat response generated successfully.",
        "data": response,
        "answer": answer,
        "sources": sources,
    }
