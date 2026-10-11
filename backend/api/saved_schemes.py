import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from database import get_db
from models.saved_scheme import SavedScheme


# =========================================================
# Router
# =========================================================

router = APIRouter(
    prefix="/saved-schemes",
    tags=["Saved Schemes"]
)


# =========================================================
# Request schemas
# =========================================================

class SaveSchemeRequest(BaseModel):
    user_id: int
    scheme_id: Optional[int] = None
    scheme_name: str
    scheme_category: Optional[str] = None
    scheme_description: Optional[str] = None
    scheme_benefits: Optional[str] = None
    scheme_eligibility: Optional[str] = None
    scheme_documents: Optional[List[str]] = None
    scheme_deadline: Optional[str] = None
    scheme_official_url: Optional[str] = None


# =========================================================
# SAVE a scheme
# =========================================================

@router.post("/save")
def save_scheme(data: SaveSchemeRequest, db: Session = Depends(get_db)):

    # Prevent duplicates (same user + same scheme_name)
    existing = (
        db.query(SavedScheme)
        .filter(
            SavedScheme.user_id == data.user_id,
            SavedScheme.scheme_name == data.scheme_name
        )
        .first()
    )

    if existing:
        return {
            "status": "already_saved",
            "message": "Scheme is already saved.",
            "saved_id": existing.id
        }

    docs_json = json.dumps(data.scheme_documents or [])

    record = SavedScheme(
        user_id=data.user_id,
        scheme_id=data.scheme_id,
        scheme_name=data.scheme_name,
        scheme_category=data.scheme_category,
        scheme_description=data.scheme_description,
        scheme_benefits=data.scheme_benefits,
        scheme_eligibility=data.scheme_eligibility,
        scheme_documents=docs_json,
        scheme_deadline=data.scheme_deadline,
        scheme_official_url=data.scheme_official_url,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "status": "success",
        "message": "Scheme saved successfully.",
        "saved_id": record.id
    }


# =========================================================
# GET saved schemes for a user
# =========================================================

@router.get("/{user_id}")
def get_saved_schemes(user_id: int, db: Session = Depends(get_db)):

    records = (
        db.query(SavedScheme)
        .filter(SavedScheme.user_id == user_id)
        .order_by(SavedScheme.saved_at.desc())
        .all()
    )

    result = []
    for r in records:
        try:
            docs = json.loads(r.scheme_documents) if r.scheme_documents else []
        except Exception:
            docs = []

        result.append({
            "saved_id": r.id,
            "scheme_id": r.scheme_id,
            "name": r.scheme_name,
            "category": r.scheme_category,
            "description": r.scheme_description,
            "benefits": r.scheme_benefits,
            "eligibility": r.scheme_eligibility,
            "documents": docs,
            "deadline": r.scheme_deadline,
            "official_url": r.scheme_official_url,
            "saved_at": r.saved_at.isoformat() if r.saved_at else None,
        })

    return {
        "status": "success",
        "count": len(result),
        "schemes": result
    }


# =========================================================
# REMOVE a saved scheme
# =========================================================

@router.delete("/remove/{saved_id}")
def remove_saved_scheme(saved_id: int, db: Session = Depends(get_db)):

    record = db.query(SavedScheme).filter(SavedScheme.id == saved_id).first()

    if not record:
        raise HTTPException(status_code=404, detail="Saved scheme not found")

    db.delete(record)
    db.commit()

    return {
        "status": "success",
        "message": "Scheme removed from saved list."
    }


# =========================================================
# CHECK if a specific scheme is saved
# =========================================================

@router.get("/check/{user_id}/{scheme_name}")
def check_saved(user_id: int, scheme_name: str, db: Session = Depends(get_db)):

    record = (
        db.query(SavedScheme)
        .filter(
            SavedScheme.user_id == user_id,
            SavedScheme.scheme_name == scheme_name
        )
        .first()
    )

    return {
        "saved": record is not None,
        "saved_id": record.id if record else None
    }
