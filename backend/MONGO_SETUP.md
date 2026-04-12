# MongoDB Setup Guide

This guide gets you connected to the shared **Yugo MongoDB Atlas cluster** so the backend can read/write data locally.

You've already been added as a user on the cluster with the correct permissions — you just need to grab the connection string and put it in your `.env`.

---

## 1. Get your Atlas credentials

Ask the project owner (Yan) for:

1. **Cluster connection string** (looks like `mongodb+srv://<user>:<password>@yugo-cluster.xxxxx.mongodb.net/...`)
2. **Your database username**
3. **Your database password**
4. **Database name** — usually `yugo`

> ⚠️ Never commit the password or full URI to git. The repo already ignores `.env`.

---

## 2. Allow your IP on Atlas

The cluster's network access list controls which machines can connect.

- Ask Yan to **add your current IP** to the Atlas Network Access page, **or**
- If Yan already set `0.0.0.0/0` (allow all), you're good — no action needed

To check your public IP:
```bash
curl ifconfig.me
```

If you get a connection timeout when starting the backend, your IP isn't whitelisted — that's the first thing to check.

---

## 3. Add Mongo variables to your `.env`

Create (or edit) `HackDartmouth/.env` in the repo root:

```env
MONGODB_URI=mongodb+srv://<your_user>:<your_password>@yugo-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=yugo
```

**Important:**
- No spaces around `=`
- No quotes around values
- No `export` prefix
- If your password contains `@`, `:`, `/`, `#`, or `%`, URL-encode those characters (e.g. `@` → `%40`). Easiest fix: ask Yan to regenerate your password without special chars.

Your full `.env` should also contain the other project keys:
```env
MONGODB_URI=...
MONGODB_DB=yugo
RESEND_API_KEY=...
GOOGLE_MAPS_API_KEY=...
ID_ANALYZER_API_KEY=...
```

---

## 4. Start the backend

From the repo root:
```bash
docker compose up --build
```

Watch the `carpool_backend` logs. **You should NOT see any Mongo errors.**

If Mongo connects, you'll see something like:
```
carpool_backend  | INFO:     Started server process [1]
carpool_backend  | INFO:     Application startup complete.
carpool_backend  | INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 5. Verify the connection

### Option A — Hit the health endpoint
```
http://localhost:8000/
```
Should return `{"message": "status ok!"}`. If this works, Mongo startup succeeded (the app refuses to start otherwise).

### Option B — Register a test passenger
Go to http://localhost:8000/docs and run the full signup flow:
1. `POST /api/v1/auth/passenger/request-code` — with your `.edu` email
2. Check your inbox for the 4-digit code
3. `POST /api/v1/auth/passenger/verify-code` — submit email + code
4. `POST /api/v1/auth/passenger/register` — submit token + full profile

---

## 6. Browse the database

### Option A — MongoDB VS Code extension (recommended)

1. Install the **MongoDB for VS Code** extension from the marketplace
2. Open the leaf icon in the sidebar → **Connect**
3. Paste the connection string from your `.env`
4. Expand the cluster → `yugo` database → you'll see collections:
   - `users` — all registered passengers/drivers
   - `verification_codes` — short-lived signup codes (auto-deleted after 10 min)
   - `verification_tokens` — short-lived post-verify tokens (auto-deleted after 30 min)

Click any document to inspect its fields.

### Option B — MongoDB Compass (GUI app)

Download: https://www.mongodb.com/products/tools/compass
Paste the same connection string on the login screen.

### Option C — Quick playground query

In a `.mongodb.js` file:
```js
use('yugo');
db.users.find({}).toArray();
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ServerSelectionTimeoutError` | Your IP isn't whitelisted on Atlas | Ask Yan to add your IP, or check that `0.0.0.0/0` is set |
| `Authentication failed` | Wrong password, or special chars not URL-encoded | Regenerate password / fix encoding |
| Backend crashes on startup with `MONGODB_URI must be set` | `.env` missing or not loaded | Make sure `.env` is at repo root (same level as `docker-compose.yml`) |
| Mongo connects but data doesn't appear in Atlas UI | You're in the wrong cluster/database in the UI | Check the cluster name and verify `MONGODB_DB=yugo` |
| Schema/index errors on startup | Stale data from previous schema | Drop the collection in Atlas or ping Yan |

---

## Rules of the road

- **Don't drop collections** without asking — others are using them
- **Don't commit `.env`** (it's already in `.gitignore`)
- **Use your own test email** when registering during dev so you don't collide with teammates
- **TTL indexes** auto-clean `verification_codes` and `verification_tokens` — don't panic if they look empty, that's normal
