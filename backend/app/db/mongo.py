import os
from typing import Optional

from bson.codec_options import CodecOptions
from datetime import timezone
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

MONGODB_URI = os.environ.get("MONGODB_URI", "")
MONGODB_DB = os.environ.get("MONGODB_DB", "yugo")

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongo() -> None:
    global _client, _db
    if not MONGODB_URI:
        raise RuntimeError("MONGODB_URI must be set in .env")

    _client = AsyncIOMotorClient(MONGODB_URI, tz_aware=True, tzinfo=timezone.utc)
    _db = _client.get_database(
        MONGODB_DB,
        codec_options=CodecOptions(tz_aware=True, tzinfo=timezone.utc),
    )
    await _client.admin.command("ping")
    await _ensure_indexes()


async def close_mongo_connection() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None


def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("Mongo not initialized. Did startup run?")
    return _db


def users_collection():
    return get_db()["users"]


def posts_collection():
    return get_db()["posts"]


def verification_codes_collection():
    return get_db()["verification_codes"]


def verification_tokens_collection():
    return get_db()["verification_tokens"]


def rides_collection():
    return get_db()["rides"]


def rooms_collection():
    return get_db()["rooms"]


def messages_collection():
    return get_db()["messages"]


async def _ensure_indexes() -> None:
    users = users_collection()
    await users.create_index([("email", 1), ("role", 1)], unique=True)
    await users.create_index("school")

    posts = posts_collection()
    await posts.create_index("author_id")
    await posts.create_index([("status", 1), ("type", 1)])
    await posts.create_index([("author_id", 1), ("status", 1)])

    codes = verification_codes_collection()
    await codes.create_index("email", unique=True)
    await codes.create_index("expires_at", expireAfterSeconds=0)

    tokens = verification_tokens_collection()
    await tokens.create_index("token", unique=True)
    await tokens.create_index("expires_at", expireAfterSeconds=0)

    rides = rides_collection()
    await rides.create_index("author_id")
    await rides.create_index("status")
    await rides.create_index("type")
    await rides.create_index("date")
    await rides.create_index("school")

    rooms = rooms_collection()
    await rooms.create_index("participants")
    await rooms.create_index("post_id")
    await rooms.create_index("last_message_at")
    await rooms.create_index("expires_at", expireAfterSeconds=0)  # TTL auto-delete

    msgs = messages_collection()
    await msgs.create_index("room_id")
    await msgs.create_index([("room_id", 1), ("sent_at", 1)])
