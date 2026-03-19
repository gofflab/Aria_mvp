from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine

# Import models so all tables are registered before create_all
import app.models.equipment  # noqa: F401
import app.models.ticket     # noqa: F401

from app.routers import tickets
from app.routers import equipment as equipment_router

# Create all tables on startup (idempotent — safe to run repeatedly)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lab Equipment Maintenance Tracker",
    description="Multi-equipment maintenance ticket system for lab instruments.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets.router, prefix="/api")
app.include_router(equipment_router.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
