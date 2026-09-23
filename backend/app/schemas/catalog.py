from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    parent_id: Optional[int] = None


class CategoryCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None


class BrandOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class BrandCreate(BaseModel):
    name: str


class BarcodeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    label: Optional[str] = None


class ProductBase(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    unit: str = "عدد"
    price: Decimal = Field(default=Decimal("0"))
    cost: Decimal = Field(default=Decimal("0"))
    tax_percent: Decimal = Field(default=Decimal("9"))
    is_weighted: bool = False
    reorder_point: int = 0
    is_active: bool = True
    emoji: Optional[str] = None
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    barcodes: List[str] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    unit: Optional[str] = None
    price: Optional[Decimal] = None
    cost: Optional[Decimal] = None
    tax_percent: Optional[Decimal] = None
    is_weighted: Optional[bool] = None
    reorder_point: Optional[int] = None
    is_active: Optional[bool] = None
    emoji: Optional[str] = None
    image_url: Optional[str] = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    barcodes: List[BarcodeOut] = []
    stock: Optional[Decimal] = None  # aggregated on the fly

    @classmethod
    def from_product(cls, p, stock: Optional[Decimal] = None) -> "ProductOut":
        data = cls.model_validate(p, from_attributes=True).model_dump()
        data["stock"] = stock
        return cls(**data)
