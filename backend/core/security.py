"""
backend/core/security.py
-------------------------
Security utilities for IntelliGov AI:
- JWT token generation and verification
- Password hashing and verification
- FastAPI authentication dependencies for user identification and ownership validation
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

# =========================================================
# CONFIGURATION
# =========================================================

# Read secret key from environment or fallback to a default for local development.
# In production, set JWT_SECRET_KEY in backend/.env
SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY") or "intelligov-ai-secure-jwt-secret-key-2026"
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# HTTPBearer extracts Authorization: Bearer <token>
security_bearer = HTTPBearer(auto_error=False)


# =========================================================
# PASSWORD HELPERS
# =========================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate bcrypt hash for a password."""
    return pwd_context.hash(password)


# =========================================================
# JWT HELPERS
# =========================================================

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Generate a signed JWT token containing the payload data
    and standard 'exp', 'iat', and 'sub' claims.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": now,
    })

    # Ensure subject is string if present
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Raises HTTPException 401 on expiration or invalid signature.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# =========================================================
# FASTAPI DEPENDENCIES
# =========================================================

def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
):
    """
    FastAPI dependency to extract and verify the authenticated user
    from the Bearer token.
    """
    from database import get_db
    from models.user import User

    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(auth.credentials)
    user_id_str = payload.get("sub") or payload.get("user_id")

    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identity.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Use a fresh DB session from generator
    db_gen = get_db()
    db = next(db_gen)
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass


def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
):
    """
    Returns the authenticated User if a valid Bearer token is provided,
    or None if no token or credentials are provided.
    """
    if not auth or not auth.credentials:
        return None

    try:
        return get_current_user(auth)
    except HTTPException:
        return None


def verify_user_ownership(resource_user_id: int, current_user) -> None:
    """
    Verify that the authenticated user owns the resource being accessed.
    Raises 403 Forbidden if the user IDs do not match.
    """
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if current_user.id != resource_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you do not have permission to access this resource.",
        )
