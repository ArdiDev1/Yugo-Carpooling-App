from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from app.models.ride import RideOffer, RideRequest, PostCreate
from app.auth.deps import get_current_user
from app.db.mongo import posts_collection, get_db

router = APIRouter()


def _users_col():
    return get_db()["users"]


def _doc_to_mini_author(doc: dict) -> dict:
    """Minimal author profile embedded in post responses."""
    return {
        "id":          doc.get("_id") or doc.get("id", ""),
        "username":    doc.get("username", ""),
        "name":        doc.get("name", ""),
        "avatarUrl":   doc.get("avatar_url"),
        "school":      doc.get("school", ""),
        "rating":      doc.get("rating", 0.0),
        "ratingCount": doc.get("rating_count", 0),
        "role":        doc.get("role", ""),
    }


def _doc_to_post(doc: dict, current_user_id: str = None, author_doc: dict = None) -> dict:
    """Convert a MongoDB post doc to a camelCase response dict."""
    data = {k: v for k, v in doc.items() if k != "liked_by"}
    data["id"] = data.pop("_id")

    # Ensure date is an ISO string for Pydantic
    d = data.get("date")
    if hasattr(d, "isoformat"):
        data["date"] = d.isoformat()

    try:
        if data.get("type") == "offer":
            post_obj = RideOffer(**data)
        else:
            post_obj = RideRequest(**data)
        post_dict = post_obj.model_dump(by_alias=True, mode="json")
    except Exception:
        post_dict = data

    liked_by = doc.get("liked_by", [])
    post_dict["isLikedByMe"] = (current_user_id in liked_by) if current_user_id else False
    post_dict["likes"] = len(liked_by) if liked_by else data.get("likes", 0)

    if author_doc:
        post_dict["author"] = _doc_to_mini_author(author_doc)

    return post_dict


async def _enrich_posts(docs: list, current_user_id: str) -> list:
    """Batch-fetch author docs and embed them in each post."""
    if not docs:
        return []
    author_ids = list({doc["author_id"] for doc in docs})
    author_cursor = _users_col().find({"_id": {"$in": author_ids}})
    author_docs = await author_cursor.to_list(None)
    author_map = {d["_id"]: d for d in author_docs}
    return [
        _doc_to_post(doc, current_user_id, author_map.get(doc["author_id"]))
        for doc in docs
    ]


@router.get(
    "/feed",
    summary="Get For You feed",
    description="Returns open posts from users with the opposite role — passengers see driver offers, drivers see passenger requests.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def get_feed(current_user=Depends(get_current_user)):
    opposite = "offer" if current_user.role == "passenger" else "request"
    docs = await posts_collection().find({"status": "open", "type": opposite}).to_list(None)
    return await _enrich_posts(docs, current_user.id)


@router.get(
    "/following",
    summary="Get Following feed",
    description="Returns open posts from users the current user follows.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def get_following_feed(current_user=Depends(get_current_user)):
    docs = await posts_collection().find({
        "author_id": {"$in": current_user.following},
        "status": "open",
    }).to_list(None)
    return await _enrich_posts(docs, current_user.id)


@router.get(
    "/by/{user_id}",
    summary="Get posts by user",
    description="Returns all posts (open and closed) authored by a specific user.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def get_posts_by_user(user_id: str, current_user=Depends(get_current_user)):
    docs = await posts_collection().find({"author_id": user_id}).to_list(None)
    return [_doc_to_post(doc, current_user.id) for doc in docs]


@router.get(
    "/{post_id}",
    summary="Get a post",
    description="Returns a single ride offer or request by its ID.",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "Post not found"}},
)
async def get_post(post_id: str, current_user=Depends(get_current_user)):
    doc = await posts_collection().find_one({"_id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    author_doc = await _users_col().find_one({"_id": doc["author_id"]})
    return _doc_to_post(doc, current_user.id, author_doc)


@router.post(
    "",
    summary="Create a post",
    description="Publish a new ride offer (driver) or ride request (passenger). "
                "Set `type` to `offer` or `request` — the correct schema is applied automatically.",
    status_code=201,
    responses={401: {"description": "Missing or invalid token"}},
)
async def create_post(body: PostCreate, current_user=Depends(get_current_user)):
    post_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    post_data = body.model_dump(by_alias=False)
    # Store date as ISO string
    if hasattr(post_data.get("date"), "isoformat"):
        post_data["date"] = post_data["date"].isoformat()

    doc = {
        "_id":       post_id,
        "author_id": current_user.id,
        "status":    "open",
        "likes":     0,
        "comments":  0,
        "liked_by":  [],
        "created_at": now,
        **post_data,
    }

    await posts_collection().insert_one(doc)
    author_doc = await _users_col().find_one({"_id": current_user.id})
    return _doc_to_post(doc, current_user.id, author_doc)


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
async def update_post(post_id: str, updates: dict, current_user=Depends(get_current_user)):
    doc = await posts_collection().find_one({"_id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    if doc["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    await posts_collection().update_one({"_id": post_id}, {"$set": updates})
    updated = await posts_collection().find_one({"_id": post_id})
    author_doc = await _users_col().find_one({"_id": current_user.id})
    return _doc_to_post(updated, current_user.id, author_doc)


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
async def delete_post(post_id: str, current_user=Depends(get_current_user)):
    doc = await posts_collection().find_one({"_id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    if doc["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await posts_collection().delete_one({"_id": post_id})
    return {"ok": True}


@router.post(
    "/{post_id}/like",
    summary="Like a post",
    description="Adds the current user to the post's liked_by set (idempotent).",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "Post not found"}},
)
async def like_post(post_id: str, current_user=Depends(get_current_user)):
    doc = await posts_collection().find_one({"_id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    if current_user.id not in doc.get("liked_by", []):
        await posts_collection().update_one(
            {"_id": post_id},
            {"$addToSet": {"liked_by": current_user.id}, "$inc": {"likes": 1}},
        )
    return {"ok": True}


@router.delete(
    "/{post_id}/like",
    summary="Unlike a post",
    description="Removes the current user from the post's liked_by set (idempotent).",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "Post not found"}},
)
async def unlike_post(post_id: str, current_user=Depends(get_current_user)):
    doc = await posts_collection().find_one({"_id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    if current_user.id in doc.get("liked_by", []):
        await posts_collection().update_one(
            {"_id": post_id},
            {"$pull": {"liked_by": current_user.id}, "$inc": {"likes": -1}},
        )
    return {"ok": True}
