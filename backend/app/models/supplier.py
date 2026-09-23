from __future__ import annotations
import enum
from decimal import Decimal
from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, ForeignKey, Numeric, Integer, Boolean, Enum as SAEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Supplier(Base, TimestampMixin):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(32))
    email: Mapped[Optional[str]] = mapped_column(String(128))
    address: Mapped[Optional[str]] = mapped_column(String(500))
    city: Mapped[Optional[str]] = mapped_column(String(128))
    tax_id: Mapped[Optional[str]] = mapped_column(String(64))
    payment_terms_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lead_time_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    rating: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("0"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class POStatus(str, enum.Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    PARTIAL = "partial"
    RECEIVED = "received"
    CANCELLED = "cancelled"


class PurchaseOrder(Base, TimestampMixin):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id", ondelete="RESTRICT"), nullable=False)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False)
    status: Mapped[POStatus] = mapped_column(SAEnum(POStatus), default=POStatus.DRAFT, nullable=False)
    expected_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    total: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String(500))

    items: Mapped[List["PurchaseOrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")
    supplier: Mapped["Supplier"] = relationship()


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 3), nullable=False)
    received: Mapped[Decimal] = mapped_column(Numeric(18, 3), default=Decimal("0"), nullable=False)
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)

    order: Mapped["PurchaseOrder"] = relationship(back_populates="items")
