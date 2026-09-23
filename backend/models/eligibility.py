from pydantic import BaseModel, Field
from typing import Union


class EligibilityRequest(BaseModel):
    age: int = Field(..., ge=0, le=120)
    occupation: str = Field(..., min_length=2)
    # income accepts both legacy numeric (float) and new string ranges
    # e.g. 250000  OR  "Below ₹1 lakh"  OR  "₹2.5–5 lakh"
    income: Union[float, str] = Field(default=0)
    gender: str = Field(default="")
    state: str = Field(..., min_length=2)