from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CustomerGroupOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    discount_percent: Decimal


class CustomerBase(BaseModel):
    code: str
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    birth_date: Optional[str] = None
    group_id: Optional[int] = None
    credit_limit: Decimal = Decimal("0")
    is_active: bool = True
    notes: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    birth_date: Optional[str] = None
    group_id: Optional[int] = None
    credit_limit: Optional[Decimal] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class CustomerOut(CustomerBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    balance: Decimal
    store_credit: Decimal
    loyalty_points: int
