"""
tests/test_auth_security.py
---------------------------
Automated test suite verifying:
- Password hashing and verification
- JWT generation, decoding, expiry, and claim verification
- Protected endpoints rejection without token (HTTP 401)
- User ownership enforcement preventing IDOR (HTTP 403 Forbidden)
- CORS header policy compliance
"""

from datetime import timedelta
import pytest
from core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)
from models.saved_scheme import SavedScheme
from models.notification import Notification


# =========================================================
# 1. PASSWORD HASHING
# =========================================================

def test_password_hashing():
    raw_pass = "MySecret123!"
    hashed = get_password_hash(raw_pass)

    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPass", hashed) is False


# =========================================================
# 2. JWT TOKEN GENERATION & DECODING
# =========================================================

def test_jwt_token_generation_and_decoding():
    data = {"sub": "42", "email": "test@example.com"}
    token = create_access_token(data=data)

    assert isinstance(token, str)
    assert len(token) > 20

    decoded = decode_access_token(token)
    assert decoded["sub"] == "42"
    assert decoded["email"] == "test@example.com"
    assert "exp" in decoded
    assert "iat" in decoded


def test_jwt_expired_token():
    data = {"sub": "42", "email": "test@example.com"}
    # Token expired 10 minutes ago
    expired_token = create_access_token(data=data, expires_delta=timedelta(minutes=-10))

    with pytest.raises(Exception) as excinfo:
        decode_access_token(expired_token)
    assert "expired" in str(excinfo.value.detail).lower()


# =========================================================
# 3. AUTH ENDPOINTS (REGISTER & LOGIN ISSUE JWT)
# =========================================================

