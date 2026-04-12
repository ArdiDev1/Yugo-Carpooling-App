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
