"""
Authorization regression tests.

These verify that one user cannot read, modify, or delete another user's data.
This is the kind of bug that's easy to introduce when refactoring auth code —
e.g. forgetting to scope an update query by current_user.id.
"""
from tests.conftest import auth_header, register


async def _two_users(client):
    alice = await register(
        client, email="alice@dartmouth.edu", password="alice-pass", name="Alice A"
    )
    bob = await register(
        client, email="bob@dartmouth.edu", password="bob-pass", name="Bob B"
    )
    return alice, bob


async def test_patch_me_only_updates_caller(client):
    alice, bob = await _two_users(client)

    # Alice updates her own bio.
    resp = await client.patch(
        "/api/v1/users/me",
        headers=auth_header(alice["token"]),
        json={"bio": "alice-was-here"},
    )
    assert resp.status_code == 200

    # Bob's profile must be untouched.
    resp = await client.get("/api/v1/auth/me", headers=auth_header(bob["token"]))
    assert resp.status_code == 200
    assert resp.json().get("bio") != "alice-was-here"


async def test_patch_me_requires_auth(client):
    resp = await client.patch("/api/v1/users/me", json={"bio": "noauth"})
    assert resp.status_code in (401, 403)


async def test_payment_methods_are_scoped_to_caller(client):
    alice, bob = await _two_users(client)

    resp = await client.patch(
        "/api/v1/users/me/payment-methods",
        headers=auth_header(alice["token"]),
        json={"paymentMethods": ["venmo", "cash"]},
    )
    assert resp.status_code == 200

    # Bob's payment methods should still be empty.
    resp = await client.get("/api/v1/auth/me", headers=auth_header(bob["token"]))
    assert resp.json().get("paymentMethods", []) == []


async def test_payment_methods_validation_rejects_non_strings(client):
    alice = await register(client)
    resp = await client.patch(
        "/api/v1/users/me/payment-methods",
        headers=auth_header(alice["token"]),
        json={"paymentMethods": ["venmo", 123, None]},
    )
    assert resp.status_code == 422


async def test_delete_me_requires_auth(client):
    resp = await client.delete("/api/v1/users/me")
    assert resp.status_code in (401, 403)


async def test_delete_me_only_deletes_caller(client, db):
    alice, _bob = await _two_users(client)

    resp = await client.delete("/api/v1/users/me", headers=auth_header(alice["token"]))
    assert resp.status_code == 200

    # Bob still exists.
    bob_doc = await db["users"].find_one({"email": "bob@dartmouth.edu"})
    assert bob_doc is not None

    # Alice is gone.
    alice_doc = await db["users"].find_one({"email": "alice@dartmouth.edu"})
    assert alice_doc is None
