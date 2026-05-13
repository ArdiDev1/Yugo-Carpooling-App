# Yugo Backend — Weak Points for Mobile Reuse

Issues to fix before the backend can safely serve a React Native / mobile client alongside the web app.

---

## 1. Authentication is not production-ready

**File:** `app/auth/deps.py:31-33`, `app/routes/auth.py:52-53`

The token is `mock-token-{user_id}` — a plain string with the user ID in it. Anyone who knows a user ID can forge a valid token.

**What breaks on mobile:**
- Mobile apps store tokens on-device longer (persist across sessions). A predictable token is trivially stolen or guessed.
- No expiration, no refresh flow. The mobile app has no way to silently re-authenticate when a token goes stale.
- Logout (`POST /auth/logout`) does nothing server-side — the token stays valid forever.

**Fix:** Replace with signed JWTs (you already have `python-jose` in requirements.txt). Add short-lived access tokens + refresh tokens. Invalidate refresh tokens on logout.

---

## 2. `PATCH /users/me` accepts arbitrary fields

**File:** `app/routes/users.py:58-65`

```python
async def update_me(updates: dict, current_user=Depends(get_current_user)):
    normalized = _normalize_updates(updates)
    await users_collection().update_one({"_id": current_user.id}, {"$set": normalized})
```

The body is an untyped `dict`. Any key gets written to MongoDB after camelCase-to-snake conversion. A mobile client (or attacker) can send:

```json
{ "role": "driver", "emailVerified": true, "licenseVerified": true, "rating": 5.0 }
```

and it will be written directly.

**Fix:** Define a Pydantic model with only the allowed fields (name, bio, avatar_url, vehicle, phone, pronouns, etc.) and reject everything else.

---

## 3. `PATCH /posts/{post_id}` uses an allowlist but still takes raw `dict`

**File:** `app/routes/rides.py:232-242`

The route has a hardcoded allowlist of keys, but the input is `dict` not a Pydantic model. The keys are checked against snake_case names, but the client sends camelCase — so `fromLocation` won't match `from_location` and the update silently drops.

**Fix:** Use a Pydantic model (e.g. `PostUpdate`) with optional fields. This also gives you proper validation (e.g. `date` is actually a date, `status` is "open" or "closed").

---

## 4. Rate-limiting and abuse protection are missing everywhere

**Files:** All route files

No rate limiting on any endpoint. On mobile this matters more because:
- `POST /auth/signup` — bot can create unlimited accounts.
- `POST /auth/verify-email` — 4-digit code = 10,000 possibilities, brute-forceable in seconds.
- `POST /auth/login` — unlimited password attempts.
- `GET /posts/feed` — every call triggers a Gemini API request (costs money).
- `POST /map/geocode` — every call triggers a Google Maps API request (costs money).
- `POST /{post_id}/like` and `/interest` — can spam interactions.

**Fix:** Add a rate-limiting middleware (e.g. `slowapi`) with per-IP and per-user limits. At minimum, rate-limit auth endpoints and any route that calls a paid external API.

---

## 5. Verification code is weak (4-digit, no attempt limit)

**File:** `app/routes/auth.py:125`

```python
code = f"{random.randint(0, 9999):04d}"
```

- Only 10,000 possible codes.
- No limit on how many times `POST /verify-email` can be called — brute-force in seconds.
- Uses `random` (not `secrets`) — technically predictable.

**Fix:** Use `secrets.randbelow(10000)`. Add a max-attempts counter (e.g. 5 tries, then regenerate code). Or switch to 6-digit codes.

---

## 6. No pagination on feed and list endpoints

**Files:** `app/routes/rides.py:90-93`, `app/routes/messages.py:69-73`

```python
docs = await rides_collection().find({"status": "open", "type": opposite}).to_list(200)
```

- Feed loads up to 200 posts in one response. On mobile with limited bandwidth, this is slow and wasteful.
- `GET /posts/by/{user_id}` uses `.to_list(None)` — no limit at all.
- `GET /messages/rooms` caps at 100 but has no cursor/page param.

Only `GET /messages/rooms/{room_id}` has proper pagination (page + PAGE_SIZE).

