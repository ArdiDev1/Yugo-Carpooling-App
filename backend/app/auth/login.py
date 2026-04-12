import uuid
from datetime import datetime, timezone

import bcrypt
from fastapi import APIRouter, HTTPException

from app.db.mongo import users_collection
from app.models.driver import Driver, DriverCreate
from app.models.passenger import Passenger, PassengerCreate

router = APIRouter()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _make_token(user_id: str) -> str:
    return f"mock-token-{user_id}"


# ---------------------------------------------------------------------------
# Passenger registration
# ---------------------------------------------------------------------------

@router.post("/auth/passenger/register", status_code=201)
async def register_passenger(payload: PassengerCreate):
    email = payload.email.lower()

    if not email.endswith(".edu"):
        raise HTTPException(status_code=400, detail="Must use a .edu school email")

    existing = await users_collection().find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    now = _now()
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "role": "passenger",
        "username": f"Pa_{payload.name.split()[0]}",
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

    user = Passenger(
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
    return {"user": user, "token": _make_token(user_id)}


# ---------------------------------------------------------------------------
# Driver registration
# ---------------------------------------------------------------------------

@router.post("/auth/driver/register", status_code=201)
async def register_driver(payload: DriverCreate):
    email = payload.email.lower()

    if not email.endswith(".edu"):
        raise HTTPException(status_code=400, detail="Must use a .edu school email")

    existing = await users_collection().find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    now = _now()
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "role": "driver",
        "username": f"Dr_{payload.name.split()[0]}",
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
        "license_verified": False,
        "license_expiration": None,
        "vehicle": None,
        "rating": 0.0,
        "rating_count": 0,
        "payment_methods": [],
        "following": [],
        "followers": [],
        "created_at": now,
    }
    await users_collection().insert_one(user_doc)

    user = Driver(
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
        license_verified=False,
        created_at=now,
    )
    return {"user": user, "token": _make_token(user_id)}
