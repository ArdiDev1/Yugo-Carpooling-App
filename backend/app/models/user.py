from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List, Optional
from datetime import date, datetime

_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, serialize_by_alias=True)


class UserBase(BaseModel):
    model_config = _config

    id: str
    username: str
    name: str
    email: str
    phone: str
    dob: date
    pronouns: Optional[str] = None
    sex: str
    prefers_women: bool = False
    school: str
    school_id: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    email_verified: bool = False
    rating: float = 0.0
    rating_count: int = 0
    payment_methods: List[str] = []
    following: List[str] = []
    followers: List[str] = []
    created_at: datetime


class UserCreate(BaseModel):
    model_config = _config

    name: str
    email: str
    password: str
    phone: str
    dob: date
    pronouns: Optional[str] = None
    sex: str
    prefers_women: bool = False
    school: Optional[str] = None
    school_id: Optional[str] = None


class UserUpdate(BaseModel):
    """
    Allowlist of fields a user may self-update via PATCH /users/me.

    Everything else (role, password_hash, email_verified, license_verified,
    rating, followers, etc.) is rejected so a client cannot escalate privileges
    or rewrite immutable identity fields.
    """
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
        extra="forbid",
    )

    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    pronouns: Optional[str] = None
    location: Optional[str] = None
    prefers_women: Optional[bool] = None
    vehicle: Optional[dict] = None
