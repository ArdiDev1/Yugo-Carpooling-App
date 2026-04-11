# rider.py

from pydantic import BaseModel
from typing import List

from backend.app.models.passenger import Passenger
from backend.app.models.driver import Driver

class Ride(BaseModel):
    id: str

    driver: Driver

    from_location: str
    to_location: str
    time: str
    price: float
    seats_available: int

    passengers: List[Passenger] = []