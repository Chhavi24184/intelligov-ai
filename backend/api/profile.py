from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.user import User


# =========================================================
# Router
# =========================================================

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


# =========================================================
# Request / Response schemas
# =========================================================

class ProfileUpdateRequest(BaseModel):
    user_id: int
    age: Optional[int] = None
    state: Optional[str] = None
    district: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    income: Optional[str] = None
    category: Optional[str] = None
    interests: Optional[str] = None
    language: Optional[str] = "en"


# =========================================================
# GET profile
# =========================================================

@router.get("/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "status": "success",
        "profile": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "age": user.age,
            "state": user.state,
            "district": user.district,
            "education": user.education,
            "occupation": user.occupation,
            "income": user.income,
            "category": user.category,
            "interests": user.interests,
            "language": user.language or "en",
        }
    }


# =========================================================
# UPDATE profile
# =========================================================

@router.put("/update")
def update_profile(
    data: ProfileUpdateRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.id == data.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.age is not None:
        user.age = data.age
    if data.state is not None:
        user.state = data.state
    if data.district is not None:
        user.district = data.district
    if data.education is not None:
        user.education = data.education
    if data.occupation is not None:
        user.occupation = data.occupation
    if data.income is not None:
        user.income = data.income
    if data.category is not None:
        user.category = data.category
    if data.interests is not None:
        user.interests = data.interests
    if data.language is not None:
        user.language = data.language

    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "message": "Profile updated successfully",
        "profile": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "age": user.age,
            "state": user.state,
            "district": user.district,
            "education": user.education,
            "occupation": user.occupation,
            "income": user.income,
            "category": user.category,
            "interests": user.interests,
            "language": user.language or "en",
        }
    }
