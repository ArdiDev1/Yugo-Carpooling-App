"""
Rate-limiting regression test.

The limiter is disabled globally in conftest so the rest of the suite isn't
held to production limits. This file flips it back on for one test and
confirms that the signup endpoint returns 429 once the threshold is crossed.
"""
import pytest

from app.limiter import limiter
from tests.conftest import _signup_payload


@pytest.fixture
def rate_limiter_on():
    """Enable rate limiting and clear any prior counters."""
    limiter.reset()
    limiter.enabled = True
    yield
    limiter.enabled = False
    limiter.reset()


async def test_signup_is_rate_limited(client, rate_limiter_on):
    """Signup limit is 5/minute. Sixth request from the same IP must 429."""
    # Calls 1–5: should succeed (or 409 on duplicate, but never 429).
    for i in range(5):
        payload = _signup_payload(email=f"user{i}@dartmouth.edu")
        resp = await client.post("/api/v1/auth/signup", json=payload)
        assert resp.status_code != 429, f"hit limit early on call {i + 1}: {resp.text}"

    # Call 6: blocked.
    payload = _signup_payload(email="user-over-limit@dartmouth.edu")
    resp = await client.post("/api/v1/auth/signup", json=payload)
    assert resp.status_code == 429
