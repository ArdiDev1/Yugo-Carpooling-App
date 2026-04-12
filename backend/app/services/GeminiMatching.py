"""
GeminiMatching — AI-powered feed ranking service for Yugo.

Uses Google Gemini to semantically compare ride posts for smarter matching:
  - "BOS Logan" ↔ "Boston Airport" → high similarity
  - "grocery run" ↔ "shopping trip" → recognized as same intent
  - "Dartmouth campus" ↔ "Hanover NH" → understood as same area

Flow:
  1. If the user has NO active posts → random shuffle (discovery mode).
  2. If the user HAS active posts → ask Gemini to score each candidate
     against the user's posts, then sort by score descending.
  3. If Gemini is unavailable → fall back to rule-based scoring.
"""

import json
import logging
import os
import random
import re
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Union

import httpx

from app.models.ride import RideOffer, RideRequest

logger = logging.getLogger(__name__)

Post = Union[RideOffer, RideRequest]

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


# ═════════════════════════════════════════════════════════════════════════════
# Gemini-powered semantic scoring
# ═════════════════════════════════════════════════════════════════════════════

def _post_summary(p: Post) -> dict:
    """Compact dict representation of a post for the Gemini prompt."""
    d = {
        "id": p.id,
        "from": p.from_location,
        "to": p.to_location,
        "date": p.date.isoformat() if p.date else None,
        "time": p.time,
        "flexible": p.flexible,
        "purpose": p.purpose,
        "school": getattr(p, "school", None) or "",
    }
    if isinstance(p, RideOffer):
        d["seatsLeft"] = p.seats_total - p.seats_taken
    return d


def _build_prompt(my_posts: List[Post], candidates: List[Post], user_school: str) -> str:
    my_summaries = [_post_summary(p) for p in my_posts]
    candidate_summaries = [_post_summary(p) for p in candidates]

    return f"""You are a ride-matching engine for a college carpooling app.

A student from "{user_school}" has these active ride posts:
{json.dumps(my_summaries, indent=2)}

Score each candidate ride below from 0 to 100 based on how well it matches the student's posts.
Consider:
- Location similarity (semantic — "BOS Logan" = "Boston Airport", "Dartmouth" = "Hanover NH")
- Date match (same day = high, within 2 days = medium, further = low)
- Time compatibility (both flexible = good, times within 2h = good)
- Purpose alignment (same category or semantically similar)
- Same school/college area = bonus
- Seats available = bonus for offers

Candidates:
{json.dumps(candidate_summaries, indent=2)}

Return ONLY a JSON array of objects with "id" and "score" (0-100), sorted by score descending.
Example: [{{"id": "abc", "score": 92}}, {{"id": "def", "score": 45}}]
No explanation, no markdown, just the JSON array."""


def _call_gemini(prompt: str) -> Optional[List[dict]]:
    """Call Gemini API and parse the JSON response."""
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set, falling back to rule-based scoring")
        return None

    try:
        resp = httpx.post(
            GEMINI_URL,
            params={"key": GEMINI_API_KEY},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 2048,
                },
            },
            timeout=15.0,
        )
        resp.raise_for_status()
        data = resp.json()

        text = data["candidates"][0]["content"]["parts"][0]["text"]
        # Strip markdown fences if Gemini wraps the response
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)

        scores = json.loads(text)
        if isinstance(scores, list) and all("id" in s and "score" in s for s in scores):
            return scores

        logger.warning("Gemini returned unexpected format: %s", text[:200])
        return None

    except httpx.TimeoutException:
        logger.warning("Gemini API timed out, falling back to rule-based scoring")
        return None
    except Exception as e:
        logger.warning("Gemini API error: %s, falling back to rule-based scoring", e)
        return None


def _gemini_rank(
    candidates: List[Post],
    my_posts: List[Post],
    user_school: str,
) -> Optional[List[Post]]:
    """Use Gemini to rank candidates. Returns None if Gemini fails."""
    if len(candidates) > 50:
        # Limit batch size to keep prompt reasonable
        candidates_to_score = candidates[:50]
        remainder = candidates[50:]
    else:
        candidates_to_score = candidates
        remainder = []

    prompt = _build_prompt(my_posts, candidates_to_score, user_school)
    scores = _call_gemini(prompt)

    if scores is None:
        return None

    post_map = {c.id: c for c in candidates_to_score}

    ranked = []
    for s in sorted(scores, key=lambda x: x["score"], reverse=True):
        post = post_map.get(s["id"])
        if post:
            ranked.append(post)

    # Add any candidates Gemini didn't return (shouldn't happen, but safety)
    scored_ids = {s["id"] for s in scores}
    for c in candidates_to_score:
        if c.id not in scored_ids:
            ranked.append(c)

    # Append remainder (unscored, shuffled)
    random.shuffle(remainder)
    ranked.extend(remainder)

    return ranked


