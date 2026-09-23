from __future__ import annotations
from datetime import datetime
from typing import Optional

from sqlalchemy import String, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    action: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    entity: Mapped[Optional[str]] = mapped_column(String(64), index=True)
    entity_id: Mapped[Optional[str]] = mapped_column(String(64), index=True)
    level: Mapped[str] = mapped_column(String(16), default="info", nullable=False)  # info/warn/error
    branch_id: Mapped[Optional[int]] = mapped_column(ForeignKey("branches.id", ondelete="SET NULL"))
    register_id: Mapped[Optional[int]] = mapped_column(ForeignKey("registers.id", ondelete="SET NULL"))
    old_value: Mapped[Optional[str]] = mapped_column(String(2000))
    new_value: Mapped[Optional[str]] = mapped_column(String(2000))
    ip_address: Mapped[Optional[str]] = mapped_column(String(64))
    detail: Mapped[Optional[str]] = mapped_column(String(1000))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
