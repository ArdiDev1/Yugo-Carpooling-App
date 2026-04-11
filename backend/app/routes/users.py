from fastapi import APIRouter, HTTPException, Depends
from typing import Union

from app.models.passenger import Passenger
from app.models.driver import Driver
from app.auth.deps import get_current_user
from app.db.mock_db import passengers_db, drivers_db

router = APIRouter()


def _find_user(user_id: str) -> Union[Passenger, Driver, None]:
    return next((u for u in passengers_db + drivers_db if u.id == user_id), None)


def _get_db(user: Union[Passenger, Driver]):
    return drivers_db if user.role == "driver" else passengers_db


@router.get(
    "/{user_id}",
    summary="Get a user profile",
    description="Returns the public profile of any registered user by their ID.",
    responses={404: {"description": "User not found"}},
)
def get_user(user_id: str):
    user = _find_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch(
    "/me",
    summary="Update my profile",
    description="Partially update the authenticated user's profile fields (name, bio, avatar, etc.).",
    responses={401: {"description": "Missing or invalid token"}},
)
def update_me(updates: dict, current_user=Depends(get_current_user)):
    db = _get_db(current_user)
    idx = next(i for i, u in enumerate(db) if u.id == current_user.id)
    db[idx] = current_user.model_copy(update=updates)
    return db[idx]


@router.delete(
    "/me",
    summary="Delete my account",
    description="Permanently removes the authenticated user's account.",
    responses={401: {"description": "Missing or invalid token"}},
)
def delete_me(current_user=Depends(get_current_user)):
    db = _get_db(current_user)
    db[:] = [u for u in db if u.id != current_user.id]
    return {"ok": True}


@router.post(
    "/{user_id}/follow",
    summary="Follow a user",
    description="Follow another user. Updates both the follower's `following` list and the target's `followers` list.",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "User not found"}},
)
def follow_user(user_id: str, current_user=Depends(get_current_user)):
    target = _find_user(user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    current_db = _get_db(current_user)
    target_db = _get_db(target)
    ci = next(i for i, u in enumerate(current_db) if u.id == current_user.id)
    ti = next(i for i, u in enumerate(target_db) if u.id == user_id)

    if user_id not in current_user.following:
        current_db[ci] = current_user.model_copy(update={"following": current_user.following + [user_id]})
    if current_user.id not in target.followers:
        target_db[ti] = target.model_copy(update={"followers": target.followers + [current_user.id]})

    return {"ok": True}


@router.delete(
    "/{user_id}/follow",
    summary="Unfollow a user",
    description="Remove a user from your following list.",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "User not found"}},
)
def unfollow_user(user_id: str, current_user=Depends(get_current_user)):
    target = _find_user(user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    current_db = _get_db(current_user)
    target_db = _get_db(target)
    ci = next(i for i, u in enumerate(current_db) if u.id == current_user.id)
    ti = next(i for i, u in enumerate(target_db) if u.id == user_id)

    current_db[ci] = current_user.model_copy(update={"following": [x for x in current_user.following if x != user_id]})
    target_db[ti] = target.model_copy(update={"followers": [x for x in target.followers if x != current_user.id]})

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
def rate_user(user_id: str, body: dict, current_user=Depends(get_current_user)):
    rating = float(body.get("rating", 0))
    if not 1.0 <= rating <= 5.0:
        raise HTTPException(status_code=422, detail="Rating must be between 1 and 5")
    user = _find_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db = _get_db(user)
    idx = next(i for i, u in enumerate(db) if u.id == user_id)
    new_count = user.rating_count + 1
    new_rating = round(((user.rating * user.rating_count) + rating) / new_count, 2)
    db[idx] = user.model_copy(update={"rating": new_rating, "rating_count": new_count})
    return db[idx]
