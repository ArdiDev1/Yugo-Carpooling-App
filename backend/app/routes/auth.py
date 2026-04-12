import random
import uuid
from datetime import datetime, date, timedelta, timezone
from typing import Annotated, Optional, Union

import bcrypt
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.auth.deps import get_current_user
from app.db.mongo import (
    users_collection,
    verification_codes_collection,
)
from app.models.driver import Driver, DriverCreate
from app.models.passenger import Passenger, PassengerCreate
from app.models.user import _config
from app.services.email import send_verification_code
from app.services.IdCheck import verify_id

router = APIRouter()

SignupBody = Annotated[Union[PassengerCreate, DriverCreate], Field(discriminator="role")]

CODE_TTL_MINUTES = 10


class LoginRequest(BaseModel):
    model_config = _config
    email: str
    password: str
    role: Optional[str] = None


class VerifyEmailRequest(BaseModel):
    model_config = _config
    code: str


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def _make_token(user_id: str) -> str:
    return f"mock-token-{user_id}"


def _doc_to_user(doc: dict) -> Union[Passenger, Driver]:
    data = {k: v for k, v in doc.items() if k != "password_hash"}
    data["id"] = data.pop("_id")
    if isinstance(data.get("dob"), str):
        data["dob"] = date.fromisoformat(data["dob"])
    if data.get("role") == "driver":
        exp = data.get("license_expiration")
        if isinstance(exp, str):
            data["license_expiration"] = date.fromisoformat(exp)
        return Driver(**data)
    return Passenger(**data)


@router.post(
    "/signup",
    summary="Register a new user",
    description="Creates a passenger or driver account and emails a 4-digit verification code.",
    status_code=201,
    responses={409: {"description": "Email already registered"}},
)
async def signup(body: SignupBody):
    email = body.email.lower()

    existing = await users_collection().find_one({"email": email, "role": body.role})
    if existing:
        raise HTTPException(status_code=409, detail=f"Email already registered as {body.role}")

    user_id = str(uuid.uuid4())
    prefix = "Dr" if body.role == "driver" else "Pa"
    username = f"{prefix}_{body.name.split()[0]}"
    now = _now()

    user_doc = {
        "_id": user_id,
        "role": body.role,
        "username": username,
        "name": body.name,
        "email": email,
        "password_hash": _hash_password(body.password),
        "phone": body.phone,
        "dob": body.dob.isoformat(),
        "pronouns": body.pronouns,
        "sex": body.sex,
        "prefers_women": body.prefers_women,
        "school": body.school or "",
        "school_id": body.school_id or "",
        "avatar_url": None,
        "bio": None,
        "location": None,
        "email_verified": False,
        "rating": 0.0,
        "rating_count": 0,
        "payment_methods": [],
        "following": [],
        "followers": [],
        "created_at": now,
    }

    if body.role == "driver":
        user_doc["license_verified"] = False
        user_doc["license_expiration"] = (
            body.license_expiration.isoformat() if body.license_expiration else None
        )
        user_doc["vehicle"] = None

    await users_collection().insert_one(user_doc)

    # Drivers skip email verification — they go straight to license upload
    if body.role != "driver":
        code = f"{random.randint(0, 9999):04d}"
        await verification_codes_collection().update_one(
            {"email": email},
            {
                "$set": {
                    "email": email,
                    "code": code,
                    "name": body.name,
                    "expires_at": now + timedelta(minutes=CODE_TTL_MINUTES),
                }
            },
            upsert=True,
        )

        try:
            send_verification_code(to=body.email, code=code)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Failed to send email: {exc}")

    return {"user": _doc_to_user(user_doc), "token": _make_token(user_id)}


@router.post(
    "/login",
    summary="Log in",
    description="Authenticate with a school email and password. Returns the user object and a bearer token.",
    responses={401: {"description": "Invalid credentials"}},
)
async def login(body: LoginRequest):
    email = body.email.lower()

    if body.role:
        # Specific role requested
        doc = await users_collection().find_one({"email": email, "role": body.role})
        if not doc or not _verify_password(body.password, doc.get("password_hash", "")):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"user": _doc_to_user(doc), "token": _make_token(doc["_id"])}

    # No role specified — find all accounts with this email
    docs = await users_collection().find({"email": email}).to_list(2)
    if not docs:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password against the first matching account
    valid_doc = None
    for doc in docs:
        if _verify_password(body.password, doc.get("password_hash", "")):
            valid_doc = doc
            break

    if not valid_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # If user has both roles, return both so the frontend can let them pick
    if len(docs) > 1 and all(_verify_password(body.password, d.get("password_hash", "")) for d in docs):
        accounts = [_doc_to_user(d) for d in docs]
        tokens = {d["role"]: _make_token(d["_id"]) for d in docs}
        return {"accounts": [{"user": a, "token": tokens[a.role]} for a in accounts]}

    return {"user": _doc_to_user(valid_doc), "token": _make_token(valid_doc["_id"])}


@router.get(
    "/me",
    summary="Get current user",
    description="Returns the full profile of the authenticated user.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.post(
    "/logout",
    summary="Log out",
    description="Invalidates the current session. The client should clear its stored token.",
)
async def logout():
    return {"ok": True}


@router.post(
    "/verify-email",
    summary="Verify school email",
    description="Submit the 4-digit code sent to the user's school email address.",
    responses={400: {"description": "Invalid or expired code"}},
)
async def verify_email(
    body: VerifyEmailRequest,
    current_user=Depends(get_current_user),
):
    email = current_user.email.lower()
    entry = await verification_codes_collection().find_one({"email": email})
    if not entry:
        raise HTTPException(status_code=404, detail="No code requested for this email")

    if _now() > entry["expires_at"]:
        await verification_codes_collection().delete_one({"email": email})
        raise HTTPException(status_code=410, detail="Code expired, request a new one")

    if body.code != entry["code"]:
        raise HTTPException(status_code=401, detail="Invalid code")

    await users_collection().update_one(
        {"email": email}, {"$set": {"email_verified": True}}
    )
    await verification_codes_collection().delete_one({"email": email})

    return {"ok": True}


@router.post(
    "/verify-license",
    summary="Upload driver's license",
    description="Multipart upload of a license image plus its expiration date. "
                "Only the expiration date is stored — the image is not persisted.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def verify_license(
    file: UploadFile = File(...),
    expiration_date: date = Form(...),
    current_user=Depends(get_current_user),
):
    image_bytes = await file.read()
    result = verify_id(image_bytes)

    if not result["is_valid"]:
        raise HTTPException(
            status_code=400,
            detail="License verification failed. Please upload a clear JPEG or PNG photo.",
        )

    await users_collection().update_one(
        {"_id": current_user.id},
        {
            "$set": {
                "license_expiration": expiration_date.isoformat(),
                "license_verified": True,
            }
        },
    )
    return {"ok": True, "expirationDate": expiration_date}
