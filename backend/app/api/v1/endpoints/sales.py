from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select, func

from app.core.deps import DbSession, CurrentUser
from app.models import Sale
from app.models.sale import SaleStatus
from app.schemas.common import Page
from app.schemas.sale import SaleCreate, SaleOut
from app.services.sales import create_sale, void_sale

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("", response_model=Page[SaleOut])
def list_sales(
    db: DbSession, _: CurrentUser,
    branch_id: Optional[int] = None,
    cashier_id: Optional[int] = None,
    status_filter: Optional[SaleStatus] = Query(None, alias="status"),
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    page: int = 1, size: int = 25,
):
    stmt = select(Sale)
    if branch_id:
        stmt = stmt.where(Sale.branch_id == branch_id)
    if cashier_id:
        stmt = stmt.where(Sale.cashier_id == cashier_id)
    if status_filter:
        stmt = stmt.where(Sale.status == status_filter)
    if date_from:
        stmt = stmt.where(Sale.created_at >= date_from)
    if date_to:
        stmt = stmt.where(Sale.created_at <= date_to)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = list(db.scalars(stmt.order_by(Sale.id.desc()).offset((page - 1) * size).limit(size)))
    return Page(items=[SaleOut.model_validate(r, from_attributes=True) for r in rows],
                total=total, page=page, size=size)


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(sale_id: int, db: DbSession, _: CurrentUser):
    s = db.get(Sale, sale_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Not found")
    return s


@router.post("", response_model=SaleOut, status_code=status.HTTP_201_CREATED)
def create(payload: SaleCreate, db: DbSession, current: CurrentUser):
    sale = create_sale(db, payload=payload, cashier_id=current.id)
    db.commit()
    db.refresh(sale)
    return sale


@router.post("/{sale_id}/void", response_model=SaleOut)
def void(sale_id: int, db: DbSession, current: CurrentUser):
    sale = void_sale(db, sale_id, current.id)
    db.commit()
    db.refresh(sale)
    return sale