**Fix:** Add `page` and `limit` query params to all list endpoints. Default to 20 items for mobile.

---

## 7. Duplicate route registrations (legacy `login.py` still mounted)

**File:** `app/auth/login.py` defines routes at `/auth/passenger/register` and `/auth/driver/register`.  
**File:** `app/main.py:55` mounts `auth.router` at `/api/v1/auth` (the new routes).

But `login.py` also defines its own `router` — if this is imported or mounted elsewhere, you get two conflicting auth systems. The legacy routes skip email verification (set `email_verified: True` directly).

**Fix:** Remove `login.py` entirely or ensure it's not mounted. Currently it's imported but the router variable may shadow or conflict.

---

## 8. `GET /map/config` exposes the Google Maps API key

**File:** `app/routes/map.py:22-27`, `app/services/map.py:29-34`

```python
def get_map_config(lat, lng, zoom):
    return {"apiKey": GOOGLE_MAPS_API_KEY, ...}
```

The backend sends the raw server-side Google Maps API key to any authenticated client. On web, you can restrict the key by HTTP referrer. On mobile, there's no referrer — anyone who captures this response has your unrestricted API key.

**Fix:** Mobile apps should use their own platform-restricted API keys (iOS bundle ID / Android package name restriction). Don't send the server key to clients. If the mobile app needs geocoding, proxy it through the backend (which you already do at `POST /map/geocode`).

---

## 9. CORS is wide open (`allow_origins=["*"]`)

**File:** `app/main.py:47-53`

This doesn't directly affect mobile (native apps don't enforce CORS), but it means any website can also call your API with a stolen token. Once you have mobile users with long-lived tokens, this becomes a bigger attack surface.

**Fix:** Restrict `allow_origins` to your actual frontend domain(s).

---

## 10. No response envelope / inconsistent response shapes

**Files:** All route files

Some endpoints return the object directly, some return `{"ok": True}`, some return `{"user": ..., "token": ...}`, login sometimes returns `{"accounts": [...]}`.

On mobile this is painful because:
- You need different deserialization logic per endpoint.
- No consistent error shape — some return `{"detail": "..."}`, some raise raw 500s.
- No metadata (pagination info, request ID for debugging).

**Fix:** Standardize on a response envelope:
```json
{ "data": ..., "meta": { "page": 1, "total": 42 }, "error": null }
```

---

## 11. Follow/unfollow is not atomic (race condition)

**File:** `app/routes/users.py:110-117`

```python
await users_collection().update_one({"_id": current_user.id}, {"$addToSet": {"following": user_id}})
await users_collection().update_one({"_id": user_id}, {"$addToSet": {"followers": current_user.id}})
```

Two separate writes. If the second fails (network glitch, server crash), user A follows user B but B's followers list doesn't include A. On mobile with flaky connections, this will happen.

**Fix:** Use a MongoDB transaction, or store follows in a separate collection as single documents (`{follower_id, followed_id}`).

---

## 12. Rating system can be gamed

**File:** `app/routes/users.py:155-173`

- No check that the rater actually shared a ride with the target user.
- Same user can rate the same person multiple times (no dedup).
- The running average never stores individual ratings, so you can't audit or remove fake ones.

**Fix:** Store each rating as a separate document linked to a completed ride. Check that the ride exists and both users participated. One rating per ride per user.

---

## 13. `GeminiMatching._call_gemini()` is synchronous (blocks the event loop)

**File:** `app/services/GeminiMatching.py:83-124`

```python
resp = httpx.post(GEMINI_URL, ...)  # synchronous httpx.post, not async
```

This blocks the entire async event loop for up to 15 seconds. With multiple mobile users hitting `/feed` concurrently, the server stalls.

**Fix:** Use `httpx.AsyncClient` (like you do in `GasCost.py` and `GeminiChat.py`). Make `_call_gemini` and `_gemini_rank` async.

---

## 14. Room creation deletes posts with no undo

**File:** `app/routes/messages.py:179-193`

When a room is created:
- If the offer is fully booked → post is **deleted**.
- If it's a request → post is **deleted**.

