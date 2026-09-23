from __future__ import annotations
import enum
from decimal import Decimal
from datetime import datetime
from typing import Optional

from sqlalchemy import String, ForeignKey, Numeric, Integer, Boolean, Enum as SAEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class PromotionType(str, enum.Enum):
    PERCENT = "percent"
    FIXED = "fixed"
    BXGY = "bxgy"
    BUNDLE = "bundle"
    TIERED = "tiered"


class Promotion(Base, TimestampMixin):
    __tablename__ = "promotions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[PromotionType] = mapped_column(SAEnum(PromotionType), nullable=False)
    scope: Mapped[str] = mapped_column(String(64), default="all", nullable=False)  # all/branch/category/product/customer_group
    scope_ref: Mapped[Optional[str]] = mapped_column(String(64))  # id or code depending on scope
    value: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    min_basket: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    min_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    starts_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    priority: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    is_stackable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Coupon(Base, TimestampMixin):
    __tablename__ = "coupons"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    promotion_id: Mapped[int] = mapped_column(ForeignKey("promotions.id", ondelete="CASCADE"), nullable=False)
    max_uses: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    per_customer_limit: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class GiftCard(Base, TimestampMixin):
    __tablename__ = "gift_cards"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    initial_balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    customer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("customers.id", ondelete="SET NULL"))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    sale_id: Mapped[Optional[int]] = mapped_column(ForeignKey("sales.id", ondelete="SET NULL"))
    points_delta: Mapped[int] = mapped_column(Integer, nullable=False)  # +earn / -redeem
    reason: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
