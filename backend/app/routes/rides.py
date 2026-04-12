from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from app.models.ride import RideOffer, RideRequest, PostCreate
from app.auth.deps import get_current_user
from app.db.mongo import rides_collection, users_collection
from app.services.GeminiMatching import rank_feed

router = APIRouter()


def _ride_from_doc(doc: dict):
    data = {**doc, "id": doc.pop("_id")}
    # Ensure date is an ISO string for Pydantic
    d = data.get("date")
    if hasattr(d, "isoformat"):
        data["date"] = d.isoformat()
    if data.get("type") == "offer":
        return RideOffer(**data)
    return RideRequest(**data)


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


async def _enrich_with_authors(posts, current_user_id: str = None):
    """Attach author info to each post dict."""
    if not posts:
        return []

    # Accept either Pydantic models or dicts
    def get_author_id(p):
        return p.author_id if hasattr(p, "author_id") else p.get("author_id", "")

    author_ids = list({get_author_id(p) for p in posts})
    user_docs = await users_collection().find(
        {"_id": {"$in": author_ids}},
    ).to_list(len(author_ids))
    authors_map = {d["_id"]: d for d in user_docs}

    result = []
    for p in posts:
        if hasattr(p, "model_dump"):
            post_dict = p.model_dump(by_alias=True, mode="json")
        else:
            post_dict = {k: v for k, v in p.items()}
            post_dict["id"] = post_dict.pop("_id", post_dict.get("id"))

        aid = get_author_id(p)
        author_doc = authors_map.get(aid, {})
        post_dict["author"] = _doc_to_mini_author(author_doc) if author_doc else {
            "id": aid, "name": "Unknown", "username": "user", "school": "", "avatarUrl": None, "rating": 0,
        }

        # Like info
        liked_by = p.get("liked_by", []) if isinstance(p, dict) else []
        if current_user_id and liked_by:
            post_dict["isLikedByMe"] = current_user_id in liked_by
            post_dict["likes"] = len(liked_by)

        result.append(post_dict)

    return result


@router.get(
    "/feed",
    summary="Get For You feed",
    description="Returns open posts ranked by relevance. "
                "If the user has active requests, offers are sorted by best match. "
                "Otherwise, a random selection is shown.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def get_feed(current_user=Depends(get_current_user)):
    opposite = "offer" if current_user.role == "passenger" else "request"

    docs = await rides_collection().find(
        {"status": "open", "type": opposite}
    ).to_list(200)

    posts = [_ride_from_doc(d) for d in docs]

    # Get user's own active requests/offers to match against
    my_type = "request" if current_user.role == "passenger" else "offer"
    my_docs = await rides_collection().find(
        {"author_id": current_user.id, "status": "open", "type": my_type}
    ).to_list(50)
    my_posts = [_ride_from_doc(d) for d in my_docs]

    ranked = rank_feed(posts, my_posts, current_user)
    return await _enrich_with_authors(ranked, current_user.id)


@router.get(
    "/following",
    summary="Get Following feed",
    description="Returns open posts from users the current user follows.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def get_following_feed(current_user=Depends(get_current_user)):
    following = current_user.following or []
    if not following:
        return []

    docs = await rides_collection().find(
        {"author_id": {"$in": following}, "status": "open"}
    ).to_list(200)

    posts = [_ride_from_doc(d) for d in docs]
    return await _enrich_with_authors(posts, current_user.id)


@router.get(
    "/by/{user_id}",
    summary="Get posts by user",
    description="Returns all posts (open and closed) authored by a specific user.",
    responses={401: {"description": "Missing or invalid token"}},
)
async def get_posts_by_user(user_id: str, current_user=Depends(get_current_user)):
    docs = await rides_collection().find({"author_id": user_id}).to_list(None)
    posts = [_ride_from_doc(d) for d in docs]
    return await _enrich_with_authors(posts, current_user.id)


@router.get(
    "/{post_id}",
    summary="Get a post",
    description="Returns a single ride offer or request by its ID.",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "Post not found"}},
)
async def get_post(post_id: str, current_user=Depends(get_current_user)):
    doc = await rides_collection().find_one({"_id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    post = _ride_from_doc(doc)
    enriched = await _enrich_with_authors([post], current_user.id)
    return enriched[0]


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

    body_data = body.model_dump(by_alias=False)
    # BSON cannot encode datetime.date — store as ISO string
    if body_data.get("date") and hasattr(body_data["date"], "isoformat"):
        body_data["date"] = body_data["date"].isoformat()

    doc = {
        "_id": post_id,
        "author_id": current_user.id,
        "status": "open",
        "likes": 0,
        "comments": 0,
        "liked_by": [],
        "created_at": now,
        "school": current_user.school,
        **body_data,
    }

    if body.type == "offer":
        doc["seats_taken"] = 0

    await rides_collection().insert_one(doc)

    result_doc = await rides_collection().find_one({"_id": post_id})
    enriched = await _enrich_with_authors([_ride_from_doc(result_doc)], current_user.id)
    return enriched[0]


@router.patch(
    "/{post_id}",
    summary="Update a post",
    description="Partially update a post's fields. Only the post's author can edit it.",
    responses={
        401: {"description": "Missing or invalid token"},
        403: {"description": "Not the post author"},
        404: {"description": "Post not found"},
    },
)
async def update_post(post_id: str, updates: dict, current_user=Depends(get_current_user)):
    doc = await rides_collection().find_one({"_id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    if doc["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    allowed = {"status", "content", "from_location", "to_location", "date", "time", "flexible", "prefers_women"}
    clean = {k: v for k, v in updates.items() if k in allowed}

    await rides_collection().update_one({"_id": post_id}, {"$set": clean})
    updated = await rides_collection().find_one({"_id": post_id})
    enriched = await _enrich_with_authors([_ride_from_doc(updated)], current_user.id)
    return enriched[0]


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
    doc = await rides_collection().find_one({"_id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    if doc["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    await rides_collection().delete_one({"_id": post_id})
    return {"ok": True}


@router.post(
    "/{post_id}/like",
    summary="Like a post",
    description="Adds the current user to the post's liked_by set (idempotent).",
    responses={401: {"description": "Missing or invalid token"}, 404: {"description": "Post not found"}},
)
async def like_post(post_id: str, current_user=Depends(get_current_user)):
    doc = await rides_collection().find_one({"_id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    if current_user.id not in doc.get("liked_by", []):
        await rides_collection().update_one(
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
    doc = await rides_collection().find_one({"_id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    if current_user.id in doc.get("liked_by", []):
        await rides_collection().update_one(
            {"_id": post_id},
            {"$pull": {"liked_by": current_user.id}, "$inc": {"likes": -1}},
        )
    return {"ok": True}