Deleted means gone from the database. If something goes wrong (passenger cancels, room expires), the post can't be recovered. On mobile where accidental taps happen more, this is risky.

**Fix:** Set `status: "closed"` instead of deleting. Add a `matched_room_id` field to link the post to its room. This also lets you show ride history.

---

## 15. No push notification support

**File:** `app/routes/messages.py`

The web app uses Socket.IO for real-time messages, but there's no push notification infrastructure. Mobile users won't see new messages unless the app is in the foreground.

**Fix:** Integrate FCM (Firebase Cloud Messaging) for Android and APNs for iOS. Store device tokens per user. Send push when a new message arrives and the recipient isn't connected via socket.

---

## 16. No image upload / avatar storage

**Files:** `app/models/user.py:17` (`avatar_url: Optional[str]`), no upload endpoint

The `avatar_url` field exists but there's no endpoint to upload an avatar image. The mobile app will need profile photo uploads.

**Fix:** Add a `POST /users/me/avatar` endpoint that accepts multipart image upload, stores it in S3/Cloudinary/similar, and updates `avatar_url`.

---

## 17. Sensitive data exposed in user responses

**File:** `app/auth/deps.py:14-15`, `app/routes/users.py:13-23`

`_doc_to_user` strips `password_hash` but still returns `email`, `phone`, `dob`, `sex`, and full `followers`/`following` arrays to any authenticated user via `GET /users/{user_id}`.

**Fix:** Create a `PublicProfile` model that only includes fields safe for other users to see. Reserve full profile data for `GET /auth/me`.

---

## 18. `.edu` email check is trivially bypassed

**File:** `app/routes/auth.py:77`

The signup only checks `email.endswith(".edu")`. This allows fake `.edu` domains. Combined with weak verification codes (issue #5), the "college-only" guarantee is fragile.

**Fix:** Maintain an allowlist of known school email domains (you already have this data in the frontend `constants/schools.js`). Validate against it server-side.

---

## 19. `ID_CHECK_TEST_MODE` defaults to `true`

**File:** `app/services/IdCheck.py:24`

```python
TEST_MODE = os.environ.get("ID_CHECK_TEST_MODE", "true").lower() == "true"
```

If you forget to set this env var in production, every license upload is auto-approved. One misconfigured deploy = unverified drivers.

**Fix:** Default to `false`. Require explicit opt-in for test mode.

---

## 20. No WebSocket/real-time support for mobile

**File:** No Socket.IO server-side implementation found in the backend

The frontend uses `socket.io-client` but the backend has no Socket.IO server setup (no `python-socketio` in requirements.txt, no socket handlers in the code). Messages are currently HTTP-only (poll-based).

For mobile, you'll need real-time message delivery. Either:
- Add `python-socketio` with proper auth token validation
- Or use FCM/APNs push notifications for message delivery

---

## Summary — Priority Order

| Priority | Issue | Effort |
|----------|-------|--------|
| **P0** | #1 Replace mock tokens with JWT | Medium |
| **P0** | #2 Validate update fields (arbitrary write) | Small |
| **P0** | #13 Async Gemini call (blocks event loop) | Small |
| **P0** | #19 Test mode defaults to true | Trivial |
| **P1** | #4 Rate limiting on auth + paid APIs | Medium |
| **P1** | #5 Strengthen verification codes | Small |
| **P1** | #6 Add pagination to all list endpoints | Medium |
| **P1** | #8 Don't expose server API key to clients | Small |
| **P1** | #10 Standardize response format | Medium |
| **P1** | #17 Separate public vs private profile | Small |
| **P2** | #9 Restrict CORS origins | Trivial |
| **P2** | #3 Pydantic model for post updates | Small |
| **P2** | #7 Remove legacy login.py | Trivial |
| **P2** | #11 Atomic follow/unfollow | Small |
| **P2** | #12 Rating dedup + ride check | Medium |
| **P2** | #14 Soft-delete posts instead of hard delete | Small |
| **P2** | #18 Server-side school domain allowlist | Small |
| **P3** | #15 Push notifications (FCM/APNs) | Large |
| **P3** | #16 Avatar upload endpoint | Medium |
| **P3** | #20 WebSocket server for real-time | Large |