from __future__ import annotations
from typing import List, Optional

from sqlalchemy import String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    legal_id: Mapped[Optional[str]] = mapped_column(String(64))
    tax_id: Mapped[Optional[str]] = mapped_column(String(64))
    address: Mapped[Optional[str]] = mapped_column(String(500))
    phone: Mapped[Optional[str]] = mapped_column(String(64))
    currency: Mapped[str] = mapped_column(String(8), default="IRT", nullable=False)  # Iranian Toman
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    branches: Mapped[List["Branch"]] = relationship(back_populates="company", cascade="all, delete-orphan")


class Branch(Base, TimestampMixin):
    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[Optional[str]] = mapped_column(String(128))
    address: Mapped[Optional[str]] = mapped_column(String(500))
    phone: Mapped[Optional[str]] = mapped_column(String(64))
    manager_name: Mapped[Optional[str]] = mapped_column(String(128))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    company: Mapped["Company"] = relationship(back_populates="branches")
    registers: Mapped[List["Register"]] = relationship(back_populates="branch", cascade="all, delete-orphan")
    warehouses: Mapped[List["Warehouse"]] = relationship(back_populates="branch", cascade="all, delete-orphan")


class Register(Base, TimestampMixin):
    __tablename__ = "registers"

    id: Mapped[int] = mapped_column(primary_key=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_online: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    branch: Mapped["Branch"] = relationship(back_populates="registers")


class Warehouse(Base, TimestampMixin):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(primary_key=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    branch: Mapped["Branch"] = relationship(back_populates="warehouses")
