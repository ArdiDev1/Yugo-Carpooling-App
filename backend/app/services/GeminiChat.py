"""
GeminiChat — generates the GasBot welcome message for a new ride chat room.

Called once when a room is created. Returns a friendly, clear explanation
of the gas cost split tailored to the specific ride.
"""

import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


async def generate_gasbot_message(
    from_location: str,
    to_location: str,
    gas_data: Optional[dict],
    driver_name: str,
    passenger_name: str,
    ride_date: str,
) -> str:
    """
    Ask Gemini to write a friendly GasBot intro message for the chat room.
    Falls back to a plain template if Gemini is unavailable.
    """
    if not gas_data:
        return (
            f"👋 Hey {passenger_name} and {driver_name}! This is your ride chat for "
            f"**{from_location} → {to_location}** on {ride_date}.\n\n"
            "Gas cost couldn't be calculated automatically — please agree on a contribution directly. "
            "Safe travels! 🚗"
        )

    prompt = f"""You are GasBot, a friendly assistant in a college carpooling app called Yugo.

A driver ({driver_name}) and a passenger ({passenger_name}) just matched for a ride:
- Route: {from_location} → {to_location}
- Date: {ride_date}
- Distance: {gas_data.get("distanceMiles")} miles
- Total gas cost: ${gas_data.get("totalGasCost")}
- Passenger pays: ${gas_data.get("costPerPassenger")} (60% of gas split evenly)
- Driver covers: ${gas_data.get("driverCost")} (40% of gas)
- Based on: $3.50/gal, 27 MPG average

Write a short, warm welcome message (3-5 sentences) for their group chat.
- Greet both by name
- Clearly explain the gas split in plain English
- Mention this chat will be deleted 2 hours after the pickup date
- Keep it friendly and casual, like a helpful app assistant
- Do NOT use markdown headers or bullet points — write as flowing sentences
- End with an encouraging send-off"""

    if not GEMINI_API_KEY:
        return _fallback_message(from_location, to_location, ride_date, gas_data, driver_name, passenger_name)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                GEMINI_URL,
                params={"key": GEMINI_API_KEY},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.7, "maxOutputTokens": 300},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip()

    except Exception as e:
        logger.warning("GeminiChat error: %s, using fallback", e)
        return _fallback_message(from_location, to_location, ride_date, gas_data, driver_name, passenger_name)


def _fallback_message(from_loc, to_loc, ride_date, gas_data, driver_name, passenger_name) -> str:
    return (
        f"👋 Hey {passenger_name} and {driver_name}! Welcome to your Yugo ride chat. "
        f"You're matched for the trip from **{from_loc}** to **{to_loc}** on {ride_date}. "
        f"Based on {gas_data.get('distanceMiles')} miles at $3.50/gal (27 MPG avg), "
        f"the total gas cost is **${gas_data.get('totalGasCost')}**. "
        f"{passenger_name}, your share is **${gas_data.get('costPerPassenger')}** "
        f"and {driver_name} covers **${gas_data.get('driverCost')}** — a 60/40 split. "
        f"This chat will be removed 2 hours after your pickup. Safe travels! 🚗"
    )
