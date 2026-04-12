"""
GasCost — gas money split calculator for Yugo.

Formula:
  1. Get driving distance (miles) between from_location and to_location
     using Google Maps Distance Matrix API.
  2. total_gas_cost = (distance_miles / AVG_MPG) * GAS_PRICE_PER_GALLON
  3. passenger_pool = total_gas_cost * PASSENGER_SHARE  (passengers cover 60%)
  4. cost_per_passenger = passenger_pool / num_passengers

Constants (hardcoded for MVP):
  - GAS_PRICE_PER_GALLON = $3.50
  - AVG_MPG = 27.0
  - PASSENGER_SHARE = 0.60  (passengers split 60%, driver covers 40%)
"""

import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

GAS_PRICE_PER_GALLON = 3.50
AVG_MPG = 27.0
PASSENGER_SHARE = 0.60

GOOGLE_MAPS_API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY", "")
DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json"


async def get_distance_miles(origin: str, destination: str) -> Optional[float]:
    """Call Google Distance Matrix API to get driving distance in miles."""
    if not GOOGLE_MAPS_API_KEY:
        logger.warning("GOOGLE_MAPS_API_KEY not set, cannot calculate distance")
        return None

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                DISTANCE_MATRIX_URL,
                params={
                    "origins": origin,
                    "destinations": destination,
                    "units": "imperial",
                    "key": GOOGLE_MAPS_API_KEY,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        element = data["rows"][0]["elements"][0]
        if element["status"] != "OK":
            logger.warning("Distance Matrix status: %s for %s → %s", element["status"], origin, destination)
            return None

        # distance comes in meters, convert to miles
        meters = element["distance"]["value"]
        miles = meters / 1609.34
        return round(miles, 1)

    except Exception as e:
        logger.warning("Distance Matrix API error: %s", e)
        return None


def calculate_gas_split(distance_miles: float, num_passengers: int) -> dict:
    """
    Calculate gas cost split.

    Returns:
        {
            "distanceMiles": 45.2,
            "totalGasCost": 5.85,
            "passengerPool": 3.51,
            "costPerPassenger": 1.75,
            "numPassengers": 2,
            "driverCost": 2.34,
        }
    """
    if num_passengers < 1:
        num_passengers = 1

    total_gas_cost = (distance_miles / AVG_MPG) * GAS_PRICE_PER_GALLON
    passenger_pool = total_gas_cost * PASSENGER_SHARE
    cost_per_passenger = passenger_pool / num_passengers
    driver_cost = total_gas_cost - passenger_pool

    return {
        "distanceMiles": round(distance_miles, 1),
        "totalGasCost": round(total_gas_cost, 2),
        "passengerPool": round(passenger_pool, 2),
        "costPerPassenger": round(cost_per_passenger, 2),
        "numPassengers": num_passengers,
        "driverCost": round(driver_cost, 2),
    }


async def estimate_ride_cost(
    from_location: str,
    to_location: str,
    num_passengers: int = 1,
) -> Optional[dict]:
    """
    Full pipeline: get distance then calculate split.
    Returns None if distance can't be determined.
    """
    distance = await get_distance_miles(from_location, to_location)
    if distance is None:
        return None

    return calculate_gas_split(distance, num_passengers)
