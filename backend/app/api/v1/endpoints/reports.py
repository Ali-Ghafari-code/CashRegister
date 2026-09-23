from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import select, func

from app.core.deps import DbSession, CurrentUser
from app.models import Sale, SaleItem, Product
from app.models.sale import SaleStatus

router = APIRouter(prefix="/reports", tags=["reports"])


class HourlyPoint(BaseModel):
    hour: int
    total: Decimal
    invoices: int


class TopProduct(BaseModel):
    product_id: int
    name: str
    qty: Decimal
    revenue: Decimal


class SalesByCashier(BaseModel):
    cashier_id: int
    total: Decimal
    invoices: int


def _range(from_dt: Optional[datetime], to_dt: Optional[datetime]):
    now = datetime.now(timezone.utc)
    if not from_dt:
        from_dt = now.replace(hour=0, minute=0, second=0, microsecond=0)
    if not to_dt:
        to_dt = from_dt + timedelta(days=1)
    return from_dt, to_dt


@router.get("/hourly", response_model=list[HourlyPoint])
def hourly(
    db: DbSession, _: CurrentUser,
    from_dt: Optional[datetime] = Query(None), to_dt: Optional[datetime] = Query(None),
    branch_id: Optional[int] = None,
):
    a, b = _range(from_dt, to_dt)
    stmt = (
        select(func.hour(Sale.created_at).label("h"),
               func.coalesce(func.sum(Sale.grand_total), 0),
               func.count(Sale.id))
        .where(Sale.status == SaleStatus.COMPLETED, Sale.created_at >= a, Sale.created_at < b)
        .group_by("h").order_by("h")
    )
    if branch_id:
        stmt = stmt.where(Sale.branch_id == branch_id)
    return [HourlyPoint(hour=int(h), total=Decimal(t or 0), invoices=int(c)) for h, t, c in db.execute(stmt).all()]


@router.get("/top-products", response_model=list[TopProduct])
def top_products(
    db: DbSession, _: CurrentUser,
    from_dt: Optional[datetime] = Query(None), to_dt: Optional[datetime] = Query(None),
    limit: int = 20,
):
    a, b = _range(from_dt, to_dt)
    stmt = (
        select(SaleItem.product_id,
               SaleItem.product_name,
               func.coalesce(func.sum(SaleItem.quantity), 0),
               func.coalesce(func.sum(SaleItem.line_total), 0))
        .join(Sale, Sale.id == SaleItem.sale_id)
        .where(Sale.status == SaleStatus.COMPLETED, Sale.created_at >= a, Sale.created_at < b)
        .group_by(SaleItem.product_id, SaleItem.product_name)
        .order_by(func.sum(SaleItem.line_total).desc())
        .limit(limit)
    )
    return [TopProduct(product_id=pid, name=name, qty=Decimal(q or 0), revenue=Decimal(r or 0))
            for pid, name, q, r in db.execute(stmt).all()]


@router.get("/by-cashier", response_model=list[SalesByCashier])
def by_cashier(
    db: DbSession, _: CurrentUser,
    from_dt: Optional[datetime] = Query(None), to_dt: Optional[datetime] = Query(None),
):
    a, b = _range(from_dt, to_dt)
    stmt = (
        select(Sale.cashier_id,
               func.coalesce(func.sum(Sale.grand_total), 0),
               func.count(Sale.id))
        .where(Sale.status == SaleStatus.COMPLETED, Sale.created_at >= a, Sale.created_at < b)
        .group_by(Sale.cashier_id)
    )
    out: list[SalesByCashier] = []
    for cid, total, cnt in db.execute(stmt).all():
        if cid is None:
            continue
        out.append(SalesByCashier(cashier_id=int(cid), total=Decimal(total or 0), invoices=int(cnt)))
    return out
