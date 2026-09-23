from __future__ import annotations
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import String, ForeignKey, Boolean, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categories.id", ondelete="SET NULL"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Brand(Base, TimestampMixin):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(1000))
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categories.id", ondelete="SET NULL"))
    brand_id: Mapped[Optional[int]] = mapped_column(ForeignKey("brands.id", ondelete="SET NULL"))
    unit: Mapped[str] = mapped_column(String(32), default="عدد", nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    cost: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0"), nullable=False)
    min_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2))
    max_discount_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("100"), nullable=False)
    tax_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("9"), nullable=False)
    is_weighted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    track_serial: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    track_batch: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reorder_point: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_service: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    emoji: Mapped[Optional[str]] = mapped_column(String(8))
    image_url: Mapped[Optional[str]] = mapped_column(String(500))

    category: Mapped[Optional["Category"]] = relationship()
    brand: Mapped[Optional["Brand"]] = relationship()
    barcodes: Mapped[List["Barcode"]] = relationship(back_populates="product", cascade="all, delete-orphan")


class Barcode(Base, TimestampMixin):
    __tablename__ = "barcodes"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    label: Mapped[Optional[str]] = mapped_column(String(64))  # e.g. "EAN", "Supplier"

    product: Mapped["Product"] = relationship(back_populates="barcodes")
