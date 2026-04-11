from typing import Literal
from app.models.user import UserBase, UserCreate


class Passenger(UserBase):
    """Full passenger record (used in responses)."""
    role: Literal["passenger"] = "passenger"


class PassengerCreate(UserCreate):
    """Payload for registering as a passenger."""
    role: Literal["passenger"] = "passenger"
