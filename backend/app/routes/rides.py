from fastapi import APIRouter
from app.models.ride import Ride
from app.db.mock_db import rides_db

router = APIRouter()

@router.post("/rides", response_model=Ride)
async def create_ride(ride: Ride):
    rides_db.append(ride)
    return ride

@router.get("/rides", response_model=list[Ride])
async def get_rides():
    return rides_db