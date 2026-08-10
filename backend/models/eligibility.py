from pydantic import BaseModel, Field


class EligibilityRequest(BaseModel):
    age: int = Field(..., ge=0, le=120)
    occupation: str = Field(..., min_length=2)
    income: float = Field(..., ge=0)
    gender: str = Field(..., min_length=1)
    state: str = Field(..., min_length=2)