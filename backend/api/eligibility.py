from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Union, Optional
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
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


# ============================================================
# BY-PROFILE endpoint
# Reads the user's saved profile from DB and runs eligibility
# without requiring the frontend to re-send all fields.
# ============================================================

@router.get("/eligibility/by-profile/{user_id}")
def eligibility_by_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Load the user's DB profile and run eligibility check.
    Returns matched schemes based on saved profile fields.
    """

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.age or not user.occupation or not user.state:
        return {
            "success": False,
            "message": "Profile incomplete — please fill in age, occupation, and state first.",
            "data": {
                "eligible": False,
                "total_matches": 0,
                "recommended_schemes": [],
            }
        }

    logger.info(
        f"Eligibility by-profile | user={user_id} age={user.age} "
        f"occ={user.occupation!r} state={user.state!r} category={user.category!r}"
    )

    schemes = check_eligibility(
        age=user.age,
        occupation=user.occupation,
        income=user.income or "0",
        gender="",                   # not in profile schema
        state=user.state,
        category=user.category or "",
        education=user.education or "",
    )

    return {
        "success": True,
        "message": "Eligibility checked from profile.",
        "data": {
            "eligible":            len(schemes) > 0,
            "total_matches":       len(schemes),
            "recommended_schemes": schemes,
        }
    }
