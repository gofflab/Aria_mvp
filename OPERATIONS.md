# Aria III Maintenance Tracker — Operations Guide

**Audience:** System administrators, lab IT staff, and anyone responsible for deploying or maintaining the application.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Prerequisites](#2-prerequisites)
3. [Quick Start (Docker)](#3-quick-start-docker)
4. [Configuration](#4-configuration)
5. [Database Management](#5-database-management)
6. [Test Data & Seed Script](#6-test-data--seed-script)
7. [Local Development (No Docker)](#7-local-development-no-docker)
8. [Running Unit Tests](#8-running-unit-tests)
9. [Architecture Reference](#9-architecture-reference)
10. [API Reference](#10-api-reference)
11. [Routine Maintenance](#11-routine-maintenance)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. System Overview

The Aria III Maintenance Tracker is a three-tier web application for logging and tracking maintenance events for the BD FACS Aria III flow cytometer.

```
Browser ──► Nginx (port 80) ──► React SPA
                    │
                    └──► FastAPI backend (port 8000)
                                │
                                └──► PostgreSQL (port 5432)
                                           │
                                     Docker volume
                                  aria_mvp_postgres_data
```

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend  | React 19, Vite, Tailwind CSS | Single-page application |
| API Server | Python 3.12, FastAPI, SQLAlchemy | REST API + business logic |
| Database | PostgreSQL 16 | Persistent ticket storage |
| Reverse Proxy | Nginx 1.27 | Serve SPA, proxy `/api/` to backend |

---

## 2. Prerequisites

### For Docker Compose (recommended)

| Requirement | Version | Check |
|-------------|---------|-------|
| Docker Engine | 24+ | `docker --version` |
| Docker Compose | v2 (`compose` plugin) | `docker compose version` |

### For local development (no Docker)

| Requirement | Version | Check |
|-------------|---------|-------|
| Python | 3.11+ | `python3 --version` |
| Node.js | 20 LTS | `node --version` |
| npm | 10+ | `npm --version` |
| PostgreSQL | 14+ (optional) | `psql --version` |

> **Note:** Local dev falls back to SQLite automatically — a PostgreSQL instance is not required to run or test the backend locally.

---

## 3. Quick Start (Docker)

### Step 1 — Clone and configure

```bash
git clone <repo-url>
cd Aria_mvp
cp .env.example .env
```

Review `.env` and change the database password before first launch:

```bash
# .env
POSTGRES_USER=aria
POSTGRES_PASSWORD=your_strong_password_here   # ← change this
POSTGRES_DB=aria_maintenance
```

### Step 2 — Build and start all services

```bash
docker compose up --build
```

On first launch, Docker will:
1. Pull `postgres:16-alpine` and `nginx:1.27-alpine`
2. Build the backend and frontend images
3. Create the named volume `aria_mvp_postgres_data`
4. Create all database tables automatically on backend startup

The application is ready when you see:

```
backend-1  | INFO:     Application startup complete.
```

### Step 3 — Open the application

Navigate to **http://localhost** in your browser.

The backend API is also accessible directly at **http://localhost:8000/api**.

### Step 4 — (Optional) Seed test data

```bash
docker compose exec backend python seed.py
```

This creates 9 realistic BD FACS Aria III tickets across all workflow statuses with realistic timestamps and service log comments. See [Section 6](#6-test-data--seed-script) for full details.

---

## 4. Configuration

### Environment Variables

All configuration is managed through `.env` (copied from `.env.example`).

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `POSTGRES_USER` | `aria` | Yes | PostgreSQL username |
| `POSTGRES_PASSWORD` | `aria_secret` | Yes | PostgreSQL password — **change in production** |
| `POSTGRES_DB` | `aria_maintenance` | Yes | Database name |
| `DATABASE_URL` | *(derived)* | No | Override full connection string (e.g. external managed DB) |

The backend constructs `DATABASE_URL` automatically from the Postgres variables. To use an external database (e.g. AWS RDS, Supabase), set `DATABASE_URL` directly:

```bash
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/aria_maintenance
```

### Frontend API URL

The frontend defaults to calling `/api` (relative URL), which Nginx proxies to the backend. No frontend configuration is required for standard deployments.

For development, the Vite dev server proxies `/api` to `http://localhost:8000` via `vite.config.js`.

### Nginx

The Nginx configuration at `frontend/nginx.conf` controls:
- **SPA routing** — all non-file URLs serve `index.html`
- **API proxy** — `/api/*` → `http://backend:8000/api/*`
- **Gzip** — enabled for text, CSS, JS, JSON, XML, SVG
- **Static asset caching** — 1-year cache with `immutable` for JS/CSS/fonts

To change the listening port, edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"   # change 8080 to your desired host port
```

---

## 5. Database Management

### Persistent Volume

Database files are stored in the Docker named volume `aria_mvp_postgres_data`. This volume survives container restarts and image rebuilds.

```bash
# Inspect the volume
docker volume inspect aria_mvp_postgres_data

# List all volumes
docker volume ls | grep aria
```

### Backups

```bash
# Dump the entire database to a file
docker compose exec db pg_dump \
  -U aria -d aria_maintenance \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from a dump file
docker compose exec -T db psql \
  -U aria -d aria_maintenance \
  < backup_20260101_120000.sql
```

### Connecting with psql

The database port is exposed to the host on **5432** for direct access:

```bash
# Via Docker
docker compose exec db psql -U aria -d aria_maintenance

# Via local psql client
psql postgresql://aria:aria_secret@localhost:5432/aria_maintenance
```

### Schema

Tables are created automatically at application startup using SQLAlchemy's `create_all`. No manual migration step is needed.

```sql
-- Key tables
SELECT * FROM tickets;
SELECT * FROM comments;

-- Useful status summary
SELECT status, COUNT(*) FROM tickets GROUP BY status;

-- High-severity open tickets
SELECT id, instrument_part, reporter_name, created_at
FROM tickets
WHERE status = 'Open' AND severity = 'High'
ORDER BY created_at;
```

### Complete Database Reset

To wipe and start fresh (destructive — data loss):

```bash
docker compose down -v        # remove containers AND volume
docker compose up --build     # rebuild and reinitialise
```

---

## 6. Test Data & Seed Script

The `backend/seed.py` script manages the test dataset. It is designed to be safe to run at any time and uses the same `DATABASE_URL` as the application.

### Commands

```bash
# Inside Docker (recommended for production deployments)
docker compose exec backend python seed.py           # insert test data
docker compose exec backend python seed.py --clean   # delete all tickets and comments
docker compose exec backend python seed.py --reset   # clean + re-seed (idempotent)

# Local development
cd backend
source .venv/bin/activate
python seed.py           # defaults to SQLite if DATABASE_URL not set
python seed.py --reset
python seed.py --clean
```

### What the seed data contains

| # | Subsystem | Status | Severity | Assigned |
|---|-----------|--------|----------|----------|
| 1 | Laser — 488nm Blue | Open | High | — |
| 2 | Nozzle / Flow Cell | Open | Medium | — |
| 3 | Electronic / Software | Open | Low | — |
| 4 | Pressure System | In Progress | High | Field Service |
| 5 | PMT Array | In Progress | Medium | Tech |
| 6 | Sort Collection System | Resolved | High | Tech |
| 7 | Fluidics System | Resolved | Medium | Self |
| 8 | Laser — 633nm Red | Resolved | High | BD Field Service |
| 9 | Temperature Control | Closed | Medium | Tech |

Tickets include realistic service log comments with historically-plausible timestamps.

### Preparing for production

```bash
# After verifying everything works with seed data:
docker compose exec backend python seed.py --clean
```

This removes all seed data while leaving the schema intact.

---

## 7. Local Development (No Docker)

Use this workflow for active backend or frontend development.

### Setup (first time)

```bash
./init.sh   # creates virtualenv, installs deps, creates .env
```

Or manually:

```bash
# Backend
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt

# Frontend
cd frontend && npm install
```

### Running the backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

By default the backend uses SQLite (`./aria_maintenance.db`). To point at a local PostgreSQL instance:

```bash
export DATABASE_URL=postgresql://aria:aria_secret@localhost:5432/aria_maintenance
uvicorn app.main:app --reload
```

### Running the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
# Application at http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:8000` automatically.

### Useful dev commands

```bash
npm run build     # production build (outputs to frontend/dist/)
npm run preview   # preview the production build locally
npm run lint      # ESLint check
```

---

## 8. Running Unit Tests

Tests use an in-memory SQLite database — no PostgreSQL instance or running backend is needed.

```bash
cd backend
source .venv/bin/activate
pytest -v
```

Expected output:

```
tests/test_comments.py::test_add_comment_returns_201 PASSED
tests/test_comments.py::test_add_comment_appears_on_ticket PASSED
...
tests/test_tickets.py::test_history_returns_only_resolved PASSED

============================== 25 passed in 0.33s ==============================
```

### Test structure

```
backend/tests/
├── conftest.py          # Fixtures: engine, db_session, client
├── test_tickets.py      # 17 tests — full ticket CRUD + history
└── test_comments.py     # 8 tests — comments + cascade
```

### What the tests cover

| Area | Coverage |
|------|---------|
| Create ticket | Required fields, validation, defaults, HTTP 201 |
| List tickets | Filtering by status and severity |
| Get ticket | Successful retrieval, 404 for missing |
| Update ticket | Partial patch, `resolved_at` stamping on Resolve, clearing on reopen |
| Delete ticket | Successful deletion, cascade to comments, 404 for missing |
| History | Only resolved tickets returned |
| Comments | Add, appear on ticket, 404 for missing ticket, 422 on bad input |
| Comment delete | Correct deletion, 404 for missing, cross-ticket protection |
| Cascade | Deleting ticket removes all comments |

---

## 9. Architecture Reference

### Directory layout

```
Aria_mvp/
├── docker-compose.yml           # Orchestration (db, backend, frontend)
├── .env.example                 # Configuration template
├── init.sh                      # Local dev setup helper
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── seed.py                  # Test data management
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, startup
│   │   ├── db/database.py       # Engine, session, Base, get_db
│   │   ├── models/ticket.py     # Ticket and Comment ORM models
│   │   ├── schemas/ticket.py    # Pydantic request/response models
│   │   └── routers/tickets.py   # All API endpoints
│   └── tests/
│       ├── conftest.py
│       ├── test_tickets.py
│       └── test_comments.py
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/tickets.js       # Axios API client
        ├── utils/date.js        # Date formatting helpers
        ├── components/
        │   ├── Navbar.jsx
        │   ├── KanbanBoard.jsx
        │   ├── StatsBar.jsx
        │   ├── TicketCard.jsx
        │   ├── SeverityBadge.jsx
        │   └── StatusBadge.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── NewTicket.jsx
            ├── TicketDetail.jsx
            └── History.jsx
```

---

## 10. API Reference

All endpoints are prefixed with `/api`. Interactive documentation (Swagger UI) is available at **http://localhost:8000/docs**.

### Tickets

| Method | Path | Description | Status Codes |
|--------|------|-------------|-------------|
| `GET` | `/api/tickets/` | List tickets (optional `?status=&severity=`) | 200 |
| `POST` | `/api/tickets/` | Create a ticket | 201, 422 |
| `GET` | `/api/tickets/{id}` | Get a single ticket with comments | 200, 404 |
| `PATCH` | `/api/tickets/{id}` | Update status, severity, or assignee | 200, 404, 422 |
| `DELETE` | `/api/tickets/{id}` | Delete ticket and all comments | 204, 404 |

### Comments

| Method | Path | Description | Status Codes |
|--------|------|-------------|-------------|
| `POST` | `/api/tickets/{id}/comments` | Add a service note | 201, 404, 422 |
| `DELETE` | `/api/tickets/{id}/comments/{cid}` | Delete a comment | 204, 404 |

### History / Utility

| Method | Path | Description | Status Codes |
|--------|------|-------------|-------------|
| `GET` | `/api/tickets/history/resolved` | All resolved tickets, newest first | 200 |
| `GET` | `/api/health` | Health check | 200 |

### Data Models

**Ticket fields (create):**

```json
{
  "instrument_part": "Nozzle / Flow Cell",
  "problem_description": "Clog detected during 4-way sort after 45 min.",
  "severity": "High",
  "reporter_name": "Dr. Jane Smith"
}
```

**Ticket fields (update — all optional):**

```json
{
  "status": "In Progress",
  "severity": "Medium",
  "assigned_to": "Tech. Lee"
}
```

**Severity values:** `"Low"` · `"Medium"` · `"High"`

**Status values:** `"Open"` · `"In Progress"` · `"Resolved"` · `"Closed"`

---

## 11. Routine Maintenance

### Updating the application

```bash
git pull origin main

# Rebuild and restart (no data loss — volume persists)
docker compose up --build -d
```

### Checking service health

```bash
# All services
docker compose ps

# Backend health check
curl http://localhost:8000/api/health
# → {"status": "ok"}

# Backend logs (live)
docker compose logs -f backend

# Database logs
docker compose logs -f db
```

### Stopping and starting

```bash
docker compose stop          # stop containers, keep volume
docker compose start         # restart stopped containers
docker compose down          # remove containers (volume safe)
docker compose down -v       # remove containers AND volume (data loss!)
```

### Disk usage

```bash
# Docker volume size
docker system df -v | grep aria_mvp_postgres_data

# Prune unused Docker resources (safe — skips named volumes)
docker system prune
```

---

## 12. Troubleshooting

### Backend fails to start — "could not connect to server"

The backend waits for PostgreSQL to be healthy before starting. If it still fails:

```bash
docker compose logs db       # check postgres startup errors
docker compose restart db
docker compose restart backend
```

### Port 80 or 5432 already in use

Edit `docker-compose.yml` to change the host port:

```yaml
frontend:
  ports:
    - "8080:80"   # host:container
db:
  ports:
    - "5433:5432"
```

### Frontend shows "Cannot reach the backend"

1. Verify the backend is running: `docker compose ps`
2. Check backend logs: `docker compose logs backend`
3. Test the API directly: `curl http://localhost:8000/api/health`
4. If running without Docker, ensure the Vite proxy points to the correct backend URL in `vite.config.js`

### Database tables missing after restart

Tables are created automatically on startup. If they're missing, check for errors in `docker compose logs backend`. The `create_all` call runs every time the backend starts and is safe to re-run (it only creates missing tables).

### Seed script fails with "relation does not exist"

Run it after the backend has started (tables must exist):

```bash
docker compose up -d
docker compose exec backend python seed.py
```

### Tests fail on import

Ensure the virtualenv is active and dependencies are installed:

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
pytest -v
```
