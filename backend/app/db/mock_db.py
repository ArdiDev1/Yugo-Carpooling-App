from typing import List, Union
from app.models.ride import RideOffer, RideRequest
from app.models.passenger import Passenger
from app.models.driver import Driver

passengers_db: List[Passenger] = []
drivers_db: List[Driver] = []
rides_db: List[Union[RideOffer, RideRequest]] = []
