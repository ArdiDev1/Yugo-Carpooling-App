"""
Auth security regression tests.

These cover the boundary of the auth system: signup, login, token validation.
If any of these fail after a change to the auth code, something is broken.
"""
import base64
import json
import os
from datetime import datetime, timezone

import bcrypt
from jose import jwt

from app.auth.tokens import ALGORITHM, ISSUER
from tests.conftest import _signup_payload, auth_header, register


async def test_signup_creates_user_and_returns_token(client):
    body = await register(client)
    assert "token" in body and body["token"]
    assert body["user"]["email"] == "alice@dartmouth.edu"


async def test_signup_stores_bcrypt_hash_not_plaintext(client, db):
    password = "correct horse battery"
    await register(client, password=password)

    doc = await db["users"].find_one({"email": "alice@dartmouth.edu"})
    assert doc is not None
    assert "password_hash" in doc
    assert doc["password_hash"] != password
    assert bcrypt.checkpw(password.encode(), doc["password_hash"].encode())


async def test_signup_rejects_duplicate_email_same_role(client):
    await register(client)
    resp = await client.post("/api/v1/auth/signup", json=_signup_payload())
    assert resp.status_code == 409


async def test_login_with_correct_credentials(client):
    await register(client)
    resp = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "alice@dartmouth.edu",
            "password": "correct horse battery",
            "role": "passenger",
        },
    )
    assert resp.status_code == 200
    assert resp.json()["token"]


async def test_login_with_wrong_password_is_rejected(client):
    await register(client)
    resp = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "alice@dartmouth.edu",
            "password": "WRONG",
            "role": "passenger",
        },
    )
    assert resp.status_code == 401


async def test_login_with_unknown_email_is_rejected(client):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@dartmouth.edu", "password": "whatever"},
    )
    assert resp.status_code == 401


async def test_me_without_token_is_rejected(client):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code in (401, 403)


async def test_me_with_garbage_token_is_rejected(client):
    resp = await client.get("/api/v1/auth/me", headers=auth_header("not-a-real-token"))
    assert resp.status_code == 401


async def test_me_with_token_for_deleted_user_is_rejected(client):
    body = await register(client)
    token = body["token"]

    # Delete the account, then the token should no longer work.
    resp = await client.delete("/api/v1/users/me", headers=auth_header(token))
    assert resp.status_code == 200

    resp = await client.get("/api/v1/auth/me", headers=auth_header(token))
    assert resp.status_code == 401


async def test_me_returns_current_user(client):
    body = await register(client)
    resp = await client.get("/api/v1/auth/me", headers=auth_header(body["token"]))
    assert resp.status_code == 200
    assert resp.json()["email"] == "alice@dartmouth.edu"


# ---------------------------------------------------------------------------
# JWT-specific regression tests
# ---------------------------------------------------------------------------

def _now_ts() -> int:
    return int(datetime.now(timezone.utc).timestamp())


async def test_token_signed_with_wrong_secret_is_rejected(client):
    """A JWT signed by anyone other than our server must not authenticate."""
    body = await register(client)
    real_claims = jwt.get_unverified_claims(body["token"])

    forged = jwt.encode(
        {**real_claims, "iat": _now_ts(), "exp": _now_ts() + 3600},
        "this-is-not-our-secret",
        algorithm=ALGORITHM,
    )

    resp = await client.get("/api/v1/auth/me", headers=auth_header(forged))
    assert resp.status_code == 401


async def test_expired_token_is_rejected(client):
    """A token whose `exp` is in the past must be rejected."""
    body = await register(client)
    real_claims = jwt.get_unverified_claims(body["token"])

    past = _now_ts() - 60
    expired = jwt.encode(
        {
            "sub": real_claims["sub"],
            "role": real_claims["role"],
            "iss": ISSUER,
            "iat": past - 3600,
            "exp": past,
        },
        # Use the same secret tests use — conftest sets JWT_SECRET in os.environ.
        os.environ["JWT_SECRET"],
        algorithm=ALGORITHM,
    )

    resp = await client.get("/api/v1/auth/me", headers=auth_header(expired))
    assert resp.status_code == 401


async def test_tampered_payload_is_rejected(client):
    """If anyone edits the payload, the signature no longer matches → 401."""
    body = await register(client)
    header, payload, signature = body["token"].split(".")

    # Decode the payload, swap the subject to someone else's id, re-encode.
    padded = payload + "=" * (-len(payload) % 4)
    claims = json.loads(base64.urlsafe_b64decode(padded))
    claims["sub"] = "attacker-controlled-id"
    new_payload = (
        base64.urlsafe_b64encode(json.dumps(claims).encode()).decode().rstrip("=")
    )

    tampered = f"{header}.{new_payload}.{signature}"

    resp = await client.get("/api/v1/auth/me", headers=auth_header(tampered))
    assert resp.status_code == 401
