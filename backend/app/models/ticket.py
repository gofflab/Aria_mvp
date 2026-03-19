import enum
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base

# Import equipment models so SQLAlchemy sees them before create_all
import app.models.equipment  # noqa: F401


class SeverityEnum(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class StatusEnum(str, enum.Enum):
    open = "Open"
    in_progress = "In Progress"
    resolved = "Resolved"
    closed = "Closed"


# native_enum=False stores as VARCHAR — works identically on SQLite and PostgreSQL
_ENUM_KWARGS = dict(native_enum=False)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    instrument_part = Column(String(255), nullable=False)
    problem_description = Column(Text, nullable=False)
    severity = Column(Enum(SeverityEnum, **_ENUM_KWARGS), nullable=False, default=SeverityEnum.medium)
    status = Column(Enum(StatusEnum, **_ENUM_KWARGS), nullable=False, default=StatusEnum.open)
    reporter_name = Column(String(255), nullable=False)
    assigned_to = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    resolved_at = Column(DateTime, nullable=True)

    # Optional link to the Equipment registry.  SET NULL on equipment deletion
    # so that tickets are never lost when equipment is removed.
    equipment_id = Column(
        Integer,
        ForeignKey("equipment.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    equipment = relationship("Equipment", back_populates="tickets")

    comments = relationship(
        "Comment",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="Comment.created_at",
    )

    @property
    def comment_count(self) -> int:
        return len(self.comments)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    author = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    ticket = relationship("Ticket", back_populates="comments")
