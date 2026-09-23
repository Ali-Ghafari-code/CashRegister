from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select, func, or_

from app.core.deps import DbSession, CurrentUser
from app.models import Customer, CustomerGroup
from app.schemas.customer import (
    CustomerCreate, CustomerUpdate, CustomerOut, CustomerGroupOut,
)
from app.schemas.common import Page

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=Page[CustomerOut])
def list_customers(
    db: DbSession, _: CurrentUser,
    q: Optional[str] = Query(None), group_id: Optional[int] = None,
    page: int = 1, size: int = 25,
):
    stmt = select(Customer)
    if group_id:
        stmt = stmt.where(Customer.group_id == group_id)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(
            Customer.full_name.like(like),
            Customer.phone.like(like),
            Customer.code.like(like),
        ))
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = list(db.scalars(stmt.order_by(Customer.full_name).offset((page - 1) * size).limit(size)))
    return Page(items=[CustomerOut.model_validate(r, from_attributes=True) for r in rows],
                total=total, page=page, size=size)


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: DbSession, _: CurrentUser):
    c = db.get(Customer, customer_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Not found")
    return c


@router.post("", response_model=CustomerOut, status_code=201)
def create_customer(payload: CustomerCreate, db: DbSession, _: CurrentUser):
    if db.scalar(select(Customer).where(Customer.code == payload.code)):
        raise HTTPException(status_code=400, detail="Customer code exists")
    c = Customer(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.patch("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: int, payload: CustomerUpdate, db: DbSession, _: CurrentUser):
    c = db.get(Customer, customer_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@router.get("/meta/groups", response_model=list[CustomerGroupOut])
def list_groups(db: DbSession, _: CurrentUser):
    return list(db.scalars(select(CustomerGroup).order_by(CustomerGroup.name)))
