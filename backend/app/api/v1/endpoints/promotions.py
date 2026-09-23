from decimal import Decimal
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select

from app.core.deps import DbSession, CurrentUser
from app.models import Promotion, Coupon, GiftCard
from app.models.promotion import PromotionType

router = APIRouter(prefix="/promotions", tags=["promotions"])


class PromotionBase(BaseModel):
    name: str
    type: PromotionType
    scope: str = "all"
    scope_ref: Optional[str] = None
    value: Decimal = Decimal("0")
    min_basket: Decimal = Decimal("0")
    min_qty: int = 0
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    priority: int = 100
    is_stackable: bool = False
    is_active: bool = True


class PromotionOut(PromotionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class CouponBase(BaseModel):
    code: str
    promotion_id: int
    max_uses: int = 1
    per_customer_limit: int = 1
    is_active: bool = True


class CouponOut(CouponBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    used: int


class GiftCardBase(BaseModel):
    code: str
    balance: Decimal
    customer_id: Optional[int] = None


class GiftCardOut(GiftCardBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    initial_balance: Decimal
    is_active: bool


@router.get("", response_model=list[PromotionOut])
def list_promotions(db: DbSession, _: CurrentUser, active_only: bool = False):
    stmt = select(Promotion)
    if active_only:
        stmt = stmt.where(Promotion.is_active.is_(True))
    return list(db.scalars(stmt.order_by(Promotion.priority)))


@router.post("", response_model=PromotionOut, status_code=201)
def create_promotion(payload: PromotionBase, db: DbSession, _: CurrentUser):
    p = Promotion(**payload.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.get("/coupons", response_model=list[CouponOut])
def list_coupons(db: DbSession, _: CurrentUser):
    return list(db.scalars(select(Coupon).order_by(Coupon.id.desc()).limit(200)))


@router.post("/coupons", response_model=CouponOut, status_code=201)
def create_coupon(payload: CouponBase, db: DbSession, _: CurrentUser):
    if db.scalar(select(Coupon).where(Coupon.code == payload.code)):
        raise HTTPException(status_code=400, detail="Coupon code exists")
    c = Coupon(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("/gift-cards", response_model=list[GiftCardOut])
def list_gift_cards(db: DbSession, _: CurrentUser):
    return list(db.scalars(select(GiftCard).order_by(GiftCard.id.desc()).limit(200)))


@router.post("/gift-cards", response_model=GiftCardOut, status_code=201)
def create_gift_card(payload: GiftCardBase, db: DbSession, _: CurrentUser):
    if db.scalar(select(GiftCard).where(GiftCard.code == payload.code)):
        raise HTTPException(status_code=400, detail="Gift-card code exists")
    g = GiftCard(**payload.model_dump(), initial_balance=payload.balance)
    db.add(g)
    db.commit()
    db.refresh(g)
    return g
