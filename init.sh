#!/usr/bin/env bash
# ============================================================
# BD FACS Aria III Maintenance Tracker — local dev setup
# For production, use: docker compose up --build
# ============================================================
set -euo pipefail

echo "=== Aria III Maintenance Tracker Setup ==="

# ── Backend ──────────────────────────────────────────────────
echo "[1/3] Setting up Python backend…"
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install --quiet -r backend/requirements.txt
deactivate
echo "  ✓ Backend dependencies installed"

# ── Frontend ─────────────────────────────────────────────────
echo "[2/3] Installing frontend dependencies…"
(cd frontend && npm install --silent)
echo "  ✓ Frontend dependencies installed"

# ── Env file ─────────────────────────────────────────────────
echo "[3/3] Checking environment…"
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "  ✓ Created .env from .env.example (review before running)"
else
  echo "  ✓ .env already exists"
fi

echo ""
echo "════════════════════════════════════════════"
echo " PRODUCTION (Docker Compose)"
echo "════════════════════════════════════════════"
echo "  docker compose up --build"
echo ""
echo " Optional — seed test data:"
echo "  docker compose exec backend python seed.py"
echo "  docker compose exec backend python seed.py --reset"
echo "  docker compose exec backend python seed.py --clean"
echo ""
echo "════════════════════════════════════════════"
echo " LOCAL DEV (no Docker)"
echo "════════════════════════════════════════════"
echo " Terminal 1 — Backend:"
echo "  cd backend && source .venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo "  (Uses SQLite by default; set DATABASE_URL for Postgres)"
echo ""
echo " Terminal 2 — Frontend:"
echo "  cd frontend && npm run dev"
echo "  → http://localhost:5173"
echo ""
echo " Run tests:"
echo "  cd backend && source .venv/bin/activate && pytest -v"
