"""Seed the Mongo database from JSON files.

Run from inside the backend container:
    docker compose exec backend python seed_db.py
    docker compose exec backend python seed_db.py --drop       # wipe first
    docker compose exec backend python seed_db.py --only users # only one file
"""
import argparse
import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import Any

from app.db.mongo import (
    connect_to_mongo,
    close_mongo_connection,
    get_db,
)

SEED_DIR = Path(__file__).parent / "seed"

SEED_FILES = {
    "users": SEED_DIR / "users_seed.json",
    "rides": SEED_DIR / "rides_seed.json",
}


def _convert_bson_types(value: Any) -> Any:
    """Recursively convert Atlas extended-JSON ($date, $oid) into Python types."""
    if isinstance(value, dict):
        if set(value.keys()) == {"$date"}:
            return datetime.fromisoformat(value["$date"].replace("Z", "+00:00"))
        if set(value.keys()) == {"$oid"}:
            from bson import ObjectId
            return ObjectId(value["$oid"])
        return {k: _convert_bson_types(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_convert_bson_types(v) for v in value]
    return value


def _load_seed(path: Path) -> list[dict]:
    with path.open() as f:
        raw = json.load(f)
    return [_convert_bson_types(doc) for doc in raw]


async def seed_collection(name: str, path: Path, drop: bool) -> None:
    if not path.exists():
        print(f"⚠️  {name}: {path} not found, skipping")
        return

    docs = _load_seed(path)
    coll = get_db()[name]

    if drop:
        deleted = await coll.delete_many({})
        print(f"🗑️  {name}: cleared {deleted.deleted_count} existing docs")

    inserted = 0
    skipped = 0
    for doc in docs:
        existing = await coll.find_one({"_id": doc["_id"]})
        if existing:
            skipped += 1
            continue
        await coll.insert_one(doc)
        inserted += 1

    print(f"✅ {name}: inserted {inserted}, skipped {skipped} (already existed)")


async def main(drop: bool, only: str | None) -> None:
    await connect_to_mongo()
    try:
        targets = {only: SEED_FILES[only]} if only else SEED_FILES
        for name, path in targets.items():
            await seed_collection(name, path, drop)
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the Yugo Mongo database.")
    parser.add_argument(
        "--drop",
        action="store_true",
        help="Delete existing docs in each collection before inserting",
    )
    parser.add_argument(
        "--only",
        choices=list(SEED_FILES.keys()),
        help="Seed only one collection",
    )
    args = parser.parse_args()
    asyncio.run(main(drop=args.drop, only=args.only))
