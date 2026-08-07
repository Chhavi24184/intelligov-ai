from pydantic import BaseModel


class EligibilityRequest(BaseModel):
    age: int
    occupation: str
    income: float
    gender: str
    state: str