from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models import Sale, Shift, PurchaseOrder


def next_invoice_no(db: Session, branch_id: int) -> str:
    today = datetime.utcnow().strftime("%Y%m%d")
    prefix = f"INV-{branch_id:03d}-{today}-"
    count = db.scalar(
        select(func.count(Sale.id)).where(Sale.invoice_no.like(f"{prefix}%"))
    ) or 0
    return f"{prefix}{count + 1:05d}"


def next_shift_code(db: Session, register_id: int) -> str:
    today = datetime.utcnow().strftime("%Y%m%d")
    prefix = f"SH-{register_id:03d}-{today}-"
    count = db.scalar(
        select(func.count(Shift.id)).where(Shift.code.like(f"{prefix}%"))
    ) or 0
    return f"{prefix}{count + 1:03d}"


def next_po_number(db: Session) -> str:
    today = datetime.utcnow().strftime("%Y%m%d")
    prefix = f"PO-{today}-"
    count = db.scalar(
        select(func.count(PurchaseOrder.id)).where(PurchaseOrder.number.like(f"{prefix}%"))
    ) or 0
    return f"{prefix}{count + 1:04d}"
