from datetime import date, datetime, timezone
from typing import Union

import bcrypt
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.auth.deps import get_current_user
from app.db.mongo import users_collection
from app.models.driver import Driver
from app.models.passenger import Passenger
from app.models.user import _config
from app.services.IdCheck import verify_id
from pydantic import BaseModel

router = APIRouter()


class LoginRequest(BaseModel):
    model_config = _config
    email: str
    password: str


def _now() -> datetime:
    return datetime.now(timezone.utc)


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
<<<<<<< HEAD
=======
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
>>>>>>> cea7dabda77fd7868e3dc27d6c69a87f3d4e8c2c
    "/login",
    summary="Log in",
    description="Authenticate with a school email and password. Returns the user object and a bearer token.",
    responses={401: {"description": "Invalid credentials"}},
)
async def login(body: LoginRequest):
    email = body.email.lower()
    doc = await users_collection().find_one({"email": email})
    if not doc or not _verify_password(body.password, doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"user": _doc_to_user(doc), "token": _make_token(doc["_id"])}


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
