from decimal import Decimal
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models import InventoryLevel, StockMovement, StockMovementType, Warehouse, Branch


def default_warehouse_for_branch(db: Session, branch_id: int) -> Warehouse:
    wh = db.scalar(select(Warehouse).where(Warehouse.branch_id == branch_id).limit(1))
    if wh:
        return wh
    branch = db.get(Branch, branch_id)
    if branch is None:
        raise ValueError(f"Branch {branch_id} not found")
    wh = Warehouse(branch_id=branch.id, code=f"WH-{branch.code}", name=f"انبار {branch.name}")
    db.add(wh)
    db.flush()
    return wh


def get_or_create_level(db: Session, product_id: int, warehouse_id: int) -> InventoryLevel:
    lvl = db.scalar(
        select(InventoryLevel).where(
            InventoryLevel.product_id == product_id,
            InventoryLevel.warehouse_id == warehouse_id,
        )
    )
    if lvl:
        return lvl
    lvl = InventoryLevel(
        product_id=product_id, warehouse_id=warehouse_id,
        on_hand=Decimal("0"), reserved=Decimal("0"),
    )
    db.add(lvl)
    db.flush()
    return lvl


def total_stock(db: Session, product_id: int) -> Decimal:
    val = db.scalar(
        select(func.coalesce(func.sum(InventoryLevel.on_hand), 0)).where(
            InventoryLevel.product_id == product_id
        )
    )
    return Decimal(val or 0)


def move_stock(
    db: Session,
    *,
    product_id: int,
    warehouse_id: int,
    quantity: Decimal,
    type: StockMovementType,
    reference: Optional[str] = None,
    reason: Optional[str] = None,
    user_id: Optional[int] = None,
) -> InventoryLevel:
    """Apply a signed quantity to a warehouse and record a movement."""
    lvl = get_or_create_level(db, product_id, warehouse_id)
    lvl.on_hand = (lvl.on_hand or Decimal("0")) + quantity
    db.add(StockMovement(
        product_id=product_id,
        warehouse_id=warehouse_id,
        type=type,
        quantity=quantity,
        reference=reference,
        reason=reason,
        created_by=user_id,
    ))
    return lvl
