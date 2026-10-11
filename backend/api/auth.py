from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.user import User
from core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)


# =========================================================
# Router
# =========================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# Request Schemas
# =========================================================

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
def register_user(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):

    # Check existing email
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = get_password_hash(
        user_data.password
    )

    # Create user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue JWT token
    access_token = create_access_token(
        data={"sub": str(new_user.id), "email": new_user.email, "name": new_user.name}
    )

    return {
        "status": "success",
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login_user(
    user_data: LoginRequest,
    db: Session = Depends(get_db)
):

    # Find user by email
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    # User not found
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password
    password_correct = verify_password(
        user_data.password,
        user.password
    )

    # Wrong password
    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Issue JWT token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "name": user.name}
    )

    return {
        "status": "success",
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


# =========================================================
# CURRENT AUTHENTICATED USER
# =========================================================

@router.get("/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "status": "success",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "age": current_user.age,
            "state": current_user.state,
            "district": current_user.district,
            "education": current_user.education,
            "occupation": current_user.occupation,
            "income": current_user.income,
            "category": current_user.category,
            "interests": current_user.interests,
            "language": current_user.language or "en"
        }
    }