def test_register_endpoint_issues_jwt(client):
    unique_email = "newuser_test@example.com"
    response = client.post(
        "/auth/register",
        json={
            "name": "New User",
            "email": unique_email,
            "password": "Password123!"
        }
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "success"
    assert "access_token" in res_data
    assert res_data["token_type"] == "bearer"
    assert res_data["user"]["email"] == unique_email


def test_login_endpoint_issues_jwt(client, test_user_1):
    response = client.post(
        "/auth/login",
        json={
            "email": test_user_1.email,
            "password": "SecretPass123!"
        }
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "success"
    assert "access_token" in res_data
    assert res_data["token_type"] == "bearer"
    assert res_data["user"]["id"] == test_user_1.id


def test_login_invalid_credentials_rejected(client):
    response = client.post(
        "/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "WrongPassword"
        }
    )
    assert response.status_code == 401


def test_auth_me_with_valid_and_invalid_token(client, auth_headers_user1, test_user_1):
    # With valid token
    resp = client.get("/auth/me", headers=auth_headers_user1)
    assert resp.status_code == 200
    assert resp.json()["user"]["id"] == test_user_1.id

    # Without token -> 401
    resp_no_token = client.get("/auth/me")
    assert resp_no_token.status_code == 401

    # With invalid token -> 401
    resp_bad_token = client.get("/auth/me", headers={"Authorization": "Bearer bad.token.here"})
    assert resp_bad_token.status_code == 401


# =========================================================
# 4. USER OWNERSHIP & IDOR VULNERABILITY PREVENTION
# =========================================================

def test_profile_ownership_enforcement(client, auth_headers_user1, test_user_1, test_user_2):
    # User 1 accesses their own profile -> 200 OK
    resp_own = client.get(f"/profile/{test_user_1.id}", headers=auth_headers_user1)
    assert resp_own.status_code == 200
    assert resp_own.json()["profile"]["email"] == test_user_1.email

    # User 1 attempts to access User 2's profile -> 403 Forbidden!
    resp_other = client.get(f"/profile/{test_user_2.id}", headers=auth_headers_user1)
    assert resp_other.status_code == 403

    # User 1 attempts to update User 2's profile -> 403 Forbidden!
    resp_update_other = client.put(
        "/profile/update",
        headers=auth_headers_user1,
        json={"user_id": test_user_2.id, "occupation": "hacker"}
    )
    assert resp_update_other.status_code == 403


def test_saved_schemes_ownership_and_idor_prevention(client, db_session, auth_headers_user1, auth_headers_user2, test_user_1, test_user_2):
    # User 2 saves a scheme
    record = SavedScheme(
        user_id=test_user_2.id,
        scheme_id=1,
        scheme_name="PM Kisan Samman Nidhi",
        scheme_category="Farmer"
    )
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    saved_id = record.id

    # User 1 attempts to view User 2's saved schemes -> 403 Forbidden!
    resp_view = client.get(f"/saved-schemes/{test_user_2.id}", headers=auth_headers_user1)
    assert resp_view.status_code == 403

    # User 1 attempts to delete User 2's saved scheme (IDOR attempt) -> 403 Forbidden!
    resp_delete_idor = client.delete(f"/saved-schemes/remove/{saved_id}", headers=auth_headers_user1)
    assert resp_delete_idor.status_code == 403

    # User 2 deletes their own saved scheme -> 200 OK
    resp_delete_own = client.delete(f"/saved-schemes/remove/{saved_id}", headers=auth_headers_user2)
    assert resp_delete_own.status_code == 200


def test_notifications_ownership_enforcement(client, db_session, auth_headers_user1, auth_headers_user2, test_user_1, test_user_2):
    # Create notification for User 2
    notif = Notification(
        user_id=test_user_2.id,
        title="Welcome",
        message="Test notification",
        type="general",
        is_read=False
    )
    db_session.add(notif)
    db_session.commit()
    db_session.refresh(notif)

    # User 1 attempts to view User 2's notifications -> 403 Forbidden!
    resp_notif = client.get(f"/notifications/{test_user_2.id}", headers=auth_headers_user1)
    assert resp_notif.status_code == 403

    # User 1 attempts to mark User 2's notification as read -> 403 Forbidden!
    resp_read_idor = client.patch(f"/notifications/{notif.id}/read", headers=auth_headers_user1)
    assert resp_read_idor.status_code == 403

    # User 2 marks their own notification as read -> 200 OK
    resp_read_own = client.patch(f"/notifications/{notif.id}/read", headers=auth_headers_user2)
    assert resp_read_own.status_code == 200


def test_chat_history_ownership_enforcement(client, auth_headers_user1, test_user_1, test_user_2):
    # User 1 attempts to read User 2's chat history -> 403 Forbidden!
    resp = client.get(f"/chat-history/{test_user_2.id}", headers=auth_headers_user1)
    assert resp.status_code == 403

    # User 1 reads their own chat history -> 200 OK
    resp_own = client.get(f"/chat-history/{test_user_1.id}", headers=auth_headers_user1)
    assert resp_own.status_code == 200


# =========================================================
# 5. CORS CONFIGURATION
# =========================================================

def test_cors_headers_allowed_origin(client):
    response = client.options(
        "/schemes",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    # Origin should be reflected (not wildcard '*') when credentials are true
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert response.headers.get("access-control-allow-credentials") == "true"


# =========================================================
# 6. LOGOUT & SECRET INTEGRITY
# =========================================================

def test_logout_endpoint(client, auth_headers_user1, test_user_1):
    # Authenticated user calls logout -> 200 OK
    resp = client.post("/auth/logout", headers=auth_headers_user1)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "Logged out successfully" in data["message"]
    assert data["user_id"] == test_user_1.id

    # Unauthenticated call -> 401 Unauthorized
    resp_no_token = client.post("/auth/logout")
    assert resp_no_token.status_code == 401

    # Invalid token -> 401 Unauthorized
    resp_bad = client.post("/auth/logout", headers={"Authorization": "Bearer invalid.jwt"})
    assert resp_bad.status_code == 401


def test_no_hardcoded_secrets_in_security_config():
    import core.security as sec
    # Verify SECRET_KEY is set and does not use hardcoded insecure default
    assert sec.SECRET_KEY is not None
    assert len(sec.SECRET_KEY) >= 16
    assert sec.SECRET_KEY != "intelligov-ai-secure-jwt-secret-key-2026"


def test_login_email_case_insensitivity(client, test_user_1):
    # Logging in with uppercase email should succeed
    response = client.post(
        "/auth/login",
        json={
            "email": f"  {test_user_1.email.upper()}  ",
            "password": "SecretPass123!"
        }
    )
    assert response.status_code == 200
    assert response.json()["user"]["id"] == test_user_1.id


# =========================================================
# 7. EXTENDED USER OWNERSHIP ACROSS PROTECTED APIS
# =========================================================

def test_match_schemes_ownership_enforcement(client, auth_headers_user1, test_user_1, test_user_2):
    # User 1 attempts to run match-schemes for User 2 -> 403 Forbidden!
    resp = client.get(f"/match-schemes/{test_user_2.id}", headers=auth_headers_user1)
    assert resp.status_code == 403

    # Unauthenticated call -> 401 Unauthorized
    resp_unauth = client.get(f"/match-schemes/{test_user_1.id}")
    assert resp_unauth.status_code == 401


def test_eligibility_by_profile_ownership_enforcement(client, auth_headers_user1, test_user_1, test_user_2):
    # User 1 attempts to check eligibility for User 2 -> 403 Forbidden!
    resp = client.get(f"/eligibility/by-profile/{test_user_2.id}", headers=auth_headers_user1)
    assert resp.status_code == 403

    # Unauthenticated call -> 401 Unauthorized
    resp_unauth = client.get(f"/eligibility/by-profile/{test_user_1.id}")
    assert resp_unauth.status_code == 401


def test_application_endpoints_ownership_enforcement(client, auth_headers_user1, test_user_2):
    scheme_payload = {
        "name": "PM Kisan Samman Nidhi",
        "category": "Farmer",
        "benefits": "6000 per year"
    }

    # User 1 attempts to prepare application for User 2 -> 403 Forbidden!
    resp_prep = client.post(
        "/application/prepare",
        headers=auth_headers_user1,
        json={"user_id": test_user_2.id, "scheme": scheme_payload}
    )
    assert resp_prep.status_code == 403

    # User 1 attempts to submit demo application for User 2 -> 403 Forbidden!
    resp_sub = client.post(
        "/application/submit-demo",
        headers=auth_headers_user1,
        json={"user_id": test_user_2.id, "scheme_name": "PM Kisan", "form_values": {}}
    )
    assert resp_sub.status_code == 403


def test_saved_schemes_extended_ownership(client, auth_headers_user1, test_user_2):
    # User 1 attempts to save a scheme under User 2's id -> 403 Forbidden!
    resp_save = client.post(
        "/saved-schemes/save",
        headers=auth_headers_user1,
        json={"user_id": test_user_2.id, "scheme_name": "Scheme A"}
    )
    assert resp_save.status_code == 403

    # User 1 attempts to check saved status for User 2 -> 403 Forbidden!
    resp_check = client.get(
        f"/saved-schemes/check/{test_user_2.id}/Scheme%20A",
        headers=auth_headers_user1
    )
    assert resp_check.status_code == 403


def test_notifications_extended_ownership(client, auth_headers_user1, test_user_2):
    # User 1 attempts to create notification for User 2 -> 403 Forbidden!
    resp_create = client.post(
        "/notifications",
        headers=auth_headers_user1,
        json={"user_id": test_user_2.id, "title": "Spoof", "message": "Spoof message"}
    )
    assert resp_create.status_code == 403

    # User 1 attempts to mark all read for User 2 -> 403 Forbidden!
    resp_mark = client.patch(
        f"/notifications/user/{test_user_2.id}/read-all",
        headers=auth_headers_user1
    )
    assert resp_mark.status_code == 403

    # User 1 attempts to delete all notifications for User 2 -> 403 Forbidden!
    resp_del = client.delete(
        f"/notifications/user/{test_user_2.id}",
        headers=auth_headers_user1
    )
    assert resp_del.status_code == 403


def test_chat_history_save_ownership(client, auth_headers_user1, test_user_2):
    # User 1 attempts to save chat history under User 2's id -> 403 Forbidden!
    resp = client.post(
        "/chat-history/save",
        headers=auth_headers_user1,
        json={"user_id": test_user_2.id, "message": "Hi", "response": "Hello"}
    )
    assert resp.status_code == 403
