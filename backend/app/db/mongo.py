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


def verification_codes_collection():
    return get_db()["verification_codes"]


def verification_tokens_collection():
    return get_db()["verification_tokens"]


async def _ensure_indexes() -> None:
    users = users_collection()
    await users.create_index("email", unique=True)
    await users.create_index("role")
    await users.create_index("school")

    codes = verification_codes_collection()
    await codes.create_index("email", unique=True)
    await codes.create_index("expires_at", expireAfterSeconds=0)

    tokens = verification_tokens_collection()
    await tokens.create_index("token", unique=True)
    await tokens.create_index("expires_at", expireAfterSeconds=0)
