# map.py
import os

GOOGLE_MAPS_API_KEY = os.environ["GOOGLE_MAPS_API_KEY"]

def get_map_config(lat: float, lng: float, zoom: int = 14):
    return {
        "apiKey": GOOGLE_MAPS_API_KEY,
        "center": {"lat": lat, "lng": lng},
        "zoom": zoom,
    }