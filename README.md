## Quick Start

```bash
git clone <repo-url>
cd <project-folder>
docker compose up --build
```

---
## Access

* Frontend: http://localhost:5173
* Backend: http://localhost:8000
* API Docs: http://localhost:8000/docs

---

## Stop the App

```bash
docker compose down
```

---

## Restart

```bash
docker compose down
docker compose up
```

---

## Rebuild (only if dependencies change)

```bash
docker compose up --build
```

---
## logs

```bash
docker compose logs backend
docker compose logs frontend
```

---
## Notes

* No local setup required (no Python/Node install needed)
* Everything runs in Docker
* Code changes auto-reload (no rebuild needed)