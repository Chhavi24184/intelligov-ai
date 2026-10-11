from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.notification import Notification
from models.user import User


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ======================================================
# REQUEST MODEL
# ======================================================

class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    type: str = "general"


# ======================================================
# CREATE NOTIFICATION
# ======================================================

@router.post("")
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == notification.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    new_notification = Notification(
        user_id=notification.user_id,
        title=notification.title,
        message=notification.message,
        type=notification.type,
        is_read=False
    )

    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)

    return {
        "status": "success",
        "message": "Notification created successfully",
        "notification": {
            "id": new_notification.id,
            "user_id": new_notification.user_id,
            "title": new_notification.title,
            "message": new_notification.message,
            "type": new_notification.type,
            "is_read": new_notification.is_read,
            "created_at": new_notification.created_at
        }
    }


# ======================================================
# GET USER NOTIFICATIONS
# ======================================================

@router.get("/{user_id}")
def get_notifications(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(
        Notification.created_at.desc()
    ).all()

    return {
        "status": "success",
        "user_id": user_id,
        "total_notifications": len(notifications),
        "unread_count": sum(
            1
            for item in notifications
            if not item.is_read
        ),
        "notifications": [
            {
                "id": item.id,
                "title": item.title,
                "message": item.message,
                "type": item.type,
                "is_read": item.is_read,
                "created_at": item.created_at
            }
            for item in notifications
        ]
    }


# ======================================================
# MARK ONE NOTIFICATION AS READ
# ======================================================

@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return {
        "status": "success",
        "message": "Notification marked as read",
        "notification_id": notification.id
    }


# ======================================================
# MARK ALL NOTIFICATIONS AS READ
# ======================================================

@router.patch("/user/{user_id}/read-all")
def mark_all_notifications_read(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    updated_count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update(
        {"is_read": True},
        synchronize_session=False
    )

    db.commit()

    return {
        "status": "success",
        "message": "All notifications marked as read",
        "updated_count": updated_count
    }


# ======================================================
# CLEAR ALL NOTIFICATIONS
# ======================================================

@router.delete("/user/{user_id}")
def clear_notifications(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    deleted_count = db.query(Notification).filter(
        Notification.user_id == user_id
    ).delete(
        synchronize_session=False
    )

    db.commit()

    return {
        "status": "success",
        "message": "Notifications cleared",
        "deleted_count": deleted_count
    }