from fastapi import APIRouter, HTTPException

from models.eligibility import EligibilityRequest
from services.eligibility_service import check_eligibility
from core.logger import logger


router = APIRouter()


@router.post("/eligibility")
def eligibility(request: EligibilityRequest):

    logger.info(
        f"Eligibility API Called | "
        f"Age: {request.age}, "
        f"Occupation: {request.occupation}, "
        f"Income: {request.income}, "
        f"Gender: {request.gender}, "
        f"State: {request.state}"
    )

    # -----------------------------
    # Basic Validation
    # -----------------------------

    if request.age <= 0:
        raise HTTPException(
            status_code=400,
            detail="Age must be greater than 0."
        )

    if request.income < 0:
        raise HTTPException(
            status_code=400,
            detail="Income cannot be negative."
        )

    if not request.occupation.strip():
        raise HTTPException(
            status_code=400,
            detail="Occupation is required."
        )

    if not request.gender.strip():
        raise HTTPException(
            status_code=400,
            detail="Gender is required."
        )

    if not request.state.strip():
        raise HTTPException(
            status_code=400,
            detail="State is required."
        )

    # -----------------------------
    # Eligibility Engine
    # -----------------------------

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
            "total_matches": len(schemes),
            "recommended_schemes": schemes
        }
    }