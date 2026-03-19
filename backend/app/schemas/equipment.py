from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


# ── Subsystem ─────────────────────────────────────────────────────────────────

class SubsystemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    sort_order: int = 0


class SubsystemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None


class SubsystemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    equipment_id: int
    name: str
    description: Optional[str]
    sort_order: int


# ── Equipment ─────────────────────────────────────────────────────────────────

class EquipmentCreate(BaseModel):
    name: str
    manufacturer: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    subsystems: List[SubsystemCreate] = []


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    manufacturer: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class EquipmentSummary(BaseModel):
    """Lightweight representation for list views and ticket embeds."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    manufacturer: Optional[str]
    model_number: Optional[str]
    location: Optional[str]
    is_active: bool


class EquipmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    manufacturer: Optional[str]
    model_number: Optional[str]
    serial_number: Optional[str]
    location: Optional[str]
    description: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    subsystems: List[SubsystemOut] = []
    open_ticket_count: int = 0      # computed in the endpoint
    total_ticket_count: int = 0     # computed in the endpoint
