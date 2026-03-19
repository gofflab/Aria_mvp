import enum
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


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

    comments = relationship(
        "Comment",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="Comment.created_at",
    )


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    author = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    ticket = relationship("Ticket", back_populates="comments")
