#!/usr/bin/env python3
"""
Seed / clean the lab maintenance database.

Usage
-----
  python seed.py           # Populate with realistic test data
  python seed.py --clean   # Delete ALL data (tickets, comments, equipment)
  python seed.py --reset   # Clean, then re-seed

Environment
-----------
  DATABASE_URL   Connection string (default: SQLite ./aria_maintenance.db)

Docker example
--------------
  docker compose exec backend python seed.py --reset
"""

import argparse
import os
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from app.db.database import Base, SessionLocal, engine
import app.models.equipment  # noqa: F401
import app.models.ticket     # noqa: F401
from app.models.equipment import Equipment, Subsystem
from app.models.ticket import Comment, SeverityEnum, StatusEnum, Ticket


def _dt(days_ago: float) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days_ago)


# ── Equipment catalogue ───────────────────────────────────────────────────────

EQUIPMENT_CATALOGUE = [
    {
        "name": "BD FACS Aria III",
        "manufacturer": "BD Biosciences",
        "model_number": "FACS Aria III",
        "serial_number": "SN-ARIA3-00421",
        "location": "Flow Cytometry Core, Room 4B",
        "description": "High-speed cell sorter with 3 lasers (405nm violet, 488nm blue, 633nm red). "
                       "Capable of 4-way sorting at up to 70,000 events/sec.",
        "subsystems": [
            ("Laser — 488nm Blue", "Primary excitation laser for FITC, PE, and related fluorochromes"),
            ("Laser — 633nm Red", "Far-red excitation for APC, APC-Cy7, and related"),
            ("Laser — 405nm Violet", "Violet laser for Pacific Blue, BV dyes, and DAPI"),
            ("FSC Detector", "Forward scatter — cell size measurement"),
            ("SSC Detector", "Side scatter — cell granularity/complexity"),
            ("PMT Array", "All photomultiplier tube detector channels"),
            ("Sort Collection System", "Deflection plates, tube holders, and collection vessels"),
            ("Nozzle / Flow Cell", "Sorting nozzle and jet-in-air flow cell"),
            ("Fluidics System", "Sheath tank, tubing, sheath filter, and de-gas chamber"),
            ("Pressure System", "Sheath and sample pressure regulation"),
            ("Electronic / Software", "FACSDiva software, sort electronics, and control boards"),
            ("Temperature Control", "Sample cooling block and Peltier unit"),
            ("Sample Injection Port (SIP)", "Sample tube loading and injection"),
        ],
    },
    {
        "name": "Leica TCS SP8 Confocal",
        "manufacturer": "Leica Microsystems",
        "model_number": "TCS SP8",
        "serial_number": "SN-SP8-11842",
        "location": "Imaging Core, Room 2A",
        "description": "Point-scanning confocal microscope with white light laser (470–670nm), "
                       "405nm diode, and HyD hybrid detectors. Features AOBS beam splitting and "
                       "resonant scanner for live imaging.",
        "subsystems": [
            ("White Light Laser (WLL)", "Supercontinuum laser (470–670nm), fully tuneable"),
            ("Laser — 405nm Diode", "UV/Violet laser for DAPI and Hoechst"),
            ("HyD Detectors", "Hybrid detectors (HyD 1–4) for high-sensitivity fluorescence"),
            ("PMT Detectors", "Standard PMT channels for widefield or transmitted light"),
            ("Galvo Scanner / Scan Head", "Galvanometric and resonant scanning mirrors"),
            ("AOBS (Acousto-Optical Beam Splitter)", "Tuneable beam splitter — replaces fixed dichroics"),
            ("Objective Turret", "Motorised objective nosepiece (6-position)"),
            ("Z-Stage / Motorised Stage", "XYZ piezo and motorised stage for tiling and z-stacks"),
            ("Environmental Chamber", "Temperature, CO₂, and humidity control for live imaging"),
            ("LAS X Software", "Leica application suite acquisition and analysis software"),
        ],
    },
    {
        "name": "Nikon Ti2-E Widefield / TIRF",
        "manufacturer": "Nikon Instruments",
        "model_number": "Ti2-E",
        "serial_number": "SN-TI2E-30071",
        "location": "Live Imaging Suite, Room 3C",
        "description": "Inverted widefield microscope with TIRF illumination, motorised stage, "
                       "and Andor iXon EMCCD / Prime 95B sCMOS cameras. "
                       "Used for single-molecule and live-cell imaging.",
        "subsystems": [
            ("Laser Launch (405/488/561/640nm)", "Four-line laser combiner for fluorescence and TIRF"),
            ("TIRF Illuminator", "Total internal reflection fluorescence arm and angle control"),
            ("Andor iXon EMCCD Camera", "Electron-multiplying CCD for single-molecule sensitivity"),
            ("Prime 95B sCMOS Camera", "95% QE scientific CMOS for widefield and fast imaging"),
            ("Motorised Stage (Prior)", "Encoded XY stage for multi-position acquisition"),
            ("Piezo Z-Drive", "Nano-precision Z focus for z-stacks"),
            ("Filter Cube Turret", "Motorised fluorescence filter sets"),
            ("Objective Nosepiece", "6-position motorised nosepiece with immersion objectives"),
            ("Perfect Focus System (PFS)", "Hardware autofocus for long-term live imaging"),
            ("NIS-Elements Software", "Nikon image acquisition and analysis platform"),
        ],
    },
    {
        "name": "Beckman Coulter CytoFLEX S",
        "manufacturer": "Beckman Coulter",
        "model_number": "CytoFLEX S",
        "serial_number": "SN-CFX-50294",
        "location": "Flow Cytometry Core, Room 4B",
        "description": "Benchtop flow cytometer with 3 lasers and 21-parameter detection. "
                       "Used for immunophenotyping and routine analytical cytometry.",
        "subsystems": [
            ("Laser — 488nm Blue", "Blue laser for FITC, PE, PE-CF594, PE-Cy5, PE-Cy7, PerCP"),
            ("Laser — 638nm Red", "Red laser for APC, APC-A750, APC-Cy7"),
            ("Laser — 405nm Violet", "Violet laser for DAPI, BV421, BV510, BV605, BV711, BV786"),
            ("CytoFLEX Avalanche Photodiodes (APD)", "Solid-state APD detector array"),
            ("Fluidics / Sample Loader", "Sample uptake pump and HTS plate loader (optional)"),
            ("Sheath System", "Sheath fluid tank, pump, and pressure regulation"),
            ("CytExpert Software", "Data acquisition and analysis software"),
        ],
    },
]

