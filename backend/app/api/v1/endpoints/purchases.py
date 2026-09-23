from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select

from app.core.deps import DbSession, CurrentUser
from app.models import PurchaseOrder, PurchaseOrderItem, Product, Warehouse
from app.models.supplier import POStatus
from app.models.inventory import StockMovementType
from app.services.inventory import move_stock, default_warehouse_for_branch
from app.services.numbering import next_po_number

router = APIRouter(prefix="/purchases", tags=["purchases"])


class POItemIn(BaseModel):
    product_id: int
    quantity: Decimal
    unit_cost: Decimal


class POItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    quantity: Decimal
    received: Decimal
    unit_cost: Decimal


class POCreate(BaseModel):
    supplier_id: int
    warehouse_id: int
    items: List[POItemIn]
    notes: Optional[str] = None


class POOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    number: str
    supplier_id: int
    warehouse_id: int
    status: POStatus
    total: Decimal
    notes: Optional[str] = None
    items: List[POItemOut] = []


class ReceiveIn(BaseModel):
    items: List[POItemIn]  # product_id + received quantity (unit_cost ignored on receive)


@router.get("", response_model=list[POOut])
def list_pos(db: DbSession, _: CurrentUser, status_filter: Optional[POStatus] = None):
    stmt = select(PurchaseOrder)
    if status_filter:
        stmt = stmt.where(PurchaseOrder.status == status_filter)
    return list(db.scalars(stmt.order_by(PurchaseOrder.id.desc()).limit(200)))


@router.post("", response_model=POOut, status_code=201)
def create_po(payload: POCreate, db: DbSession, current: CurrentUser):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Empty PO")
    total = sum((Decimal(i.quantity) * Decimal(i.unit_cost) for i in payload.items), Decimal("0"))
    po = PurchaseOrder(
        number=next_po_number(db),
        supplier_id=payload.supplier_id,
        warehouse_id=payload.warehouse_id,
        status=POStatus.APPROVED,
        total=total,
        notes=payload.notes,
    )
    db.add(po)
    db.flush()
    for it in payload.items:
        db.add(PurchaseOrderItem(order_id=po.id, product_id=it.product_id,
                                 quantity=it.quantity, unit_cost=it.unit_cost))
    db.commit()
    db.refresh(po)
    return po


@router.post("/{po_id}/receive", response_model=POOut)
def receive_po(po_id: int, payload: ReceiveIn, db: DbSession, current: CurrentUser):
    po = db.get(PurchaseOrder, po_id)
    if po is None:
        raise HTTPException(status_code=404, detail="PO not found")
    if po.status in (POStatus.RECEIVED, POStatus.CANCELLED):
        raise HTTPException(status_code=400, detail=f"PO already {po.status.value}")

    by_product = {p.product_id: p for p in po.items}
    for it in payload.items:
        line = by_product.get(it.product_id)
        if line is None:
            raise HTTPException(status_code=400, detail=f"Product {it.product_id} not in PO")
        if it.quantity <= 0:
            continue
        line.received = (line.received or Decimal("0")) + it.quantity
        move_stock(
            db, product_id=line.product_id, warehouse_id=po.warehouse_id,
            quantity=it.quantity, type=StockMovementType.PURCHASE,
            reference=po.number, reason="Goods receipt", user_id=current.id,
        )

    fully = all(Decimal(i.received) >= Decimal(i.quantity) for i in po.items)
    po.status = POStatus.RECEIVED if fully else POStatus.PARTIAL

    db.commit()
    db.refresh(po)
    return po
