from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.sale import PaymentMethod, SaleStatus, SaleType


class SaleItemIn(BaseModel):
    product_id: int
    quantity: Decimal
    unit_price: Optional[Decimal] = None  # if omitted → product.price
    discount_percent: Decimal = Decimal("0")
    salesperson_id: Optional[int] = None
    note: Optional[str] = None


class PaymentIn(BaseModel):
    method: PaymentMethod
    amount: Decimal
    reference: Optional[str] = None
    provider: Optional[str] = None


class SaleCreate(BaseModel):
    branch_id: int
    register_id: Optional[int] = None
    shift_id: Optional[int] = None
    customer_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    type: SaleType = SaleType.RETAIL
    items: List[SaleItemIn]
    payments: List[PaymentIn] = []
    invoice_discount_percent: Decimal = Decimal("0")
    status: SaleStatus = SaleStatus.COMPLETED
    client_uid: Optional[str] = None
    is_offline: bool = False
    notes: Optional[str] = None


class SaleItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product_name: str
    sku: str
    quantity: Decimal
    unit: str
    unit_price: Decimal
    discount_percent: Decimal
    discount_amount: Decimal
    tax_percent: Decimal
    tax_amount: Decimal
    line_total: Decimal


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    method: PaymentMethod
    amount: Decimal
    reference: Optional[str] = None
    provider: Optional[str] = None
    approved: bool
    created_at: datetime


class SaleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    invoice_no: str
    branch_id: int
    register_id: Optional[int] = None
    shift_id: Optional[int] = None
    cashier_id: Optional[int] = None
    customer_id: Optional[int] = None
    status: SaleStatus
    type: SaleType
    subtotal: Decimal
    discount_total: Decimal
    tax_total: Decimal
    grand_total: Decimal
    paid_total: Decimal
    change_due: Decimal
    completed_at: Optional[datetime] = None
    created_at: datetime
    items: List[SaleItemOut] = []
    payments: List[PaymentOut] = []
