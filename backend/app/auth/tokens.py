"""
JWT token issuance and validation.

Centralizing here means future changes (algorithm swap, refresh tokens,
denylist) happen in one file.
"""
import os
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from jose import JWTError, jwt

ALGORITHM = "HS256"
ISSUER = "yugo-api"
DEFAULT_EXPIRES_MINUTES = 60 * 24 * 7  # 7 days


def _get_secret() -> str:
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET must be set in environment")
    return secret


def _get_expires_minutes() -> int:
    raw = os.environ.get("JWT_EXPIRES_MINUTES")
    if raw is None:
        return DEFAULT_EXPIRES_MINUTES
    try:
        return int(raw)
    except ValueError:
        return DEFAULT_EXPIRES_MINUTES


def create_access_token(user_id: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    claims = {
        "sub": user_id,
        "role": role,
        "iss": ISSUER,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=_get_expires_minutes())).timestamp()),
    }
    return jwt.encode(claims, _get_secret(), algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Verify signature, expiration, and issuer. Raises 401 on any failure."""
    try:
        return jwt.decode(
            token,
            _get_secret(),
            algorithms=[ALGORITHM],
            issuer=ISSUER,
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Unauthorized")
