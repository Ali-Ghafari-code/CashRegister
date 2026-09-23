from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func

from app.core.deps import DbSession, CurrentUser
from app.models import InventoryLevel, Product, Warehouse, Branch
from app.models.inventory import StockMovementType
from app.services.inventory import move_stock, get_or_create_level

router = APIRouter(prefix="/inventory", tags=["inventory"])


class LevelOut(BaseModel):
    product_id: int
    warehouse_id: int
    on_hand: Decimal
    reserved: Decimal


class AdjustIn(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: Decimal
    reason: Optional[str] = None


class TransferIn(BaseModel):
    product_id: int
    from_warehouse_id: int
    to_warehouse_id: int
    quantity: Decimal
    reason: Optional[str] = None


@router.get("/levels", response_model=list[LevelOut])
def levels(
    db: DbSession, _: CurrentUser,
    product_id: Optional[int] = None, warehouse_id: Optional[int] = None,
    low_only: bool = False,
):
    stmt = select(InventoryLevel)
    if product_id:
        stmt = stmt.where(InventoryLevel.product_id == product_id)
    if warehouse_id:
        stmt = stmt.where(InventoryLevel.warehouse_id == warehouse_id)
    rows = list(db.scalars(stmt.limit(500)))
    out = []
    for r in rows:
        p = db.get(Product, r.product_id)
        if low_only and p and Decimal(r.on_hand) > Decimal(p.reorder_point or 0):
            continue
        out.append(LevelOut(product_id=r.product_id, warehouse_id=r.warehouse_id,
                            on_hand=Decimal(r.on_hand or 0), reserved=Decimal(r.reserved or 0)))
    return out


@router.post("/adjust", response_model=LevelOut)
def adjust(payload: AdjustIn, db: DbSession, current: CurrentUser):
    move_stock(
        db,
        product_id=payload.product_id,
        warehouse_id=payload.warehouse_id,
        quantity=payload.quantity,
        type=StockMovementType.ADJUSTMENT,
        reason=payload.reason or "Manual adjustment",
        user_id=current.id,
    )
    db.commit()
    lvl = get_or_create_level(db, payload.product_id, payload.warehouse_id)
    return LevelOut(product_id=lvl.product_id, warehouse_id=lvl.warehouse_id,
                    on_hand=Decimal(lvl.on_hand), reserved=Decimal(lvl.reserved))


@router.post("/transfer")
def transfer(payload: TransferIn, db: DbSession, current: CurrentUser):
    if payload.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
    move_stock(
        db, product_id=payload.product_id, warehouse_id=payload.from_warehouse_id,
        quantity=-payload.quantity, type=StockMovementType.TRANSFER_OUT,
        reason=payload.reason or "Transfer out", user_id=current.id,
    )
    move_stock(
        db, product_id=payload.product_id, warehouse_id=payload.to_warehouse_id,
        quantity=payload.quantity, type=StockMovementType.TRANSFER_IN,
        reason=payload.reason or "Transfer in", user_id=current.id,
    )
    db.commit()
    return {"status": "ok"}
