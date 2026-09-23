from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.core.deps import DbSession, CurrentUser
from app.models import Shift, CashMovement
from app.models.shift import ShiftStatus, CashMovementType
from app.schemas.shift import ShiftOpen, ShiftClose, ShiftOut, CashMovementIn, CashMovementOut
from app.services.numbering import next_shift_code

router = APIRouter(prefix="/shifts", tags=["shifts"])


@router.get("", response_model=list[ShiftOut])
def list_shifts(
    db: DbSession, _: CurrentUser,
    status_filter: Optional[ShiftStatus] = None,
    branch_id: Optional[int] = None,
):
    stmt = select(Shift)
    if status_filter:
        stmt = stmt.where(Shift.status == status_filter)
    if branch_id:
        stmt = stmt.where(Shift.branch_id == branch_id)
    return list(db.scalars(stmt.order_by(Shift.id.desc()).limit(100)))


@router.post("/open", response_model=ShiftOut, status_code=201)
def open_shift(payload: ShiftOpen, db: DbSession, current: CurrentUser):
    existing = db.scalar(
        select(Shift).where(
            Shift.register_id == payload.register_id,
            Shift.status == ShiftStatus.OPEN,
        )
    )
    if existing:
        raise HTTPException(status_code=400, detail="Register already has an open shift")
    shift = Shift(
        code=next_shift_code(db, payload.register_id),
        register_id=payload.register_id,
        branch_id=payload.branch_id,
        cashier_id=current.id,
        opening_cash=payload.opening_cash,
        expected_cash=payload.opening_cash,
        notes=payload.notes,
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift


@router.post("/{shift_id}/close", response_model=ShiftOut)
def close_shift(shift_id: int, payload: ShiftClose, db: DbSession, current: CurrentUser):
    shift = db.get(Shift, shift_id)
    if shift is None:
        raise HTTPException(status_code=404, detail="Not found")
    if shift.status == ShiftStatus.CLOSED:
        return shift
    shift.counted_cash = payload.counted_cash
    shift.difference = (payload.counted_cash or Decimal("0")) - (shift.expected_cash or Decimal("0"))
    shift.closed_at = datetime.now(timezone.utc)
    shift.status = ShiftStatus.CLOSED
    if payload.notes:
        shift.notes = payload.notes
    db.commit()
    db.refresh(shift)
    return shift


@router.post("/{shift_id}/cash-movement", response_model=CashMovementOut, status_code=201)
def cash_movement(shift_id: int, payload: CashMovementIn, db: DbSession, current: CurrentUser):
    shift = db.get(Shift, shift_id)
    if shift is None or shift.status != ShiftStatus.OPEN:
        raise HTTPException(status_code=400, detail="Shift not open")
    delta = payload.amount if payload.type == CashMovementType.DEPOSIT else -payload.amount
    shift.expected_cash = (shift.expected_cash or Decimal("0")) + delta
    mv = CashMovement(
        shift_id=shift.id,
        type=payload.type,
        amount=payload.amount,
        reason=payload.reason,
        created_by=current.id,
    )
    db.add(mv)
    db.commit()
    db.refresh(mv)
    return mv
