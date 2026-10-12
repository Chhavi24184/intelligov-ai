from sqlalchemy import Column, Integer, String, Text, UniqueConstraint
from database import Base


class Scheme(Base):
    """Government scheme catalogue stored in the application database."""

    __tablename__ = "government_schemes"
    __table_args__ = (
        UniqueConstraint("name", name="uq_government_schemes_name"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False, index=True)
    category = Column(String(200), nullable=False, default="Other sectors and public services")
    description = Column(Text, nullable=False, default="")
    benefits = Column(Text, nullable=False, default="")
    eligibility = Column(Text, nullable=False, default="")
    documents = Column(Text, nullable=False, default="[]")
    deadline = Column(String(300), nullable=True)
    official_url = Column(Text, nullable=False, default="")
