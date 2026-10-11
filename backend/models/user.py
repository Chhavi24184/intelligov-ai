from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)

    password = Column(String(255), nullable=False)

    phone = Column(String(20), nullable=True)

    # =========================================================
    # CITIZEN PROFILE FIELDS
    # =========================================================

    age = Column(Integer, nullable=True)

    state = Column(String(100), nullable=True)

    district = Column(String(100), nullable=True)

    education = Column(String(100), nullable=True)

    occupation = Column(String(100), nullable=True)

    income = Column(String(50), nullable=True)   # stored as range string e.g. "0-1L"

    category = Column(String(50), nullable=True)  # General / OBC / SC / ST / EWS

    interests = Column(String(500), nullable=True)  # comma-separated list

    language = Column(String(20), nullable=True, default="en")  # BCP-47 language code, e.g. en / hi / bn / pa

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
