#!/usr/bin/env python3
"""
Seed / clean the BD FACS Aria III maintenance database.

Usage
-----
  python seed.py           # Populate with realistic test tickets + comments
  python seed.py --clean   # Delete ALL data (tickets + comments)
  python seed.py --reset   # Clean, then re-seed

Environment
-----------
  DATABASE_URL   Connection string (default: SQLite ./aria_maintenance.db)
                 Set this to match your running backend/docker environment.

Docker example
--------------
  docker compose exec backend python seed.py --reset
"""

import argparse
import os
import sys
from datetime import datetime, timedelta, timezone

# Allow running as a plain script from the backend/ directory
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv

load_dotenv()

from app.db.database import Base, SessionLocal, engine
from app.models.ticket import Comment, SeverityEnum, StatusEnum, Ticket

# ── seed data ─────────────────────────────────────────────────────────────────

def _dt(days_ago: float) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days_ago)


SEED_TICKETS = [
    # ── Open ──────────────────────────────────────────────────────────────────
    {
        "instrument_part": "Laser — 488nm Blue",
        "problem_description": (
            "Power output intermittently drops from 200 mW to ~80 mW during "
            "long sort runs (>2h). No error code thrown by the software. "
            "Observed on two consecutive days. Laser warm-up looks normal."
        ),
        "severity": SeverityEnum.high,
        "status": StatusEnum.open,
        "reporter_name": "Dr. Maya Patel",
        "assigned_to": None,
        "created_at": _dt(1.2),
        "updated_at": _dt(1.2),
        "comments": [
            ("Dr. Maya Patel", "Restarted laser controller — issue persisted after ~90 min.", _dt(1.1)),
        ],
    },
    {
        "instrument_part": "Nozzle / Flow Cell",
        "problem_description": (
            "70 µm nozzle showing partial clog; CV on FSC rises above 4% after "
            "~30 min of continuous sort. Backflushing clears temporarily."
        ),
        "severity": SeverityEnum.medium,
        "status": StatusEnum.open,
        "reporter_name": "Alex Chen",
        "assigned_to": None,
        "created_at": _dt(0.5),
        "updated_at": _dt(0.5),
        "comments": [],
    },
    {
        "instrument_part": "Electronic / Software",
        "problem_description": (
            "FACSDiva 9.1 crashes with 'Sort Hardware Error 0x0A' when switching "
            "from 4-way to 2-way sort mode. Repeatable. Workaround: restart "
            "software between mode changes."
        ),
        "severity": SeverityEnum.low,
        "status": StatusEnum.open,
        "reporter_name": "Jamie Torres",
        "assigned_to": None,
        "created_at": _dt(3),
        "updated_at": _dt(3),
        "comments": [],
    },

    # ── In Progress ───────────────────────────────────────────────────────────
    {
        "instrument_part": "Pressure System",
        "problem_description": (
            "Sheath pressure oscillates ±0.3 PSI around the set point (15 PSI). "
            "Sort purity drops to 85% (target >98%). Observed after recent "
            "sheath filter replacement."
        ),
        "severity": SeverityEnum.high,
        "status": StatusEnum.in_progress,
        "reporter_name": "Dr. Ravi Gupta",
        "assigned_to": "Field Service Engineer Kim",
        "created_at": _dt(5),
        "updated_at": _dt(1),
        "comments": [
            ("Dr. Ravi Gupta", "Confirmed pressure gauge is calibrated correctly.", _dt(4.5)),
            ("Field Service Engineer Kim", "Replaced sheath pressure regulator O-rings. Monitoring pressure stability over next 24h.", _dt(1)),
        ],
    },
    {
        "instrument_part": "PMT Array",
        "problem_description": (
            "PE-Cy7 channel (PMT 8) showing baseline signal 3× higher than "
            "expected even with no sample running. Gain is correctly set."
        ),
        "severity": SeverityEnum.medium,
        "status": StatusEnum.in_progress,
        "reporter_name": "Sarah Liu",
        "assigned_to": "Tech. Marcus Webb",
        "created_at": _dt(7),
        "updated_at": _dt(2),
        "comments": [
            ("Tech. Marcus Webb", "Checked fiber coupling — appears intact. Ordering replacement PMT module.", _dt(2)),
        ],
    },

    # ── Resolved ──────────────────────────────────────────────────────────────
    {
        "instrument_part": "Sort Collection System",
        "problem_description": (
            "Left-side sort tube holder cracked; tube dislodges mid-sort, "
            "causing sample loss and contamination risk."
        ),
        "severity": SeverityEnum.high,
        "status": StatusEnum.resolved,
        "reporter_name": "Dr. Priya Osei",
        "assigned_to": "Tech. Marcus Webb",
        "created_at": _dt(14),
        "updated_at": _dt(10),
        "resolved_at": _dt(10),
        "comments": [
            ("Dr. Priya Osei", "Used tape as temporary fix — not safe for long term.", _dt(13)),
            ("Tech. Marcus Webb", "Replacement holder arrived. Installed and tested — sorts clean.", _dt(10)),
        ],
    },
    {
        "instrument_part": "Fluidics System",
        "problem_description": (
            "Air bubble introduced into sheath line after manual priming error. "
            "Droplet formation unstable; stream deflection off-center."
        ),
        "severity": SeverityEnum.medium,
        "status": StatusEnum.resolved,
        "reporter_name": "Alex Chen",
        "assigned_to": "Alex Chen",
        "created_at": _dt(21),
        "updated_at": _dt(20),
        "resolved_at": _dt(20),
        "comments": [
            ("Alex Chen", "Performed full de-gas cycle and re-primed sheath. Stream stable. Closed.", _dt(20)),
        ],
    },
    {
        "instrument_part": "Laser — 633nm Red",
        "problem_description": (
            "Laser spot misaligned after preventive maintenance visit — "
            "APC and APC-Cy7 signals ~40% lower than reference."
        ),
        "severity": SeverityEnum.high,
        "status": StatusEnum.resolved,
        "reporter_name": "Jamie Torres",
        "assigned_to": "BD Field Service",
        "created_at": _dt(30),
        "updated_at": _dt(28),
        "resolved_at": _dt(28),
        "comments": [
            ("BD Field Service", "Re-aligned 633nm laser to spatial filter. QC beads back within spec.", _dt(28)),
        ],
    },

    # ── Closed ────────────────────────────────────────────────────────────────
    {
        "instrument_part": "Temperature Control",
        "problem_description": (
            "Sample cooling block not reaching 4°C set point; reads 9–10°C "
            "during viability sorts. Peltier unit suspected."
        ),
        "severity": SeverityEnum.medium,
        "status": StatusEnum.closed,
        "reporter_name": "Dr. Maya Patel",
        "assigned_to": "Tech. Marcus Webb",
        "created_at": _dt(45),
        "updated_at": _dt(40),
        "resolved_at": _dt(40),
        "comments": [
            ("Tech. Marcus Webb", "Replaced Peltier element and thermal paste. Verified 4°C set point reached within 8 min.", _dt(41)),
            ("Dr. Maya Patel", "Tested over 3 sort sessions — stable. Closing ticket.", _dt(40)),
        ],
    },
]


# ── operations ────────────────────────────────────────────────────────────────

def clean(db):
    print("  Deleting all comments…")
    db.query(Comment).delete()
    print("  Deleting all tickets…")
    db.query(Ticket).delete()
    db.commit()
    print("  Database cleared.")


def seed(db):
    print(f"  Inserting {len(SEED_TICKETS)} tickets…")
    for td in SEED_TICKETS:
        comments_data = td.pop("comments", [])
        ticket = Ticket(**td)
        db.add(ticket)
        db.flush()  # get ticket.id

        for author, body, created_at in comments_data:
            db.add(Comment(ticket_id=ticket.id, author=author, body=body, created_at=created_at))

    db.commit()
    print(f"  Seed complete — {len(SEED_TICKETS)} tickets inserted.")


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Seed or clean the Aria III maintenance database.")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--clean", action="store_true", help="Delete all data")
    group.add_argument("--reset", action="store_true", help="Clean then re-seed")
    args = parser.parse_args()

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if args.clean:
            print("[ clean ]")
            clean(db)
        elif args.reset:
            print("[ reset ]")
            clean(db)
            seed(db)
        else:
            print("[ seed ]")
            seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
