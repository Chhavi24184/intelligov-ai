"""
tests/conftest.py
-----------------
Pytest configuration and shared fixtures for IntelliGov AI tests.
Sets up an in-memory SQLite database, FastAPI TestClient, and test users.
"""

import os
import sys
from pathlib import Path

# Ensure backend directory is first in sys.path so backend packages take precedence
backend_path = str(Path(__file__).resolve().parent.parent / "backend")
root_path = str(Path(__file__).resolve().parent.parent)

while backend_path in sys.path:
    sys.path.remove(backend_path)
sys.path.insert(0, backend_path)

while root_path in sys.path:
    sys.path.remove(root_path)

# Clear any cached agents modules to ensure backend/agents is loaded
for mod_name in list(sys.modules.keys()):
    if mod_name == "agents" or mod_name.startswith("agents."):
        del sys.modules[mod_name]



# Use SQLite for tests
os.environ["DATABASE_URL"] = "sqlite:///./test_intelligov.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-32-chars-long-min-for-security"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173,http://localhost:3000"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app
from models.user import User
from models.saved_scheme import SavedScheme
from models.notification import Notification
from models.chat_history import ChatHistory
from core.security import get_password_hash, create_access_token

# Test database engine
TEST_DB_URL = "sqlite:///./test_intelligov.db"
test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all tables before tests and tear down after."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_intelligov.db"):
        try:
            os.remove("./test_intelligov.db")
        except Exception:
            pass


@pytest.fixture
def db_session():
    """Provide a transactional DB session for a test."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db_session):
    """Provide a FastAPI TestClient with DB dependency overridden."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_1(db_session):
    """Create primary test user (User 1)."""
    user = db_session.query(User).filter(User.email == "alice@example.com").first()
    if not user:
        user = User(
            name="Alice Sharma",
            email="alice@example.com",
            password=get_password_hash("SecretPass123!"),
            age=28,
            state="Punjab",
            district="Ludhiana",
            occupation="farmer",
            income="below 1 lakh",
            category="general",
            language="en"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


@pytest.fixture
def test_user_2(db_session):
    """Create secondary test user (User 2) for ownership & IDOR tests."""
    user = db_session.query(User).filter(User.email == "bob@example.com").first()
    if not user:
        user = User(
            name="Bob Kumar",
            email="bob@example.com",
            password=get_password_hash("BobSecretPass456!"),
            age=22,
            state="Delhi",
            district="New Delhi",
            occupation="student",
            income="1-2.5 lakh",
            category="obc",
            language="hi"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


@pytest.fixture
def user1_token(test_user_1):
    """JWT Bearer token for User 1."""
    return create_access_token(
        data={"sub": str(test_user_1.id), "email": test_user_1.email, "name": test_user_1.name}
    )


@pytest.fixture
def user2_token(test_user_2):
    """JWT Bearer token for User 2."""
    return create_access_token(
        data={"sub": str(test_user_2.id), "email": test_user_2.email, "name": test_user_2.name}
    )


@pytest.fixture
def auth_headers_user1(user1_token):
    """Authorization header dictionary for User 1."""
    return {"Authorization": f"Bearer {user1_token}"}


@pytest.fixture
def auth_headers_user2(user2_token):
    """Authorization header dictionary for User 2."""
    return {"Authorization": f"Bearer {user2_token}"}
