from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.services.map import geocode_address, get_map_config
from app.auth.deps import get_current_user

router = APIRouter()


class GeocodeBody(BaseModel):
    address: str


@router.get(
    "/config",
    summary="Get map bootstrap config",
    description="Returns the Google Maps API key and a default center. "
                "The frontend must read the API key from here — never hardcode it.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def map_config(
    lat: float = 43.7022,
    lng: float = -72.2896,
    zoom: int = 13,
    current_user=Depends(get_current_user),
):
    return get_map_config(lat, lng, zoom)


@router.post(
    "/geocode",
    summary="Convert an address to lat/lng",
    description="Forward-geocodes a human-readable address string via Google Maps. "
                "Results are cached indefinitely on the frontend — do not call on every keystroke.",
    responses={
        401: {"description": "Missing or invalid token"},
        404: {"description": "Address could not be geocoded"},
    },
)
async def geocode(body: GeocodeBody, current_user=Depends(get_current_user)):
    coords = await geocode_address(body.address)
    if not coords:
        raise HTTPException(status_code=404, detail="Address could not be geocoded")
    return coords
