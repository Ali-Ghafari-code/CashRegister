from __future__ import annotations
import enum
from decimal import Decimal
from datetime import datetime
from typing import Optional

from sqlalchemy import String, ForeignKey, Numeric, Enum as SAEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class ShiftStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"


class Shift(Base, TimestampMixin):
    __tablename__ = "shifts"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    register_id: Mapped[int] = mapped_column(ForeignKey("registers.id", ondelete="RESTRICT"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="RESTRICT"), nullable=False)
    cashier_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    status: Mapped[ShiftStatus] = mapped_column(SAEnum(ShiftStatus), default=ShiftStatus.OPEN, nullable=False, index=True)
    opening_cash: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    expected_cash: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    counted_cash: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    difference: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    notes: Mapped[Optional[str]] = mapped_column(String(500))


class CashMovementType(str, enum.Enum):
    DEPOSIT = "deposit"       # add cash
    WITHDRAWAL = "withdrawal" # take cash out
    EXPENSE = "expense"       # petty cash paid
    SAFE_DROP = "safe_drop"


class CashMovement(Base):
    __tablename__ = "cash_movements"

    id: Mapped[int] = mapped_column(primary_key=True)
    shift_id: Mapped[int] = mapped_column(ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[CashMovementType] = mapped_column(SAEnum(CashMovementType), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(String(255))
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
