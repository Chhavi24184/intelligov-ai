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
    message: str
    profile: Optional[Profile] = None
    language: Optional[str] = "en"
