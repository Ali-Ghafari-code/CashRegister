from __future__ import annotations
from typing import Optional

from sqlalchemy import String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Employee(Base, TimestampMixin):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(128), nullable=False)
    role_title: Mapped[str] = mapped_column(String(64), nullable=False, default="Cashier")
    branch_id: Mapped[Optional[int]] = mapped_column(ForeignKey("branches.id", ondelete="SET NULL"))
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    phone: Mapped[Optional[str]] = mapped_column(String(32))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
