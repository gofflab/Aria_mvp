#!/usr/bin/env bash
set -e

echo "=== BD FACS Aria III Maintenance Tracker — Setup ==="

# ── Backend ──────────────────────────────────────────────────────────────────
echo "[1/4] Creating backend structure..."
mkdir -p backend/app/{models,schemas,routers,db}
touch backend/app/__init__.py \
      backend/app/models/__init__.py \
      backend/app/schemas/__init__.py \
      backend/app/routers/__init__.py \
      backend/app/db/__init__.py

cat > backend/requirements.txt << 'EOF'
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
alembic==1.13.1
pydantic==2.7.1
python-multipart==0.0.9
EOF

echo "[2/4] Creating Python virtual environment..."
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install --quiet -r backend/requirements.txt
deactivate

# ── Frontend ─────────────────────────────────────────────────────────────────
echo "[3/4] Scaffolding React + Vite + Tailwind..."
npm create vite@latest frontend -- --template react --yes 2>/dev/null || \
  npx create-vite@latest frontend --template react

cd frontend
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom lucide-react react-hot-toast
cd ..

echo "[4/4] Done!"
echo ""
echo "To start the backend:"
echo "  cd backend && source .venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "To start the frontend:"
echo "  cd frontend && npm run dev"
