from fastapi import APIRouter
from pydantic import BaseModel
from services.eligibility_service import check_eligibility

router = APIRouter()


class EligibilityRequest(BaseModel):
    age: int
    occupation: str


@router.post("/eligibility")
def eligibility(request: EligibilityRequest):

    schemes = check_eligibility(
        request.age,
        request.occupation
    )

    return {
        "success": True,
        "eligible": len(schemes) > 0,
        "recommended_schemes": schemes
    }