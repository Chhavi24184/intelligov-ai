from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.chat_history import ChatHistory
from models.user import User


# =========================================================
# Router
# =========================================================

router = APIRouter(
    prefix="/chat-history",
    tags=["Chat History"]
)


# =========================================================
# Request Schema
# =========================================================

class ChatHistoryCreate(BaseModel):
    user_id: int
    message: str
    response: str


# =========================================================
# Save Chat History
# =========================================================

@router.post("/save")
def save_chat_history(
    chat: ChatHistoryCreate,
    db: Session = Depends(get_db)
):

    # Check whether user exists
    user = db.query(User).filter(
        User.id == chat.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Create chat history record
    new_chat = ChatHistory(
        user_id=chat.user_id,
        message=chat.message,
        response=chat.response
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    return {
        "status": "success",
        "message": "Chat saved successfully",
        "chat_id": new_chat.id
    }


# =========================================================
# Get User Chat History
# =========================================================

@router.get("/{user_id}")
def get_chat_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    # Check whether user exists
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    chats = db.query(ChatHistory).filter(
        ChatHistory.user_id == user_id
    ).order_by(
        ChatHistory.created_at.asc()
    ).all()

    return {
        "status": "success",
        "user_id": user_id,
        "total_chats": len(chats),
        "history": [
            {
                "id": chat.id,
                "message": chat.message,
                "response": chat.response,
                "created_at": chat.created_at
            }
            for chat in chats
        ]
    }