# ── Seed tickets (reference equipment by index in EQUIPMENT_CATALOGUE) ────────

SEED_TICKETS = [
    # ── BD FACS Aria III ──────────────────────────────────────────────────────
    {
        "eq_index": 0,
        "instrument_part": "Laser — 488nm Blue",
        "problem_description": "Power output intermittently drops from 200 mW to ~80 mW during long "
                               "sort runs (>2h). No error code thrown by the software. "
                               "Observed on two consecutive days. Laser warm-up looks normal.",
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
        "eq_index": 0,
        "instrument_part": "Nozzle / Flow Cell",
        "problem_description": "70 µm nozzle showing partial clog; CV on FSC rises above 4% after "
                               "~30 min of continuous sort. Backflushing clears temporarily.",
        "severity": SeverityEnum.medium,
        "status": StatusEnum.open,
        "reporter_name": "Alex Chen",
        "assigned_to": None,
        "created_at": _dt(0.5),
        "updated_at": _dt(0.5),
        "comments": [],
    },
    {
        "eq_index": 0,
        "instrument_part": "Pressure System",
        "problem_description": "Sheath pressure oscillates ±0.3 PSI around the set point (15 PSI). "
                               "Sort purity drops to 85% (target >98%). Observed after recent "
                               "sheath filter replacement.",
        "severity": SeverityEnum.high,
        "status": StatusEnum.in_progress,
        "reporter_name": "Dr. Ravi Gupta",
        "assigned_to": "Field Service Engineer Kim",
        "created_at": _dt(5),
        "updated_at": _dt(1),
        "comments": [
            ("Dr. Ravi Gupta", "Confirmed pressure gauge is calibrated correctly.", _dt(4.5)),
            ("Field Service Engineer Kim",
             "Replaced sheath pressure regulator O-rings. Monitoring pressure stability over next 24h.", _dt(1)),
        ],
    },
    {
        "eq_index": 0,
        "instrument_part": "Sort Collection System",
        "problem_description": "Left-side sort tube holder cracked; tube dislodges mid-sort, "
                               "causing sample loss and contamination risk.",
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
        "eq_index": 0,
        "instrument_part": "Temperature Control",
        "problem_description": "Sample cooling block not reaching 4°C set point; reads 9–10°C "
                               "during viability sorts. Peltier unit suspected.",
        "severity": SeverityEnum.medium,
        "status": StatusEnum.closed,
        "reporter_name": "Dr. Maya Patel",
        "assigned_to": "Tech. Marcus Webb",
        "created_at": _dt(45),
        "updated_at": _dt(40),
        "resolved_at": _dt(40),
        "comments": [
            ("Tech. Marcus Webb",
             "Replaced Peltier element and thermal paste. Verified 4°C set point reached within 8 min.", _dt(41)),
            ("Dr. Maya Patel", "Tested over 3 sort sessions — stable. Closing ticket.", _dt(40)),
        ],
    },

    # ── Leica TCS SP8 ─────────────────────────────────────────────────────────
    {
        "eq_index": 1,
        "instrument_part": "White Light Laser (WLL)",
        "problem_description": "WLL output below 30% of spec across 500–600nm range. "
                               "Pinhole alignment may be drifted following building HVAC work last week. "
                               "Z-stacks showing banding artefacts.",
        "severity": SeverityEnum.high,
        "status": StatusEnum.open,
        "reporter_name": "Dr. Sofia Ricci",
        "assigned_to": None,
        "created_at": _dt(2),
        "updated_at": _dt(2),
        "comments": [],
    },
    {
        "eq_index": 1,
        "instrument_part": "Environmental Chamber",
        "problem_description": "CO₂ concentration drifting to 7.8% (set: 5%). Cells showing pH stress "
                               "indicators after 2h live imaging sessions.",
        "severity": SeverityEnum.medium,
        "status": StatusEnum.in_progress,
        "reporter_name": "Jamie Torres",
        "assigned_to": "Tech. Sara Kim",
        "created_at": _dt(4),
        "updated_at": _dt(0.5),
        "comments": [
            ("Tech. Sara Kim", "CO₂ regulator replaced. Running stability test overnight.", _dt(0.5)),
        ],
    },
    {
        "eq_index": 1,
        "instrument_part": "Galvo Scanner / Scan Head",
        "problem_description": "X-galvo mirror showing ringing artefact at pixel dwell times <1.2µs. "
                               "Image distortion visible in fast mode. Resonant scanner unaffected.",
        "severity": SeverityEnum.medium,
        "status": StatusEnum.resolved,
        "reporter_name": "Dr. Lena Fischer",
        "assigned_to": "Leica Field Service",
        "created_at": _dt(18),
        "updated_at": _dt(12),
        "resolved_at": _dt(12),
        "comments": [
            ("Leica Field Service",
             "Replaced galvo driver board. Ringing eliminated at all dwell times. QC passed.", _dt(12)),
        ],
    },

    # ── Nikon Ti2-E ───────────────────────────────────────────────────────────
    {
        "eq_index": 2,
        "instrument_part": "Perfect Focus System (PFS)",
        "problem_description": "PFS losing lock after 30–45 min during long time-lapses. "
                               "Z-drift of ~2µm observed. Issue reproducible on glass-bottom dishes "
                               "but not on standard coverslips.",
        "severity": SeverityEnum.medium,
        "status": StatusEnum.open,
        "reporter_name": "Dr. Owen Park",
        "assigned_to": None,
        "created_at": _dt(3),
        "updated_at": _dt(3),
        "comments": [
            ("Dr. Owen Park", "Tried reducing humidity in environmental enclosure — issue persists.", _dt(2.5)),
        ],
    },
    {
        "eq_index": 2,
        "instrument_part": "Andor iXon EMCCD Camera",
        "problem_description": "Horizontal banding in images at EM gain >200. Dark frame subtraction "
                               "does not correct. Camera temperature at nominal -85°C.",
        "severity": SeverityEnum.high,
        "status": StatusEnum.in_progress,
        "reporter_name": "Sarah Liu",
        "assigned_to": "Andor Support",
        "created_at": _dt(6),
        "updated_at": _dt(1),
        "comments": [
            ("Sarah Liu", "Issue first appeared after last power cut — may be charge trap damage.", _dt(5)),
            ("Andor Support", "Running remote diagnostics. Likely CCD sensor issue. RMA initiated.", _dt(1)),
        ],
    },
    {
        "eq_index": 2,
        "instrument_part": "TIRF Illuminator",
        "problem_description": "TIRF evanescent field depth inconsistent between sessions. "
                               "Angle reproducibility ±2° — should be ±0.2°. Motor backlash suspected.",
        "severity": SeverityEnum.low,
        "status": StatusEnum.resolved,
        "reporter_name": "Dr. Owen Park",
        "assigned_to": "Tech. Marcus Webb",
        "created_at": _dt(30),
        "updated_at": _dt(25),
        "resolved_at": _dt(25),
        "comments": [
            ("Tech. Marcus Webb",
             "Replaced TIRF angle stepper motor. Calibrated against 100nm beads. Reproducibility now ±0.15°.", _dt(25)),
        ],
    },

    # ── CytoFLEX S ────────────────────────────────────────────────────────────
    {
        "eq_index": 3,
        "instrument_part": "Sheath System",
        "problem_description": "Sheath pressure alarm triggering at startup. Reads 3.5 PSI instead "
                               "of set point 8 PSI. Sheath tank full and lines appear unobstructed.",
        "severity": SeverityEnum.high,
        "status": StatusEnum.open,
        "reporter_name": "Reza Ahmadi",
        "assigned_to": None,
        "created_at": _dt(0.3),
        "updated_at": _dt(0.3),
        "comments": [],
    },
    {
        "eq_index": 3,
        "instrument_part": "CytExpert Software",
        "problem_description": "CytExpert 2.5 crashing when exporting FCS files >500MB. "
                               "Error: 'Unhandled exception in export thread'. Workaround: split export into batches.",
        "severity": SeverityEnum.low,
        "status": StatusEnum.closed,
        "reporter_name": "Reza Ahmadi",
        "assigned_to": "Beckman Coulter Support",
        "created_at": _dt(60),
        "updated_at": _dt(55),
        "resolved_at": _dt(55),
        "comments": [
            ("Beckman Coulter Support",
             "Patch released in CytExpert 2.5.1. Updated — export now stable up to 2GB files.", _dt(55)),
        ],
    },
]


