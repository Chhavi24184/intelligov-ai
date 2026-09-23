"""
api/application.py
------------------
Application Agent API endpoints for IntelliGov AI.

POST /application/prepare
    Reads user profile from DB, builds ApplicationPlan + DemoFormSpec.

POST /application/submit-demo
    Validates the demo form submission and returns a local DEMO- reference ID.
    Does NOT submit to any real government portal.
    Does NOT create any real application record.

GET  /application/status/{scheme_name}
    Always returns "not_tracked" — no fake states.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from database import get_db
from models.user import User
from agents.application_agent import application_agent
from core.logger import logger


router = APIRouter(
    prefix="/application",
    tags=["Application Agent"],
)


# ============================================================
# Request schemas
# ============================================================

class SchemePayload(BaseModel):
    name:         str
    category:     Optional[str] = None
    description:  Optional[str] = None
    benefits:     Optional[str] = None
    eligibility:  Optional[str] = None
    documents:    Optional[List[str]] = None
    deadline:     Optional[str] = None
    official_url: Optional[str] = None


class PrepareRequest(BaseModel):
    user_id: int
    scheme:  SchemePayload


class DemoSubmitRequest(BaseModel):
    user_id:     int
    scheme_name: str
    form_values: Dict[str, Any]   # field_key → value entered by user


# ============================================================
# POST /application/prepare
# ============================================================

@router.post("/prepare")
def prepare_application(
    data: PrepareRequest,
    db: Session = Depends(get_db),
):
    """
    Build an ApplicationPlan (+ DemoFormSpec) for the given scheme and user.
    Reads full profile from PostgreSQL — frontend only passes user_id + scheme.
    """
    logger.info(
        f"ApplicationAgent.prepare | user_id={data.user_id} "
        f"scheme={data.scheme.name!r}"
    )

    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = {
        "name":       user.name,
        "age":        user.age,
        "state":      user.state,
        "district":   user.district,
        "education":  user.education,
        "occupation": user.occupation,
        "income":     user.income,
        "category":   user.category,
        "interests":  user.interests,
        "language":   user.language or "en",
    }

    plan = application_agent.prepare(
        scheme=data.scheme.model_dump(),
        profile=profile,
    )

    logger.info(
        f"ApplicationAgent plan ready | "
        f"portal={plan['portal_name']!r} "
        f"auto_filled={plan['demo_form']['auto_filled']}/{plan['demo_form']['total_fields']} "
        f"docs_missing={len(plan['docs_missing'])}"
    )

    return {
        "success":   True,
        "user_name": user.name,
        "plan":      plan,
    }


# ============================================================
# POST /application/submit-demo
# ============================================================

@router.post("/submit-demo")
def submit_demo_application(
    data: DemoSubmitRequest,
    db: Session = Depends(get_db),
):
    """
    Process a demo form submission.

    - Validates required fields and basic format rules
    - Issues a DEMO- prefixed local reference ID
    - Does NOT submit anything to any government portal
    - Does NOT store any sensitive field values (Aadhaar, mobile, bank)
    """
    logger.info(
        f"ApplicationAgent.submit_demo | user_id={data.user_id} "
        f"scheme={data.scheme_name!r}"
    )

    # Verify user exists
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Run demo submission through the agent
    result = application_agent.submit_demo(
        scheme_name=data.scheme_name,
        form_values=data.form_values,
        user_id=data.user_id,
    )

    if result["success"]:
        logger.info(
            f"Demo submission OK | ref={result['reference_id']} "
            f"user_id={data.user_id}"
        )
    else:
        logger.warning(
            f"Demo submission validation failed | "
            f"errors={result['errors']}"
        )

    return result


# ============================================================
# GET /application/status/{scheme_name}
# ============================================================

@router.get("/status/{scheme_name}")
def application_status(scheme_name: str):
    """
    Honest status endpoint — always "not_tracked".
    We never fake real government application statuses.
    """
    return {
        "scheme_name":      scheme_name,
        "tracking_status":  "not_tracked",
        "message": (
            "IntelliGov AI does not track government application submissions. "
            "Check your application status on the official portal using "
            "your acknowledgement number."
        ),
    }
