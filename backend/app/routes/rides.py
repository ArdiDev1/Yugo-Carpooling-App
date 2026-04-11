from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from app.models.ride import RideOffer, RideRequest, PostCreate
from app.auth.deps import get_current_user
from app.db.mock_db import rides_db

router = APIRouter()


def _find_ride(post_id: str):
    return next((r for r in rides_db if r.id == post_id), None)


@router.get(
    "/feed",
    summary="Get For You feed",
    description="Returns open posts from users with the opposite role — passengers see driver offers, drivers see passenger requests.",
    responses={401: {"description": "Missing or invalid token"}},
)
def get_feed(current_user=Depends(get_current_user)):
    opposite = "offer" if current_user.role == "passenger" else "request"
    return [r for r in rides_db if r.status == "open" and r.type == opposite]


@router.get(
    "/following",
    summary="Get Following feed",
    description="Returns open posts from users the current user follows.",
    responses={401: {"description": "Missing or invalid token"}},
)
def get_following_feed(current_user=Depends(get_current_user)):
    return [r for r in rides_db if r.author_id in current_user.following and r.status == "open"]


@router.get(
    "/{post_id}",
    summary="Get a post",
    description="Returns a single ride offer or request by its ID.",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "Post not found"}},
)
def get_post(post_id: str, _=Depends(get_current_user)):
    ride = _find_ride(post_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Post not found")
    return ride


@router.post(
    "",
    summary="Create a post",
    description="Publish a new ride offer (driver) or ride request (passenger). "
                "Set `type` to `offer` or `request` — the correct schema is applied automatically.",
    status_code=201,
    responses={401: {"description": "Missing or invalid token"}},
)
def create_post(body: PostCreate, current_user=Depends(get_current_user)):
    post_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    if body.type == "offer":
        ride = RideOffer(id=post_id, author_id=current_user.id, created_at=now, **body.model_dump(by_alias=False))
    else:
        ride = RideRequest(id=post_id, author_id=current_user.id, created_at=now, **body.model_dump(by_alias=False))

    rides_db.append(ride)
    return ride


@router.patch(
    "/{post_id}",
    summary="Update a post",
    description="Partially update a post's fields. Only the post's author can edit it. "
                "Use `{\"status\": \"closed\"}` to close a ride.",
    responses={
        401: {"description": "Missing or invalid token"},
        403: {"description": "Not the post author"},
        404: {"description": "Post not found"},
    },
)
def update_post(post_id: str, updates: dict, current_user=Depends(get_current_user)):
    ride = _find_ride(post_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Post not found")
    if ride.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    idx = next(i for i, r in enumerate(rides_db) if r.id == post_id)
    rides_db[idx] = ride.model_copy(update=updates)
    return rides_db[idx]


@router.delete(
    "/{post_id}",
    summary="Delete a post",
    description="Permanently removes a post. Only the post's author can delete it.",
    responses={
        401: {"description": "Missing or invalid token"},
        403: {"description": "Not the post author"},
        404: {"description": "Post not found"},
    },
)
def delete_post(post_id: str, current_user=Depends(get_current_user)):
    ride = _find_ride(post_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Post not found")
    if ride.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    rides_db[:] = [r for r in rides_db if r.id != post_id]
    return {"ok": True}


@router.post(
    "/{post_id}/like",
    summary="Like a post",
    description="Increments the like count on a post.",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "Post not found"}},
)
def like_post(post_id: str, _=Depends(get_current_user)):
    ride = _find_ride(post_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Post not found")
    idx = next(i for i, r in enumerate(rides_db) if r.id == post_id)
    rides_db[idx] = ride.model_copy(update={"likes": ride.likes + 1})
    return {"ok": True}


@router.delete(
    "/{post_id}/like",
    summary="Unlike a post",
    description="Decrements the like count on a post (minimum 0).",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "Post not found"}},
)
def unlike_post(post_id: str, _=Depends(get_current_user)):
    ride = _find_ride(post_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Post not found")
    idx = next(i for i, r in enumerate(rides_db) if r.id == post_id)
    rides_db[idx] = ride.model_copy(update={"likes": max(0, ride.likes - 1)})
    return {"ok": True}
