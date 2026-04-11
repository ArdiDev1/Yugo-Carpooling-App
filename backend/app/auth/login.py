import random
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.models.passenger import Passenger, PassengerCreate
from app.services.email import send_verification_code

router = APIRouter()

CODE_TTL_MINUTES = 10
TOKEN_TTL_MINUTES = 30

_pending_codes: Dict[str, dict] = {}
_verification_tokens: Dict[str, dict] = {}
_passengers: Dict[str, Passenger] = {}


class RequestCodePayload(BaseModel):
    name: str
    email: EmailStr


class VerifyCodePayload(BaseModel):
    email: EmailStr
    code: str


class RegisterPayload(PassengerCreate):
    verification_token: str


def _now() -> datetime:
    return datetime.now(timezone.utc)


@router.post("/auth/passenger/request-code")
def request_code(payload: RequestCodePayload):
    if not payload.email.lower().endswith(".edu"):
        raise HTTPException(status_code=400, detail="Must use a .edu school email")

    code = f"{random.randint(0, 9999):04d}"
    _pending_codes[payload.email.lower()] = {
        "code": code,
        "name": payload.name,
        "expires_at": _now() + timedelta(minutes=CODE_TTL_MINUTES),
    }

    try:
        send_verification_code(to=payload.email, code=code)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to send email: {exc}")

    return {"status": "sent"}


@router.post("/auth/passenger/verify-code")
def verify_code(payload: VerifyCodePayload):
    entry = _pending_codes.get(payload.email.lower())
    if not entry:
        raise HTTPException(status_code=404, detail="No code requested for this email")

    if _now() > entry["expires_at"]:
        _pending_codes.pop(payload.email.lower(), None)
        raise HTTPException(status_code=410, detail="Code expired, request a new one")

    if payload.code != entry["code"]:
        raise HTTPException(status_code=401, detail="Invalid code")

    token = secrets.token_urlsafe(16)
    _verification_tokens[token] = {
        "email": payload.email.lower(),
        "expires_at": _now() + timedelta(minutes=TOKEN_TTL_MINUTES),
    }
    _pending_codes.pop(payload.email.lower(), None)

    return {"verification_token": token}


@router.post("/auth/passenger/register", response_model=Passenger)
def register_passenger(payload: RegisterPayload):
    token_entry = _verification_tokens.get(payload.verification_token)
    if not token_entry:
        raise HTTPException(status_code=401, detail="Invalid verification token")

    if _now() > token_entry["expires_at"]:
        _verification_tokens.pop(payload.verification_token, None)
        raise HTTPException(status_code=410, detail="Verification token expired")

    if token_entry["email"] != payload.email.lower():
        raise HTTPException(status_code=400, detail="Token does not match email")

    if payload.email.lower() in _passengers:
        raise HTTPException(status_code=409, detail="Passenger already registered")

    passenger = Passenger(
        id=f"usr_{secrets.token_hex(6)}",
        username=payload.email.split("@")[0],
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        dob=payload.dob,
        pronouns=payload.pronouns,
        sex=payload.sex,
        prefers_women=payload.prefers_women,
        school=payload.school,
        school_id=payload.school_id,
        email_verified=True,
        created_at=_now(),
    )

    _passengers[payload.email.lower()] = passenger
    _verification_tokens.pop(payload.verification_token, None)

    return passenger
