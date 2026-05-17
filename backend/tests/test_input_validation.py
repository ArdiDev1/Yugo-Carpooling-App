"""
Input-validation regression tests.

Verifies that PATCH endpoints reject unknown fields and cannot be used to
write privileged columns (role, rating, license_verified, etc.). These are
the regressions BACKEND_WEAK_POINTS.md #2 and #3 protect against.
"""
from tests.conftest import auth_header, register


# ---------------------------------------------------------------------------
# Issue 2 — PATCH /users/me only accepts the allowlisted fields
# ---------------------------------------------------------------------------

async def test_patch_me_rejects_unknown_fields(client):
    body = await register(client)
    resp = await client.patch(
        "/api/v1/users/me",
        headers=auth_header(body["token"]),
        json={"unknownField": "value"},
    )
    assert resp.status_code == 422


async def test_patch_me_cannot_change_role(client, db):
    body = await register(client)
    resp = await client.patch(
        "/api/v1/users/me",
        headers=auth_header(body["token"]),
        json={"role": "driver"},
    )
    assert resp.status_code == 422

    doc = await db["users"].find_one({"email": "alice@dartmouth.edu"})
    assert doc["role"] == "passenger"


async def test_patch_me_cannot_self_verify_license(client, db):
    body = await register(client)
    resp = await client.patch(
        "/api/v1/users/me",
        headers=auth_header(body["token"]),
        json={"licenseVerified": True, "emailVerified": True},
    )
    assert resp.status_code == 422


async def test_patch_me_cannot_inflate_rating(client, db):
    body = await register(client)
    resp = await client.patch(
        "/api/v1/users/me",
        headers=auth_header(body["token"]),
        json={"rating": 5.0, "ratingCount": 999},
    )
    assert resp.status_code == 422

    doc = await db["users"].find_one({"email": "alice@dartmouth.edu"})
    assert doc["rating"] == 0.0
    assert doc["rating_count"] == 0


async def test_patch_me_accepts_allowed_fields(client):
    body = await register(client)
    resp = await client.patch(
        "/api/v1/users/me",
        headers=auth_header(body["token"]),
        json={"bio": "new bio", "pronouns": "they/them"},
    )
    assert resp.status_code == 200
    assert resp.json()["bio"] == "new bio"
    assert resp.json()["pronouns"] == "they/them"


# ---------------------------------------------------------------------------
# Issue 3 — PATCH /posts/{post_id} only accepts the allowlisted fields
# ---------------------------------------------------------------------------

async def _create_offer(client, token: str) -> str:
    """Create a ride offer and return its id."""
    payload = {
        "type": "offer",
        "content": "Going to Boston",
        "fromLocation": "Hanover, NH",
        "toLocation": "Boston, MA",
        "purpose": "other",
        "date": "2030-01-01",
        "seatsTotal": 3,
    }
    # Drivers create offers; for this test the post type is what matters,
    # not the author role, so a passenger can still create an offer doc.
    resp = await client.post(
        "/api/v1/posts", headers=auth_header(token), json=payload
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


async def test_patch_post_rejects_unknown_fields(client):
    body = await register(client)
    post_id = await _create_offer(client, body["token"])

    resp = await client.patch(
        f"/api/v1/posts/{post_id}",
        headers=auth_header(body["token"]),
        json={"sneakyField": 123},
    )
    assert resp.status_code == 422


async def test_patch_post_cannot_change_author(client, db):
    body = await register(client)
    post_id = await _create_offer(client, body["token"])

    resp = await client.patch(
        f"/api/v1/posts/{post_id}",
        headers=auth_header(body["token"]),
        json={"authorId": "someone-else"},
    )
    assert resp.status_code == 422

    doc = await db["rides"].find_one({"_id": post_id})
    assert doc["author_id"] == body["user"]["id"]


async def test_patch_post_cannot_inflate_likes(client, db):
    body = await register(client)
    post_id = await _create_offer(client, body["token"])

    resp = await client.patch(
        f"/api/v1/posts/{post_id}",
        headers=auth_header(body["token"]),
        json={"likes": 9999},
    )
    assert resp.status_code == 422


async def test_patch_post_accepts_camel_case_alias(client):
    """The old allowlist silently dropped camelCase keys. The new model
    accepts both via populate_by_name=True — fromLocation works."""
    body = await register(client)
    post_id = await _create_offer(client, body["token"])

    resp = await client.patch(
        f"/api/v1/posts/{post_id}",
        headers=auth_header(body["token"]),
        json={"fromLocation": "Lebanon, NH"},
    )
    assert resp.status_code == 200
    assert resp.json()["fromLocation"] == "Lebanon, NH"
