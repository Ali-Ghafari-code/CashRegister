from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select, func

from app.core.deps import DbSession, CurrentUser
from app.models import Sale, Branch, Payment, InventoryLevel, Product, Customer
from app.models.sale import SaleStatus, PaymentMethod

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class KpiOut(BaseModel):
    today_sales: Decimal
    today_invoices: int
    today_refunds: Decimal
    active_customers: int


class BranchStat(BaseModel):
    id: int
    name: str
    today_sales: Decimal
    invoices: int


class PaymentMixOut(BaseModel):
    method: str
    total: Decimal


class SalesTrendPoint(BaseModel):
    date: str
    total: Decimal


class LowStockOut(BaseModel):
    product_id: int
    name: str
    on_hand: Decimal
    reorder_point: int


class SummaryOut(BaseModel):
    kpi: KpiOut
    branches: List[BranchStat]
    payment_mix: List[PaymentMixOut]
    sales_trend: List[SalesTrendPoint]
    low_stock: List[LowStockOut]


def _today_range():
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return start, start + timedelta(days=1)


@router.get("/summary", response_model=SummaryOut)
def summary(db: DbSession, _: CurrentUser):
    start, end = _today_range()

    today_sales = db.scalar(
        select(func.coalesce(func.sum(Sale.grand_total), 0)).where(
            Sale.status == SaleStatus.COMPLETED,
            Sale.created_at >= start, Sale.created_at < end,
        )
    ) or 0
    invoices = db.scalar(
        select(func.count(Sale.id)).where(
            Sale.status == SaleStatus.COMPLETED,
            Sale.created_at >= start, Sale.created_at < end,
        )
    ) or 0
    refunds = db.scalar(
        select(func.coalesce(func.sum(Sale.grand_total), 0)).where(
            Sale.status == SaleStatus.RETURNED,
            Sale.created_at >= start, Sale.created_at < end,
        )
    ) or 0
    active_customers = db.scalar(select(func.count(Customer.id)).where(Customer.is_active.is_(True))) or 0

    # Branches
    branches: list[BranchStat] = []
    for br in db.scalars(select(Branch).order_by(Branch.name)):
        b_total = db.scalar(
            select(func.coalesce(func.sum(Sale.grand_total), 0)).where(
                Sale.branch_id == br.id, Sale.status == SaleStatus.COMPLETED,
                Sale.created_at >= start, Sale.created_at < end,
            )
        ) or 0
        b_count = db.scalar(
            select(func.count(Sale.id)).where(
                Sale.branch_id == br.id, Sale.status == SaleStatus.COMPLETED,
                Sale.created_at >= start, Sale.created_at < end,
            )
        ) or 0
        branches.append(BranchStat(id=br.id, name=br.name, today_sales=Decimal(b_total), invoices=int(b_count)))

    # Payment mix
    mix_rows = db.execute(
        select(Payment.method, func.sum(Payment.amount)).join(Sale, Sale.id == Payment.sale_id).where(
            Sale.status == SaleStatus.COMPLETED,
            Sale.created_at >= start, Sale.created_at < end,
        ).group_by(Payment.method)
    ).all()
    payment_mix = [PaymentMixOut(method=m.value if isinstance(m, PaymentMethod) else str(m), total=Decimal(t or 0)) for m, t in mix_rows]

    # 14-day trend
    trend: list[SalesTrendPoint] = []
    for d in range(13, -1, -1):
        day_start = (start - timedelta(days=d))
        day_end = day_start + timedelta(days=1)
        total = db.scalar(
            select(func.coalesce(func.sum(Sale.grand_total), 0)).where(
                Sale.status == SaleStatus.COMPLETED,
                Sale.created_at >= day_start, Sale.created_at < day_end,
            )
        ) or 0
        trend.append(SalesTrendPoint(date=day_start.date().isoformat(), total=Decimal(total)))

    # Low stock
    low: list[LowStockOut] = []
    rows = db.execute(
        select(Product.id, Product.name, func.coalesce(func.sum(InventoryLevel.on_hand), 0), Product.reorder_point)
        .outerjoin(InventoryLevel, InventoryLevel.product_id == Product.id)
        .group_by(Product.id, Product.name, Product.reorder_point)
        .having(func.coalesce(func.sum(InventoryLevel.on_hand), 0) <= Product.reorder_point)
        .limit(20)
    ).all()
    for pid, name, on_hand, rp in rows:
        low.append(LowStockOut(product_id=pid, name=name, on_hand=Decimal(on_hand or 0), reorder_point=int(rp or 0)))

    return SummaryOut(
        kpi=KpiOut(today_sales=Decimal(today_sales), today_invoices=int(invoices),
                   today_refunds=Decimal(refunds), active_customers=int(active_customers)),
        branches=branches, payment_mix=payment_mix, sales_trend=trend, low_stock=low,
    )
