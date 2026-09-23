from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select, func, or_

from app.core.deps import DbSession, CurrentUser
from app.models import Supplier
from app.schemas.common import Page

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


class SupplierBase(BaseModel):
    code: str
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    tax_id: Optional[str] = None
    payment_terms_days: int = 0
    lead_time_days: int = 0
    is_active: bool = True


class SupplierOut(SupplierBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    balance: Decimal
    rating: Decimal


@router.get("", response_model=Page[SupplierOut])
def list_suppliers(db: DbSession, _: CurrentUser, q: Optional[str] = Query(None), page: int = 1, size: int = 25):
    stmt = select(Supplier)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Supplier.name.like(like), Supplier.code.like(like), Supplier.phone.like(like)))
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = list(db.scalars(stmt.order_by(Supplier.name).offset((page - 1) * size).limit(size)))
    return Page(items=[SupplierOut.model_validate(r, from_attributes=True) for r in rows], total=total, page=page, size=size)


@router.post("", response_model=SupplierOut, status_code=201)
def create_supplier(payload: SupplierBase, db: DbSession, _: CurrentUser):
    if db.scalar(select(Supplier).where(Supplier.code == payload.code)):
        raise HTTPException(status_code=400, detail="Code exists")
    s = Supplier(**payload.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s
