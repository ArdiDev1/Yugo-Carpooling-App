from fastapi import APIRouter, HTTPException, Depends
from datetime import date
from typing import Union

from app.auth.deps import get_current_user
from app.db.mongo import users_collection
from app.models.driver import Driver
from app.models.passenger import Passenger

router = APIRouter()


def _doc_to_user(doc: dict) -> Union[Passenger, Driver]:
    data = {k: v for k, v in doc.items() if k != "password_hash"}
    data["id"] = data.pop("_id")
    if isinstance(data.get("dob"), str):
        data["dob"] = date.fromisoformat(data["dob"])
    if data.get("role") == "driver":
        exp = data.get("license_expiration")
        if isinstance(exp, str):
            data["license_expiration"] = date.fromisoformat(exp)
        return Driver(**data)
    return Passenger(**data)


def _normalize_updates(updates: dict) -> dict:
    """Convert camelCase update keys to snake_case for MongoDB storage."""
    from pydantic.alias_generators import to_snake
    result = {}
    for k, v in updates.items():
        snake_key = to_snake(k)
        if isinstance(v, dict):
            result[snake_key] = {to_snake(vk): vv for vk, vv in v.items()}
        else:
            result[snake_key] = v
    return result


@router.get(
    "/{user_id}",
    summary="Get a user profile",
    description="Returns the public profile of any registered user by their ID.",
    responses={404: {"description": "User not found"}},
)
async def get_user(user_id: str):
    doc = await users_collection().find_one({"_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return _doc_to_user(doc)


@router.patch(
    "/me",
    summary="Update my profile",
    description="Partially update the authenticated user's profile fields (name, bio, avatar, vehicle, etc.).",
    responses={401: {"description": "Missing or invalid token"}},
)
async def update_me(updates: dict, current_user=Depends(get_current_user)):
    normalized = _normalize_updates(updates)
    await users_collection().update_one(
        {"_id": current_user.id},
        {"$set": normalized},
    )
    updated_doc = await users_collection().find_one({"_id": current_user.id})
    return _doc_to_user(updated_doc)


@router.delete(
    "/me",
    summary="Delete my account",
    description="Permanently removes the authenticated user's account.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def delete_me(current_user=Depends(get_current_user)):
    await users_collection().delete_one({"_id": current_user.id})
    return {"ok": True}


@router.post(
    "/{user_id}/follow",
    summary="Follow a user",
    description="Follow another user. Updates both the follower's `following` list and the target's `followers` list.",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "User not found"}},
)
async def follow_user(user_id: str, current_user=Depends(get_current_user)):
    target_doc = await users_collection().find_one({"_id": user_id})
    if not target_doc:
        raise HTTPException(status_code=404, detail="User not found")

    await users_collection().update_one(
        {"_id": current_user.id},
        {"$addToSet": {"following": user_id}},
    )
    await users_collection().update_one(
        {"_id": user_id},
        {"$addToSet": {"followers": current_user.id}},
    )
    return {"ok": True}


@router.delete(
    "/{user_id}/follow",
    summary="Unfollow a user",
    description="Remove a user from your following list.",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "User not found"}},
)
async def unfollow_user(user_id: str, current_user=Depends(get_current_user)):
    target_doc = await users_collection().find_one({"_id": user_id})
    if not target_doc:
        raise HTTPException(status_code=404, detail="User not found")

    await users_collection().update_one(
        {"_id": current_user.id},
        {"$pull": {"following": user_id}},
    )
    await users_collection().update_one(
        {"_id": user_id},
        {"$pull": {"followers": current_user.id}},
    )
    return {"ok": True}


@router.post(
    "/{user_id}/rate",
    summary="Rate a user",
    description="Submit a rating (1.0–5.0) for a user after a completed ride. "
                "The new rating is averaged into their existing score.",
    responses={
        401: {"description": "Missing or invalid token"},
        404: {"description": "User not found"},
        422: {"description": "Rating out of range"},
    },
)
async def rate_user(user_id: str, body: dict, current_user=Depends(get_current_user)):
    rating = float(body.get("rating", 0))
    if not 1.0 <= rating <= 5.0:
        raise HTTPException(status_code=422, detail="Rating must be between 1 and 5")

    doc = await users_collection().find_one({"_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")

    current_rating = doc.get("rating", 0.0)
    current_count = doc.get("rating_count", 0)
    new_count = current_count + 1
    new_rating = round(((current_rating * current_count) + rating) / new_count, 2)

    await users_collection().update_one(
        {"_id": user_id},
        {"$set": {"rating": new_rating, "rating_count": new_count}},
    )
    return {"ok": True, "rating": new_rating, "ratingCount": new_count}
