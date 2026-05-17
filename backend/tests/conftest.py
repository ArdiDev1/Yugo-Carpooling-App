"""
Shared fixtures for the security/regression test suite.

We swap the real Mongo driver for an in-memory mongomock instance so tests
require no Docker or env vars — they run anywhere `pip install -r requirements-dev.txt`
has succeeded. Each test gets its own isolated database.
"""
import os
from typing import AsyncIterator

# A stable, test-only JWT secret. Must be set before importing app modules
# so token issuance works without depending on the real .env.
os.environ.setdefault("JWT_SECRET", "test-secret-do-not-use-in-prod")
# Disable rate limiting for the regression suite. The dedicated rate-limit
# test re-enables it locally.
os.environ.setdefault("RATE_LIMIT_ENABLED", "false")

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient

from app import main as main_module
from app.db import mongo as mongo_module
from app.routes import auth as auth_route_module


@pytest_asyncio.fixture
async def db(monkeypatch) -> AsyncIterator:
    client = AsyncMongoMockClient()
    test_db = client.get_database("yugo_test")

    monkeypatch.setattr(mongo_module, "_client", client)
    monkeypatch.setattr(mongo_module, "_db", test_db)

    # The unique (email, role) index is security-relevant: it prevents
    # duplicate registrations. Recreate it on the mock collection.
    await test_db["users"].create_index([("email", 1), ("role", 1)], unique=True)

    yield test_db


@pytest_asyncio.fixture
async def client(db, monkeypatch) -> AsyncIterator[AsyncClient]:
    # Don't actually send verification emails during tests.
    monkeypatch.setattr(
        auth_route_module, "send_verification_code", lambda **kwargs: None
    )

    # ASGITransport doesn't run the lifespan — which is what we want, since
    # the real lifespan tries to connect to a live MongoDB.
    transport = ASGITransport(app=main_module.app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


def _signup_payload(
    *,
    role: str = "passenger",
    email: str = "alice@dartmouth.edu",
    password: str = "correct horse battery",
    name: str = "Alice Smith",
) -> dict:
    return {
        "role": role,
        "name": name,
        "email": email,
        "password": password,
        "phone": "555-0100",
        "dob": "2000-01-01",
        "sex": "F",
        "prefersWomen": False,
        "school": "Dartmouth",
        "schoolId": "12345",
    }


async def register(
    client: AsyncClient,
    *,
    role: str = "passenger",
    email: str = "alice@dartmouth.edu",
    password: str = "correct horse battery",
    name: str = "Alice Smith",
) -> dict:
    """Sign up a user and return {'user': ..., 'token': ...}."""
    resp = await client.post(
        "/api/v1/auth/signup",
        json=_signup_payload(role=role, email=email, password=password, name=name),
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
