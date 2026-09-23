from __future__ import annotations
import enum
from decimal import Decimal
from datetime import datetime
from typing import Optional

from sqlalchemy import String, ForeignKey, Numeric, Integer, Enum as SAEnum, UniqueConstraint, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class StockMovementType(str, enum.Enum):
    PURCHASE = "purchase"
    SALE = "sale"
    RETURN = "return"
    ADJUSTMENT = "adjustment"
    TRANSFER_IN = "transfer_in"
    TRANSFER_OUT = "transfer_out"
    WASTE = "waste"
    OPENING = "opening"


class InventoryLevel(Base, TimestampMixin):
    __tablename__ = "inventory_levels"
    __table_args__ = (UniqueConstraint("product_id", "warehouse_id", name="uq_inv_product_wh"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False, index=True)
    on_hand: Mapped[Decimal] = mapped_column(Numeric(18, 3), default=Decimal("0"), nullable=False)
    reserved: Mapped[Decimal] = mapped_column(Numeric(18, 3), default=Decimal("0"), nullable=False)


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[StockMovementType] = mapped_column(SAEnum(StockMovementType), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 3), nullable=False)  # signed
    reference: Mapped[Optional[str]] = mapped_column(String(64))  # e.g. sale invoice no
    reason: Mapped[Optional[str]] = mapped_column(String(255))
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