# ═════════════════════════════════════════════════════════════════════════════
# Rule-based fallback scoring (used when Gemini is unavailable)
# ═════════════════════════════════════════════════════════════════════════════

W_FROM_EXACT    = 40
W_FROM_PARTIAL  = 20
W_TO_EXACT      = 40
W_TO_PARTIAL    = 20
W_DATE          = 30
W_SCHOOL        = 20
W_PURPOSE       = 15
W_TIME          = 15
W_GENDER_PREF   = 10
W_RECENCY       = 5
W_SEATS         = 5


def _normalize(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    return re.sub(r"\s+", " ", text)


def _tokenize(text: str) -> set:
    return set(_normalize(text).split())


def _location_score(a: str, b: str, exact_w: int, partial_w: int) -> int:
    na, nb = _normalize(a), _normalize(b)
    if na == nb:
        return exact_w
    ta, tb = _tokenize(a), _tokenize(b)
    if not ta or not tb:
        return 0
    overlap = len(ta & tb)
    smaller = min(len(ta), len(tb))
    if overlap / smaller >= 0.5:
        return partial_w
    return 0


def _parse_time(t: str | None) -> int | None:
    if not t:
        return None
    try:
        parts = t.split(":")
        return int(parts[0]) * 60 + int(parts[1])
    except (ValueError, IndexError):
        return None


def _time_compatible(candidate: Post, my_post: Post) -> bool:
    if candidate.flexible and my_post.flexible:
        return True
    ct = _parse_time(candidate.time)
    mt = _parse_time(my_post.time)
    if ct is None or mt is None:
        return candidate.flexible or my_post.flexible
    return abs(ct - mt) <= 120


def _rule_score(candidate: Post, my_post: Post, user_school: str) -> int:
    s = 0
    s += _location_score(candidate.from_location, my_post.from_location, W_FROM_EXACT, W_FROM_PARTIAL)
    s += _location_score(candidate.to_location, my_post.to_location, W_TO_EXACT, W_TO_PARTIAL)

    if candidate.date == my_post.date:
        s += W_DATE

    candidate_school = getattr(candidate, "school", None) or ""
    if user_school and _normalize(candidate_school) == _normalize(user_school):
        s += W_SCHOOL

    if candidate.purpose == my_post.purpose:
        s += W_PURPOSE

    if _time_compatible(candidate, my_post):
        s += W_TIME

    if candidate.prefers_women == my_post.prefers_women:
        s += W_GENDER_PREF

    now = datetime.now(timezone.utc)
    if hasattr(candidate, "created_at") and candidate.created_at:
        if now - candidate.created_at < timedelta(hours=24):
            s += W_RECENCY

    if isinstance(candidate, RideOffer):
        if candidate.seats_total - candidate.seats_taken > 0:
            s += W_SEATS

    return s


def _best_rule_score(candidate: Post, my_posts: List[Post], user_school: str) -> int:
    return max(_rule_score(candidate, mp, user_school) for mp in my_posts)


def _fallback_rank(
    candidates: List[Post],
    my_posts: List[Post],
    user_school: str,
) -> List[Post]:
    scored = [
        (_best_rule_score(c, my_posts, user_school), random.random(), c)
        for c in candidates
    ]
    scored.sort(key=lambda x: (-x[0], x[1]))
    return [c for _, _, c in scored]


# ═════════════════════════════════════════════════════════════════════════════
# Public API
# ═════════════════════════════════════════════════════════════════════════════

def rank_feed(
    candidates: List[Post],
    my_posts: List[Post],
    current_user,
) -> List[Post]:
    """
    Rank candidate posts for the user's feed.

    No active posts  → random shuffle (discovery mode).
    Has active posts → Gemini semantic ranking, with rule-based fallback.
    """
    if not candidates:
        return []

    if not my_posts:
        shuffled = list(candidates)
        random.shuffle(shuffled)
        return shuffled

    user_school = getattr(current_user, "school", "") or ""

    # Try Gemini first
    result = _gemini_rank(candidates, my_posts, user_school)
    if result is not None:
        logger.info("Feed ranked by Gemini (%d candidates)", len(result))
        return result

    # Fallback to rule-based
    logger.info("Feed ranked by rule-based fallback (%d candidates)", len(candidates))
    return _fallback_rank(candidates, my_posts, user_school)
