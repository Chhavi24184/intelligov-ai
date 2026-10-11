from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func

from database import Base


class SavedScheme(Base):
    """Stores schemes saved by a user — persists across login/logout."""

    __tablename__ = "saved_schemes"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False, index=True)

    scheme_id = Column(Integer, nullable=True)   # numeric id from schemes.json (if available)

    scheme_name = Column(String(300), nullable=False)

    scheme_category = Column(String(100), nullable=True)

    scheme_description = Column(Text, nullable=True)

    scheme_benefits = Column(Text, nullable=True)

    scheme_eligibility = Column(Text, nullable=True)

    scheme_documents = Column(Text, nullable=True)   # JSON-encoded list

    scheme_deadline = Column(String(200), nullable=True)

    scheme_official_url = Column(String(500), nullable=True)

    saved_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
