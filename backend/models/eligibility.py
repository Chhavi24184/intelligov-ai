from pydantic import BaseModel

class EligibilityRequest(BaseModel):
    age: int
    occupation: str