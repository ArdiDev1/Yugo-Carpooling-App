# Bug Resolution

**Date:** 2026-05-12
**Time:** 9:15 PM

---

## Bug 1 — For You feed empty for driver profile

### Symptom
On loading the For You page as a driver, the feed was empty. Behavior felt intermittent: sometimes the feed populated, sometimes it didn't. Logging out and back in (especially after a passenger session) appeared to "fix" it.

### Endpoint
`GET /api/v1/posts/feed` → returned `200 OK` with body `[]`.

### Investigation path
1. Verified the request was authenticated and reaching the handler.
2. Added temporary `FEED_DEBUG` logging to [backend/app/routes/rides.py](../backend/app/routes/rides.py) to print `role`, `opposite`, `raw_docs`, `posts_parsed`, `my_posts`, `ranked`, and `returning` counts per request.
3. Observed: `role='driver' opposite='request' raw_docs=0` — the Mongo `find` itself was matching zero documents. Everything downstream was correctly producing empty output.
4. Counted the `rides` collection directly:
   - Total rides: 11
   - `type=request`: **0**
   - `type=offer`: 11
   - `distinct status`: `['open']`
5. The driver feed queries `{status: "open", type: "request"}`. With zero requests in the DB, the empty response was correct.

### Root cause
Driver-side acceptance flow in [backend/app/routes/messages.py:191-193](../backend/app/routes/messages.py#L191-L193) destructively deletes the ride request when a driver clicks "I'm in" and a chat room is created:

```python
elif post_type == "request":
    # Driver accepted — the passenger's request is fulfilled, delete it.
    await rides_collection().delete_one({"_id": body.post_id})
```

During development testing, every "I'm in" click on a seeded request permanently removed that doc from `rides`. After enough clicks, the request pool was drained, leaving only offers. The intermittent appearance was a perception artifact:
- As **driver** the feed queries requests → empty (drained).
- As **passenger** the feed queries offers → 10 still present.
- Toggling roles via logout/login made it feel like the feed "came back" when in fact it was just showing a different collection slice.

### Fix
Re-seeded the database with `docker compose exec backend python seed_db.py --drop`, restoring 10 open requests and 10 open offers. Driver feed populated correctly on the next load.

### Recommended follow-up
Replace the destructive `delete_one` at [messages.py:193](../backend/app/routes/messages.py#L193) with a soft close so the doc survives:

```python
elif post_type == "request":
    await rides_collection().update_one(
        {"_id": body.post_id},
        {"$set": {"status": "closed"}},
    )
```

The feed filter (`status: "open"`) already excludes closed rides, so this hides matched requests without losing history.

---

## Bug 2 — Login 401 Unauthorized for all seed users

### Symptom
`POST /api/v1/auth/login` returned `401 Unauthorized` for every attempted credential combination against the seeded user accounts.

### Investigation path
1. Checked backend logs — initial confusion from a `pymongo.errors.ServerSelectionTimeoutError` (Atlas DNS failure), but DNS recovered and the connection was healthy when login was retried.
2. The 401s persisted on a healthy DB connection, so the failure was inside the credential check, not connectivity.
3. Inspected the seed data at [backend/seed/users_seed.json](../backend/seed/users_seed.json) — every seed user's `password_hash` was the literal string `$2b$12$placeholder...`, not a real bcrypt hash.
4. `bcrypt.checkpw()` in [backend/app/routes/auth.py:48-49](../backend/app/routes/auth.py#L48-L49) will reject every password against an invalid hash, hence the universal 401.

### Root cause
The seed user accounts ship with placeholder password hashes (`$2b$12$placeholder...`) that are not valid bcrypt strings. No password can authenticate against them.

### Fix
Created a fresh account through the regular `/signup` flow. Signup hashes the password correctly via `_hash_password()` in [auth.py:44](../backend/app/routes/auth.py#L44), producing a real bcrypt value. Login with that account succeeded immediately.

### Recommended follow-up
Either:
- Patch [seed_db.py](../backend/seed_db.py) to replace placeholder hashes with `bcrypt.hashpw(b"password", bcrypt.gensalt())` before insert, so seed users become loginable for development; **or**
- Document in the seed README that seed accounts are read-only references and a real signup is required for login testing.

---

## Cleanup performed
- Removed temporary `FEED_DEBUG` logging from [backend/app/routes/rides.py](../backend/app/routes/rides.py).
