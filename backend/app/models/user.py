from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime


class UserBase(BaseModel):
    """Shared fields across all user types (read/response model)."""
    id: str
    username: str
    name: str
    email: str                          # school email, e.g. you@school.edu
    phone: str
    dob: date
    pronouns: Optional[str] = None
    sex: str                            # "male" | "female" | "nonbinary" | "other" | "prefer_not"
    prefers_women: bool = False
    school: str
    school_id: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    email_verified: bool = False
    rating: float = 0.0
    rating_count: int = 0
    payment_methods: List[str] = []     # "venmo" | "zelle" | "cash" | "paypal" | "apple"
    following: List[str] = []           # list of user IDs
    followers: List[str] = []           # list of user IDs
    created_at: datetime


class UserCreate(BaseModel):
    """Fields a user submits at signup (no id, rating, timestamps, etc.)."""
    name: str
    email: str
    password: str
    phone: str
    dob: date
    pronouns: Optional[str] = None
    sex: str
    prefers_women: bool = False
    school: str
    school_id: str
