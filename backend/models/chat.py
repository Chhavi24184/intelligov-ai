from pydantic import BaseModel
from typing import Optional


class Profile(BaseModel):
    age: Optional[int] = None
    occupation: Optional[str] = None
    income: Optional[str] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    education: Optional[str] = None
    category: Optional[str] = None
    interests: Optional[str] = None
    language: Optional[str] = "en"


class ChatRequest(BaseModel):
    message: Optional[str] = None
    question: Optional[str] = None
    profile: Optional[Profile] = None
    language: Optional[str] = "en"

    @property
    def query_text(self) -> str:
        return self.message or self.question or ""

