from fastapi import APIRouter

from models.chat import ChatRequest
from services.chat_service import generate_reply
from core.logger import logger


router = APIRouter()


@router.post("/chat")
def chat(request: ChatRequest):

    logger.info(
        f"Chat API Called | Message: {request.message}"
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
        request.message,
        profile,
        language=language
    )

    return {
        "success": True,
        "message": "Chat response generated successfully.",
        "data": response
    }
