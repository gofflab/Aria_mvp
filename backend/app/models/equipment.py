from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class Equipment(Base):
    """A piece of lab equipment that can have maintenance tickets logged against it."""

    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    manufacturer = Column(String(255), nullable=True)
    model_number = Column(String(255), nullable=True)
    serial_number = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    subsystems = relationship(
        "Subsystem",
        back_populates="equipment",
        cascade="all, delete-orphan",
        order_by="Subsystem.sort_order",
    )
    tickets = relationship("Ticket", back_populates="equipment")


class Subsystem(Base):
    """A named component or subsystem belonging to a piece of equipment.

    These populate the "instrument part" dropdown when creating a ticket,
    so each equipment type can define its own relevant subsystems.
    """

    __tablename__ = "subsystems"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(
        Integer, ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    equipment = relationship("Equipment", back_populates="subsystems")
