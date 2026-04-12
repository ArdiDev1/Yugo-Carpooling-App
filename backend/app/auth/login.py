import random
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.db.mongo import (
    users_collection,
    verification_codes_collection,
    verification_tokens_collection,
)
from app.models.passenger import Passenger, PassengerCreate
from app.services.email import send_verification_code

router = APIRouter()

CODE_TTL_MINUTES = 10
TOKEN_TTL_MINUTES = 30


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


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


@router.post("/auth/passenger/request-code")
async def request_code(payload: RequestCodePayload):
    if not payload.email.lower().endswith(".edu"):
        raise HTTPException(status_code=400, detail="Must use a .edu school email")

    email = payload.email.lower()

    existing = await users_collection().find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    code = f"{random.randint(0, 9999):04d}"
    await verification_codes_collection().update_one(
        {"email": email},
        {
            "$set": {
                "email": email,
                "code": code,
                "name": payload.name,
                "expires_at": _now() + timedelta(minutes=CODE_TTL_MINUTES),
            }
        },
        upsert=True,
    )

    try:
        send_verification_code(to=payload.email, code=code)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to send email: {exc}")

    return {"status": "sent"}


@router.post("/auth/passenger/verify-code")
async def verify_code(payload: VerifyCodePayload):
    email = payload.email.lower()
    entry = await verification_codes_collection().find_one({"email": email})
    if not entry:
        raise HTTPException(status_code=404, detail="No code requested for this email")

    if _now() > entry["expires_at"]:
        await verification_codes_collection().delete_one({"email": email})
        raise HTTPException(status_code=410, detail="Code expired, request a new one")

    if payload.code != entry["code"]:
        raise HTTPException(status_code=401, detail="Invalid code")

    token = secrets.token_urlsafe(16)
    await verification_tokens_collection().insert_one(
        {
            "token": token,
            "email": email,
            "expires_at": _now() + timedelta(minutes=TOKEN_TTL_MINUTES),
        }
    )
    await verification_codes_collection().delete_one({"email": email})

    return {"verification_token": token}


@router.post("/auth/passenger/register", response_model=Passenger)
async def register_passenger(payload: RegisterPayload):
    token_entry = await verification_tokens_collection().find_one(
        {"token": payload.verification_token}
    )
    if not token_entry:
        raise HTTPException(status_code=401, detail="Invalid verification token")

    if _now() > token_entry["expires_at"]:
        await verification_tokens_collection().delete_one(
            {"token": payload.verification_token}
        )
        raise HTTPException(status_code=410, detail="Verification token expired")

    email = payload.email.lower()
    if token_entry["email"] != email:
        raise HTTPException(status_code=400, detail="Token does not match email")

    existing = await users_collection().find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Passenger already registered")

    now = _now()
    user_doc = {
        "_id": str(uuid.uuid4()),
        "role": "passenger",
        "username": payload.email.split("@")[0],
        "name": payload.name,
        "email": email,
        "password_hash": _hash_password(payload.password),
        "phone": payload.phone,
        "dob": payload.dob.isoformat(),
        "pronouns": payload.pronouns,
        "sex": payload.sex,
        "prefers_women": payload.prefers_women,
        "school": payload.school or "",
        "school_id": payload.school_id or "",
        "avatar_url": None,
        "bio": None,
        "location": None,
        "email_verified": True,
        "rating": 0.0,
        "rating_count": 0,
        "payment_methods": [],
        "following": [],
        "followers": [],
        "created_at": now,
    }
    await users_collection().insert_one(user_doc)
    await verification_tokens_collection().delete_one(
        {"token": payload.verification_token}
    )

    return Passenger(
        id=user_doc["_id"],
        username=user_doc["username"],
        name=user_doc["name"],
        email=user_doc["email"],
        phone=user_doc["phone"],
        dob=payload.dob,
        pronouns=user_doc["pronouns"],
        sex=user_doc["sex"],
        prefers_women=user_doc["prefers_women"],
        school=user_doc["school"],
        school_id=user_doc["school_id"],
        email_verified=True,
        created_at=now,
    )
