from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.ticket import Comment, StatusEnum, Ticket
from app.schemas.ticket import (
    CommentCreate, CommentOut,
    TicketCreate, TicketOut, TicketSummary, TicketUpdate,
)

router = APIRouter(prefix="/tickets", tags=["tickets"])


# ── Tickets ───────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[TicketSummary])
def list_tickets(
    status: Optional[StatusEnum] = Query(None),
    severity: Optional[str] = Query(None),
    equipment_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Ticket)
    if status:
        q = q.filter(Ticket.status == status)
    if severity:
        q = q.filter(Ticket.severity == severity)
    if equipment_id is not None:
        q = q.filter(Ticket.equipment_id == equipment_id)
    return q.order_by(Ticket.updated_at.desc()).all()


@router.post("/", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    ticket = Ticket(**payload.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.patch("/{ticket_id}", response_model=TicketOut)
def update_ticket(
    ticket_id: int, payload: TicketUpdate, db: Session = Depends(get_db)
):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Auto-stamp resolved_at when status flips to Resolved
    if "status" in update_data and update_data["status"] == StatusEnum.resolved:
        update_data["resolved_at"] = datetime.now(timezone.utc)
    elif "status" in update_data and update_data["status"] != StatusEnum.resolved:
        update_data["resolved_at"] = None

    for field, value in update_data.items():
        setattr(ticket, field, value)

    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()


# ── Comments ──────────────────────────────────────────────────────────────────

@router.post(
    "/{ticket_id}/comments",
    response_model=CommentOut,
    status_code=status.HTTP_201_CREATED,
)
def add_comment(
    ticket_id: int, payload: CommentCreate, db: Session = Depends(get_db)
):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    comment = Comment(ticket_id=ticket_id, **payload.model_dump())
    db.add(comment)
    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(comment)
    return comment


@router.delete(
    "/{ticket_id}/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment(
    ticket_id: int, comment_id: int, db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(
        Comment.id == comment_id, Comment.ticket_id == ticket_id
    ).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()


# ── History log (resolved tickets) ───────────────────────────────────────────

@router.get("/history/resolved", response_model=List[TicketOut])
def resolved_history(db: Session = Depends(get_db)):
    return (
        db.query(Ticket)
        .filter(Ticket.status == StatusEnum.resolved)
        .order_by(Ticket.resolved_at.desc())
        .all()
    )
