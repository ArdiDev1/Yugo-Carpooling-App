# map.py
import os
from typing import Literal, Optional

import httpx

GOOGLE_MAPS_API_KEY = os.environ["GOOGLE_MAPS_API_KEY"]
GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

PinRole = Literal["driver", "passenger"]

PIN_COLORS = {
    "driver": "#FFFFFF",
    "passenger": "#000000",
}


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
):
    return {
        "id": f"{role}-{user_id}",
        "role": role,
        "position": {"lat": lat, "lng": lng},
        "label": label or role.capitalize(),
        "color": PIN_COLORS[role],
    }


def create_driver_pin(driver_id: str, lat: float, lng: float, name: Optional[str] = None):
    return create_pin(driver_id, "driver", lat, lng, label=name)


def create_passenger_pin(passenger_id: str, lat: float, lng: float, name: Optional[str] = None):
    return create_pin(passenger_id, "passenger", lat, lng, label=name)


def geocode_address(address: str) -> Optional[dict]:
    resp = httpx.get(
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


def reverse_geocode(lat: float, lng: float) -> Optional[str]:
    resp = httpx.get(
        GEOCODE_URL,
        params={"latlng": f"{lat},{lng}", "key": GOOGLE_MAPS_API_KEY},
        timeout=10.0,
    )
    resp.raise_for_status()
    data = resp.json()

    if data.get("status") != "OK" or not data.get("results"):
        return None

    return data["results"][0]["formatted_address"]


if __name__ == "__main__":
    driver_address = "Dartmouth College, Hanover, NH"
    passenger_address = "Boston Logan International Airport, Boston, MA"

    driver_coords = geocode_address(driver_address)
    passenger_coords = geocode_address(passenger_address)

    print("Driver geocode:", driver_coords)
    print("Passenger geocode:", passenger_coords)

    if driver_coords:
        driver_pin = create_driver_pin(
            "d1", driver_coords["lat"], driver_coords["lng"], name="Alice"
        )
        print("Driver pin:", driver_pin)
        print("Reverse:", reverse_geocode(driver_coords["lat"], driver_coords["lng"]))

    if passenger_coords:
        passenger_pin = create_passenger_pin(
            "p1", passenger_coords["lat"], passenger_coords["lng"], name="Bob"
        )
        print("Passenger pin:", passenger_pin)
        print("Reverse:", reverse_geocode(passenger_coords["lat"], passenger_coords["lng"]))

    if driver_coords:
        print("Map config:", get_map_config(driver_coords["lat"], driver_coords["lng"]))


# =============================================================================
# FRONTEND NOTES (React + Vite)
# =============================================================================
#
# These helpers are exposed via FastAPI endpoints. From the frontend you just
# call the backend over HTTP (e.g. with fetch or axios) and render the result.
#
# -----------------------------------------------------------------------------
# Function return shapes
# -----------------------------------------------------------------------------
#
# get_map_config(lat, lng, zoom=14)
#   -> { apiKey: str, center: { lat, lng }, zoom: int }
#   Use this to bootstrap the Google Map component (center + zoom + key).
#
# create_pin(user_id, role, lat, lng, label?)
# create_driver_pin(driver_id, lat, lng, name?)
# create_passenger_pin(passenger_id, lat, lng, name?)
#   -> {
#        id: "driver-d1" | "passenger-p1",
#        role: "driver" | "passenger",
#        position: { lat, lng },
#        label: str,
#        color: "#FFFFFF" | "#000000"
#      }
#   Drop directly into a <Marker /> on the map.
#
# geocode_address(address)
#   -> { lat, lng }  or  null   (null = address not found)
#
# reverse_geocode(lat, lng)
#   -> "123 Main St, Hanover, NH, USA"  or  null
#
# -----------------------------------------------------------------------------
# Quick React + Vite usage
# -----------------------------------------------------------------------------
#
#   // 1. Fetch map config on mount
#   const [config, setConfig] = useState(null);
#   useEffect(() => {
#     fetch("/api/map/config?lat=43.7044&lng=-72.2887")
#       .then(r => r.json())
#       .then(setConfig);
#   }, []);
#
#   // 2. Fetch pins for drivers + passengers
#   const [pins, setPins] = useState([]);
#   useEffect(() => {
#     fetch("/api/map/pins").then(r => r.json()).then(setPins);
#   }, []);
#
#   // 3. Render with @vis.gl/react-google-maps (or @react-google-maps/api)
#   return (
#     <APIProvider apiKey={config.apiKey}>
#       <Map defaultCenter={config.center} defaultZoom={config.zoom}>
#         {pins.map(p => (
#           <Marker key={p.id} position={p.position} label={p.label} />
#         ))}
#       </Map>
#     </APIProvider>
#   );
#
# Note: never hardcode the API key in the frontend — always read it from the
# backend response (get_map_config) so rotation stays server-side.
