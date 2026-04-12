# map.py
import os
from typing import Literal, Optional

import httpx
from pydantic import BaseModel

GOOGLE_MAPS_API_KEY = os.environ["GOOGLE_MAPS_API_KEY"]
GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

PinRole = Literal["driver", "passenger"]

PIN_COLORS = {
    "driver": "#1E88E5",
    "passenger": "#E53935",
}


class Pin(BaseModel):
    id: str
    role: PinRole
    label: str
    address: Optional[str] = None
    lat: float
    lng: float
    color: str


def get_map_config(lat: float, lng: float, zoom: int = 14):
    return {
        "apiKey": GOOGLE_MAPS_API_KEY,
        "center": {"lat": lat, "lng": lng},
        "zoom": zoom,
    }


def create_pin(
    user_id: str,
    role: PinRole,
    lat: float,
    lng: float,
    label: Optional[str] = None,
    address: Optional[str] = None,
) -> Pin:
    return Pin(
        id=f"{role}-{user_id}",
        role=role,
        label=label or role.capitalize(),
        address=address,
        lat=lat,
        lng=lng,
        color=PIN_COLORS[role],
    )


def create_driver_pin(
    driver_id: str,
    lat: float,
    lng: float,
    name: Optional[str] = None,
    address: Optional[str] = None,
) -> Pin:
    return create_pin(driver_id, "driver", lat, lng, label=name, address=address)


def create_passenger_pin(
    passenger_id: str,
    lat: float,
    lng: float,
    name: Optional[str] = None,
    address: Optional[str] = None,
) -> Pin:
    return create_pin(passenger_id, "passenger", lat, lng, label=name, address=address)


async def geocode_address(address: str) -> Optional[dict]:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GEOCODE_URL,
            params={"address": address, "key": GOOGLE_MAPS_API_KEY},
            timeout=10.0,
        )
    resp.raise_for_status()
    data = resp.json()

    if data.get("status") != "OK" or not data.get("results"):
        return None

    location = data["results"][0]["geometry"]["location"]
    return {"lat": location["lat"], "lng": location["lng"]}


async def reverse_geocode(lat: float, lng: float) -> Optional[str]:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GEOCODE_URL,
            params={"latlng": f"{lat},{lng}", "key": GOOGLE_MAPS_API_KEY},
            timeout=10.0,
        )
    resp.raise_for_status()
    data = resp.json()

    if data.get("status") != "OK" or not data.get("results"):
        return None

    return data["results"][0]["formatted_address"]