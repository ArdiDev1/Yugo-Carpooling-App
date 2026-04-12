from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel, Field
from typing import Annotated, Union
from datetime import datetime, date, timezone
import uuid

from app.models.passenger import Passenger, PassengerCreate
from app.models.driver import Driver, DriverCreate
from app.auth.deps import get_current_user
from app.db.mock_db import passengers_db, drivers_db
from app.models.user import _config

router = APIRouter()

SignupBody = Annotated[Union[PassengerCreate, DriverCreate], Field(discriminator="role")]


class LoginRequest(BaseModel):
    model_config = _config
    email: str
    password: str


def _find_user(email: str) -> Union[Passenger, Driver, None]:
    for u in passengers_db + drivers_db:
        if u.email == email:
            return u
    return None


def _make_token(user_id: str) -> str:
    return f"mock-token-{user_id}"


@router.post(
    "/signup",
    summary="Register a new user",
    description="Creates a passenger or driver account. Set `role` to `passenger` or `driver`. "
                "Drivers must complete license verification separately.",
    status_code=201,
    responses={409: {"description": "Email already registered"}},
)
def signup(body: SignupBody):
    if _find_user(body.email):
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(uuid.uuid4())
    prefix = "Dr" if body.role == "driver" else "Pa"
    username = f"{prefix}_{body.name.split()[0]}"
    now = datetime.now(timezone.utc)

    if body.role == "driver":
        user = Driver(
            id=user_id,
            username=username,
            name=body.name,
            email=body.email,
            phone=body.phone,
            dob=body.dob,
            pronouns=body.pronouns,
            sex=body.sex,
            prefers_women=body.prefers_women,
            school=body.school or "",
            school_id=body.school_id or "",
            license_expiration=body.license_expiration,
            created_at=now,
        )
        drivers_db.append(user)
    else:
        user = Passenger(
            id=user_id,
            username=username,
            name=body.name,
            email=body.email,
            phone=body.phone,
            dob=body.dob,
            pronouns=body.pronouns,
            sex=body.sex,
            prefers_women=body.prefers_women,
            school=body.school or "",
            school_id=body.school_id or "",
            created_at=now,
        )
        passengers_db.append(user)

    return {"user": user, "token": _make_token(user_id)}


@router.post(
    "/login",
    summary="Log in",
    description="Authenticate with a school email and password. Returns the user object and a bearer token.",
    responses={401: {"description": "Invalid credentials"}},
)
def login(body: LoginRequest):
    user = _find_user(body.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"user": user, "token": _make_token(user.id)}


@router.get(
    "/me",
    summary="Get current user",
    description="Returns the full profile of the authenticated user.",
    responses={401: {"description": "Missing or invalid token"}},
)
def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.post(
    "/logout",
    summary="Log out",
    description="Invalidates the current session. The client should clear its stored token.",
)
def logout():
    return {"ok": True}


@router.post(
    "/verify-email",
    summary="Verify school email",
    description="Submit the 4-digit code sent to the user's school email address.",
    responses={400: {"description": "Invalid or expired code"}},
)
def verify_email(body: dict):
    return {"ok": True}


@router.post(
    "/verify-license",
    summary="Upload driver's license",
    description="Multipart upload of a license image plus its expiration date. "
                "Only the expiration date is stored — the image is not persisted.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def verify_license(file: UploadFile = File(...), expiration_date: date = Form(...)):
    return {"ok": True, "expirationDate": expiration_date}
