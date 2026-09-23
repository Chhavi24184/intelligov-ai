from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Union, Optional

from services.eligibility_service import check_eligibility
from core.logger import logger


router = APIRouter()


class EligibilityRequest(BaseModel):
    age: int = Field(..., ge=1, le=120)
    occupation: str = Field(..., min_length=2)
    # accepts both numeric (legacy) and string range (new profile format)
    income: Union[float, str] = Field(default=0)
    gender: str = Field(default="")
    state: str = Field(..., min_length=2)
    # optional enriched fields — used when called from the profile pipeline
    category:  Optional[str] = None
    education: Optional[str] = None


@router.post("/eligibility")
def eligibility(request: EligibilityRequest):

    logger.info(
        f"Eligibility API | age={request.age} occ={request.occupation!r} "
        f"income={request.income!r} state={request.state!r}"
    )

    if not request.occupation.strip():
        raise HTTPException(status_code=400, detail="Occupation is required.")

    if not request.state.strip():
        raise HTTPException(status_code=400, detail="State is required.")

    schemes = check_eligibility(
        age=request.age,
        occupation=request.occupation,
        income=request.income,   # string or float — service handles both
        gender=request.gender,
        state=request.state,
        category=request.category or "",
        education=request.education or "",
    )

    return {
        "success": True,
        "message": "Eligibility checked successfully.",
        "data": {
            "eligible":           len(schemes) > 0,
            "total_matches":      len(schemes),
            "recommended_schemes": schemes,
        }
    }
