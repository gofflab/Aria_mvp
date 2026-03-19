from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.ticket import SeverityEnum, StatusEnum


# ── Comment ──────────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    author: str
    body: str


class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    author: str
    body: str
    created_at: datetime


# ── Ticket ───────────────────────────────────────────────────────────────────

class TicketCreate(BaseModel):
    instrument_part: str
    problem_description: str
    severity: SeverityEnum = SeverityEnum.medium
    reporter_name: str
    reporter_email: Optional[EmailStr] = None
    equipment_id: Optional[int] = None     # links to Equipment registry


class TicketUpdate(BaseModel):
    instrument_part: Optional[str] = None
    problem_description: Optional[str] = None
    severity: Optional[SeverityEnum] = None
    status: Optional[StatusEnum] = None
    assigned_to: Optional[str] = None


class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    instrument_part: str
    problem_description: str
    severity: SeverityEnum
    status: StatusEnum
    reporter_name: str
    reporter_email: Optional[str]
    assigned_to: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    comments: List[CommentOut] = []


class TicketSummary(BaseModel):
    """Lightweight version without comments — used for list views."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    instrument_part: str
    severity: SeverityEnum
    status: StatusEnum
    reporter_name: str
    reporter_email: Optional[str] = None
    assigned_to: Optional[str]
    created_at: datetime
    updated_at: datetime
