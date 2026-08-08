from fastapi import APIRouter
from models.chat import ChatRequest
from services.chat_service import generate_reply
from core.logger import logger

router = APIRouter()


@router.post("/chat")
def chat(request: ChatRequest):

    logger.info(f"Chat API Called | Message: {request.message}")

    response = generate_reply(request.message)

    return {
        "success": True,
        "message": "Chat response generated successfully.",
        "data": response
    }