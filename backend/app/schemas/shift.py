from decimal import Decimal
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.models.shift import ShiftStatus, CashMovementType


class ShiftOpen(BaseModel):
    register_id: int
    branch_id: int
    opening_cash: Decimal = Decimal("0")
    notes: Optional[str] = None


class ShiftClose(BaseModel):
    counted_cash: Decimal
    notes: Optional[str] = None


class ShiftOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    register_id: int
    branch_id: int
    cashier_id: int
    status: ShiftStatus
    opening_cash: Decimal
    expected_cash: Decimal
    counted_cash: Decimal
    difference: Decimal
    opened_at: datetime
    closed_at: Optional[datetime] = None
    notes: Optional[str] = None


class CashMovementIn(BaseModel):
    type: CashMovementType
    amount: Decimal
    reason: Optional[str] = None


class CashMovementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    shift_id: int
    type: CashMovementType
    amount: Decimal
    reason: Optional[str] = None
    created_at: datetime
