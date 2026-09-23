from __future__ import annotations
from decimal import Decimal
from typing import Optional

from sqlalchemy import String, ForeignKey, Boolean, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class CustomerGroup(Base, TimestampMixin):
    __tablename__ = "customer_groups"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    discount_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0"), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))


class Customer(Base, TimestampMixin):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(128), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(32), index=True)
    email: Mapped[Optional[str]] = mapped_column(String(128))
    address: Mapped[Optional[str]] = mapped_column(String(500))
    tax_id: Mapped[Optional[str]] = mapped_column(String(64))
    birth_date: Mapped[Optional[str]] = mapped_column(String(16))  # ISO or Jalali string
    group_id: Mapped[Optional[int]] = mapped_column(ForeignKey("customer_groups.id", ondelete="SET NULL"))
    credit_limit: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    store_credit: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String(1000))
