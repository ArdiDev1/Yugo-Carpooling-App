# map.py
import os
import httpx
from typing import Optional
from pydantic import BaseModel
GOOGLE_MAPS_API_KEY = os.environ["GOOGLE_MAPS_API_KEY"]
GEOCODE_URL = ""
def get_map_config(lat: float, lng: float, zoom: int = 14):
    return {
        "apiKey": GOOGLE_MAPS_API_KEY,
        "center": {"lat": lat, "lng": lng},
        "zoom": zoom,
    }

class Pin(BaseModel):
    label: str
    address: str
    lat: float
    lng: float


async def geocode_location(address: str, label: Optional[str] = None) -> Pin:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GEOCODE_URL,
            params={"address": address, "key": GOOGLE_MAPS_API_KEY},
        )
        resp.raise_for_status()
        data = resp.json()
