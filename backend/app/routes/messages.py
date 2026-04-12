"""
Messages — real-time group chat for matched rides.

Flow:
  1. Passenger clicks "Interested" → confirmed → POST /messages/rooms (creates room)
  2. On creation, GasBot auto-posts a Gemini-generated gas breakdown message
  3. Both driver + passenger can send messages
  4. Room expires automatically 2 hours after the ride's pickup date (TTL index)
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth.deps import get_current_user
from app.db.mongo import messages_collection, rooms_collection, rides_collection, users_collection
from app.services.GasCost import calculate_gas_split, get_distance_miles
from app.services.GeminiChat import generate_gasbot_message

router = APIRouter()

PAGE_SIZE = 50


def _now():
    return datetime.now(timezone.utc)


# ─────────────────────────────────────────────────────────────────
# Request bodies
# ─────────────────────────────────────────────────────────────────

class CreateRoomBody(BaseModel):
    post_id: str      # the ride offer or request post
    passenger_id: str # the passenger who clicked Interested


class SendMessageBody(BaseModel):
    text: str


# ─────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────

def _room_doc_to_dict(doc: dict) -> dict:
    doc["id"] = doc.pop("_id")
    return doc


def _msg_doc_to_dict(doc: dict) -> dict:
    doc["id"] = doc.pop("_id")
    return doc


# ─────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────

@router.get(
    "/rooms",
    summary="List my chat rooms",
    description="Returns all active rooms where the current user is a participant.",
)
async def list_rooms(current_user=Depends(get_current_user)):
    cursor = rooms_collection().find(
        {"participants": current_user.id, "expires_at": {"$gt": _now()}}
    ).sort("last_message_at", -1)
    docs = await cursor.to_list(100)
    return [_room_doc_to_dict(d) for d in docs]


@router.post(
    "/rooms",
    summary="Create a chat room",
    description="Called when a passenger confirms interest in a ride. "
                "Creates a group chat between driver and passenger and posts the GasBot summary.",
    status_code=201,
)
async def create_room(body: CreateRoomBody, current_user=Depends(get_current_user)):
    # Load the post
    post_doc = await rides_collection().find_one({"_id": body.post_id})
    if not post_doc:
        raise HTTPException(status_code=404, detail="Post not found")

    driver_id    = post_doc["author_id"]
    passenger_id = body.passenger_id

    # Prevent duplicate rooms for the same post + passenger pair
    existing = await rooms_collection().find_one({
        "post_id": body.post_id,
        "participants": {"$all": [driver_id, passenger_id]},
    })
    if existing:
        return _room_doc_to_dict(existing)

    # Compute expiry: ride date + 2 hours
    ride_date_str = post_doc.get("date")
    if ride_date_str:
        try:
            from datetime import date
            ride_date = date.fromisoformat(str(ride_date_str)[:10])
            expires_at = datetime(ride_date.year, ride_date.month, ride_date.day,
                                  tzinfo=timezone.utc) + timedelta(hours=26)  # noon + 2h buffer
        except Exception:
            expires_at = _now() + timedelta(days=7)
    else:
        expires_at = _now() + timedelta(days=7)

    # Fetch driver + passenger names for room label
    driver_doc    = await users_collection().find_one({"_id": driver_id})
    passenger_doc = await users_collection().find_one({"_id": passenger_id})
    driver_name    = driver_doc.get("name", "Driver") if driver_doc else "Driver"
    passenger_name = passenger_doc.get("name", "Passenger") if passenger_doc else "Passenger"

    post_summary = f"{post_doc.get('from_location', '?')} → {post_doc.get('to_location', '?')}"

    room_id = str(uuid.uuid4())
    now = _now()

    room_doc = {
        "_id":             room_id,
        "post_id":         body.post_id,
        "participants":    [driver_id, passenger_id],
        "driver_id":       driver_id,
        "passenger_id":    passenger_id,
        "post_summary":    post_summary,
        "expires_at":      expires_at,
        "created_at":      now,
        "last_message_at": now,
        "unread_counts":   {driver_id: 0, passenger_id: 0},
        "names": {
            driver_id:    driver_name,
            passenger_id: passenger_name,
        },
    }
    await rooms_collection().insert_one(room_doc)

    # ── GasBot welcome message ──────────────────────────────────
    num_passengers = max(1, post_doc.get("seats_total", 1) - post_doc.get("seats_taken", 0))
    from_loc = post_doc.get("from_location", "")
    to_loc   = post_doc.get("to_location", "")

    gas_data  = post_doc.get("gas_cost")
    if not gas_data and from_loc and to_loc:
        distance = await get_distance_miles(from_loc, to_loc)
        if distance:
            gas_data = calculate_gas_split(distance, num_passengers)

    gasbot_text = await generate_gasbot_message(
        from_location=from_loc,
        to_location=to_loc,
        gas_data=gas_data,
        driver_name=driver_name,
        passenger_name=passenger_name,
        ride_date=post_doc.get("date", ""),
    )

    gasbot_msg = {
        "_id":       str(uuid.uuid4()),
        "room_id":   room_id,
        "sender_id": "gasbot",
        "text":      gasbot_text,
        "is_gasbot": True,
        "gas_data":  gas_data,
        "sent_at":   now,
    }
    await messages_collection().insert_one(gasbot_msg)

    return _room_doc_to_dict(room_doc)


@router.get(
    "/rooms/{room_id}",
    summary="Get messages in a room",
    description="Returns paginated messages for a room the user participates in.",
)
async def get_messages(room_id: str, page: int = 0, current_user=Depends(get_current_user)):
    room = await rooms_collection().find_one({"_id": room_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if current_user.id not in room["participants"]:
        raise HTTPException(status_code=403, detail="Not a participant")

    cursor = messages_collection().find(
        {"room_id": room_id}
    ).sort("sent_at", 1).skip(page * PAGE_SIZE).limit(PAGE_SIZE)

    docs = await cursor.to_list(PAGE_SIZE)

    # Mark as read
    await rooms_collection().update_one(
        {"_id": room_id},
        {"$set": {f"unread_counts.{current_user.id}": 0}},
    )

    return [_msg_doc_to_dict(d) for d in docs]


@router.post(
    "/rooms/{room_id}",
    summary="Send a message",
    description="Sends a text message in a room.",
    status_code=201,
)
async def send_message(room_id: str, body: SendMessageBody, current_user=Depends(get_current_user)):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    room = await rooms_collection().find_one({"_id": room_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if current_user.id not in room["participants"]:
        raise HTTPException(status_code=403, detail="Not a participant")
    if room["expires_at"] < _now():
        raise HTTPException(status_code=410, detail="This conversation has expired")

    msg_id = str(uuid.uuid4())
    now    = _now()
    msg_doc = {
        "_id":       msg_id,
        "room_id":   room_id,
        "sender_id": current_user.id,
        "text":      body.text.strip(),
        "is_gasbot": False,
        "gas_data":  None,
        "sent_at":   now,
    }
    await messages_collection().insert_one(msg_doc)

    # Update last_message_at + bump unread for the other participant
    other_ids = [p for p in room["participants"] if p != current_user.id]
    unread_inc = {f"unread_counts.{oid}": 1 for oid in other_ids}
    await rooms_collection().update_one(
        {"_id": room_id},
        {"$set": {"last_message_at": now}, "$inc": unread_inc},
    )

    return _msg_doc_to_dict(msg_doc)
