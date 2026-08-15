from pydantic import BaseModel
from typing import Optional


class Profile(BaseModel):
    age: int
    occupation: str
    income: float
    gender: str
    state: str


class ChatRequest(BaseModel):
    message: str
    profile: Optional[Profile] = None