from pydantic import BaseModel
from typing import Literal, Optional
from datetime import date
from app.models.user import UserBase, UserCreate


class Vehicle(BaseModel):
    make: str
    model: str
    year: int
    color: str
    plate: str


class Driver(UserBase):
    """Full driver record (used in responses)."""
    role: Literal["driver"] = "driver"
    license_verified: bool = False
    license_expiration: Optional[date] = None
    vehicle: Optional[Vehicle] = None


class DriverCreate(UserCreate):
    """Payload for registering as a driver."""
    role: Literal["driver"] = "driver"
    license_expiration: Optional[date] = None
