from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.equipment import Equipment, Subsystem
from app.models.ticket import StatusEnum, Ticket
from app.schemas.equipment import (
    EquipmentCreate, EquipmentOut, EquipmentUpdate,
    SubsystemCreate, SubsystemOut, SubsystemUpdate,
)

router = APIRouter(prefix="/equipment", tags=["equipment"])


# ── helpers ───────────────────────────────────────────────────────────────────

def _get_or_404(db: Session, eq_id: int) -> Equipment:
    eq = db.get(Equipment, eq_id)
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return eq


def _enrich(eq: Equipment) -> EquipmentOut:
    """Attach computed ticket counts before serialising."""
    out = EquipmentOut.model_validate(eq)
    out.total_ticket_count = len(eq.tickets)
    out.open_ticket_count = sum(
        1 for t in eq.tickets
        if t.status not in (StatusEnum.resolved, StatusEnum.closed)
    )
    return out


# ── Equipment CRUD ────────────────────────────────────────────────────────────

@router.get("/", response_model=List[EquipmentOut])
def list_equipment(db: Session = Depends(get_db)):
    equipment = db.query(Equipment).order_by(Equipment.name).all()
    return [_enrich(eq) for eq in equipment]


@router.post("/", response_model=EquipmentOut, status_code=status.HTTP_201_CREATED)
def create_equipment(payload: EquipmentCreate, db: Session = Depends(get_db)):
    subsystems_data = payload.subsystems
    eq_data = payload.model_dump(exclude={"subsystems"})
    eq = Equipment(**eq_data)
    db.add(eq)
    db.flush()  # get eq.id

    for i, sub in enumerate(subsystems_data):
        db.add(Subsystem(
            equipment_id=eq.id,
            sort_order=sub.sort_order if sub.sort_order else i,
            **{k: v for k, v in sub.model_dump().items() if k != "sort_order"},
        ))

    db.commit()
    db.refresh(eq)
    return _enrich(eq)


@router.get("/{equipment_id}", response_model=EquipmentOut)
def get_equipment(equipment_id: int, db: Session = Depends(get_db)):
    return _enrich(_get_or_404(db, equipment_id))


@router.patch("/{equipment_id}", response_model=EquipmentOut)
def update_equipment(
    equipment_id: int, payload: EquipmentUpdate, db: Session = Depends(get_db)
):
    eq = _get_or_404(db, equipment_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(eq, field, value)
    db.commit()
    db.refresh(eq)
    return _enrich(eq)


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(equipment_id: int, db: Session = Depends(get_db)):
    eq = _get_or_404(db, equipment_id)
    db.delete(eq)
    db.commit()


# ── Subsystems ────────────────────────────────────────────────────────────────

@router.post(
    "/{equipment_id}/subsystems",
    response_model=SubsystemOut,
    status_code=status.HTTP_201_CREATED,
)
def add_subsystem(
    equipment_id: int, payload: SubsystemCreate, db: Session = Depends(get_db)
):
    _get_or_404(db, equipment_id)
    sub = Subsystem(equipment_id=equipment_id, **payload.model_dump())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.patch(
    "/{equipment_id}/subsystems/{subsystem_id}",
    response_model=SubsystemOut,
)
def update_subsystem(
    equipment_id: int,
    subsystem_id: int,
    payload: SubsystemUpdate,
    db: Session = Depends(get_db),
):
    sub = db.query(Subsystem).filter(
        Subsystem.id == subsystem_id, Subsystem.equipment_id == equipment_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subsystem not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(sub, field, value)
    db.commit()
    db.refresh(sub)
    return sub


@router.delete(
    "/{equipment_id}/subsystems/{subsystem_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_subsystem(
    equipment_id: int, subsystem_id: int, db: Session = Depends(get_db)
):
    sub = db.query(Subsystem).filter(
        Subsystem.id == subsystem_id, Subsystem.equipment_id == equipment_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subsystem not found")
    db.delete(sub)
    db.commit()


# ── Tickets for a specific piece of equipment ─────────────────────────────────

@router.get("/{equipment_id}/tickets")
def list_equipment_tickets(equipment_id: int, db: Session = Depends(get_db)):
    """Return all tickets for a specific piece of equipment."""
    _get_or_404(db, equipment_id)
    from app.schemas.ticket import TicketSummary
    tickets = (
        db.query(Ticket)
        .filter(Ticket.equipment_id == equipment_id)
        .order_by(Ticket.updated_at.desc())
        .all()
    )
    return [TicketSummary.model_validate(t) for t in tickets]
