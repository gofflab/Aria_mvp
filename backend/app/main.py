from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.routers import tickets

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BD FACS Aria III Maintenance Tracker",
    description="API for managing maintenance tickets for the BD FACS Aria III flow cytometer.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
