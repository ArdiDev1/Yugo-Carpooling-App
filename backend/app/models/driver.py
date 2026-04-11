from pydantic import BaseModel
from typing import Literal, Optional
from datetime import date
from app.models.user import UserBase, UserCreate, _config


class Vehicle(BaseModel):
    model_config = _config

    make: str
    model: str
    year: int
    color: str
    plate: str


class Driver(UserBase):
    role: Literal["driver"] = "driver"
    license_verified: bool = False
    license_expiration: Optional[date] = None
    vehicle: Optional[Vehicle] = None


class DriverCreate(UserCreate):
    role: Literal["driver"] = "driver"
    license_expiration: Optional[date] = None