# ── operations ────────────────────────────────────────────────────────────────

def clean(db):
    print("  Deleting all comments…")
    db.query(Comment).delete()
    print("  Deleting all tickets…")
    db.query(Ticket).delete()
    print("  Deleting all subsystems…")
    db.query(Subsystem).delete()
    print("  Deleting all equipment…")
    db.query(Equipment).delete()
    db.commit()
    print("  Database cleared.")


def seed(db):
    print(f"  Inserting {len(EQUIPMENT_CATALOGUE)} equipment records…")
    equipment_ids = []

    for eq_data in EQUIPMENT_CATALOGUE:
        subsystems_raw = eq_data.pop("subsystems")
        eq = Equipment(**eq_data)
        db.add(eq)
        db.flush()
        equipment_ids.append(eq.id)

        for i, (name, desc) in enumerate(subsystems_raw):
            db.add(Subsystem(equipment_id=eq.id, name=name, description=desc, sort_order=i))

        eq_data["subsystems"] = subsystems_raw  # restore for idempotent re-runs

    db.flush()

    print(f"  Inserting {len(SEED_TICKETS)} tickets…")
    for td in SEED_TICKETS:
        eq_index = td.pop("eq_index")
        comments_data = td.pop("comments", [])

        ticket = Ticket(equipment_id=equipment_ids[eq_index], **td)
        db.add(ticket)
        db.flush()

        for author, body, created_at in comments_data:
            db.add(Comment(ticket_id=ticket.id, author=author, body=body, created_at=created_at))

        td["eq_index"] = eq_index
        td["comments"] = comments_data

    db.commit()
    print(f"  Seed complete — {len(EQUIPMENT_CATALOGUE)} equipment, {len(SEED_TICKETS)} tickets.")


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Seed or clean the lab maintenance database.")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--clean", action="store_true", help="Delete all data")
    group.add_argument("--reset", action="store_true", help="Clean then re-seed")
    args = parser.parse_args()

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
