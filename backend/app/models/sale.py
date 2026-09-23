from __future__ import annotations
import enum
from decimal import Decimal
from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, ForeignKey, Numeric, Integer, Enum as SAEnum, DateTime, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class SaleStatus(str, enum.Enum):
    HELD = "held"
    COMPLETED = "completed"
    VOIDED = "voided"
    RETURNED = "returned"


class SaleType(str, enum.Enum):
    RETAIL = "retail"
    WHOLESALE = "wholesale"
    CORPORATE = "corporate"
    EMPLOYEE = "employee"
    ONLINE = "online"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    WALLET = "wallet"
    GIFT_CARD = "gift_card"
    QR = "qr"
    CREDIT = "credit"
    BANK_TRANSFER = "bank_transfer"
    CHECK = "check"


class Sale(Base, TimestampMixin):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_no: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="RESTRICT"), nullable=False, index=True)
    register_id: Mapped[Optional[int]] = mapped_column(ForeignKey("registers.id", ondelete="SET NULL"))
    shift_id: Mapped[Optional[int]] = mapped_column(ForeignKey("shifts.id", ondelete="SET NULL"), index=True)
    cashier_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    customer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("customers.id", ondelete="SET NULL"))
    warehouse_id: Mapped[Optional[int]] = mapped_column(ForeignKey("warehouses.id", ondelete="SET NULL"))

    status: Mapped[SaleStatus] = mapped_column(SAEnum(SaleStatus), default=SaleStatus.COMPLETED, nullable=False, index=True)
    type: Mapped[SaleType] = mapped_column(SAEnum(SaleType), default=SaleType.RETAIL, nullable=False)

    subtotal: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    discount_total: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    tax_total: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    grand_total: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    paid_total: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    change_due: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)

    is_offline: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    client_uid: Mapped[Optional[str]] = mapped_column(String(64), unique=True, index=True)  # idempotency
    notes: Mapped[Optional[str]] = mapped_column(String(1000))

    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    items: Mapped[List["SaleItem"]] = relationship(back_populates="sale", cascade="all, delete-orphan")
    payments: Mapped[List["Payment"]] = relationship(back_populates="sale", cascade="all, delete-orphan")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    sale_id: Mapped[int] = mapped_column(ForeignKey("sales.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[str] = mapped_column(String(64), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 3), nullable=False)
    unit: Mapped[str] = mapped_column(String(32), nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    discount_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0"), nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    tax_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0"), nullable=False)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    line_total: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    salesperson_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    note: Mapped[Optional[str]] = mapped_column(String(255))

    sale: Mapped["Sale"] = relationship(back_populates="items")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    sale_id: Mapped[int] = mapped_column(ForeignKey("sales.id", ondelete="CASCADE"), nullable=False, index=True)
    method: Mapped[PaymentMethod] = mapped_column(SAEnum(PaymentMethod), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    reference: Mapped[Optional[str]] = mapped_column(String(128))  # gateway ref, card RRN, etc.
    provider: Mapped[Optional[str]] = mapped_column(String(64))
    approved: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    sale: Mapped["Sale"] = relationship(back_populates="payments")


class Refund(Base, TimestampMixin):
    __tablename__ = "refunds"

    id: Mapped[int] = mapped_column(primary_key=True)
    original_sale_id: Mapped[int] = mapped_column(ForeignKey("sales.id", ondelete="RESTRICT"), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(String(255))
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    method: Mapped[PaymentMethod] = mapped_column(SAEnum(PaymentMethod), nullable=False)
    approved_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
