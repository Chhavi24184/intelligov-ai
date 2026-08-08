from fastapi import APIRouter
from models.eligibility import EligibilityRequest
from services.eligibility_service import check_eligibility
from core.logger import logger

router = APIRouter()


@router.post("/eligibility")
def eligibility(request: EligibilityRequest):

    logger.info(
        f"Eligibility API Called | Age: {request.age}, Occupation: {request.occupation}"
    )

    schemes = check_eligibility(
        request.age,
        request.occupation,
        request.income,
        request.gender,
        request.state
    )

    return {
        "success": True,
        "message": "Eligibility checked successfully.",
        "data": {
            "eligible": len(schemes) > 0,
            "recommended_schemes": schemes
        }
    }