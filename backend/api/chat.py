from fastapi import APIRouter
from pydantic import BaseModel
from services.chat_service import generate_reply

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat(request: ChatRequest):
    response = generate_reply(request.message)

    return {
        "success": True,
        "reply": response["reply"],
        "recommended_scheme": response["recommended_scheme"]
    }