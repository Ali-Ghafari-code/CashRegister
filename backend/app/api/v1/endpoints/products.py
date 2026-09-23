from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select, func, or_

from app.core.deps import DbSession, CurrentUser
from app.models import Product, Barcode, InventoryLevel, Category, Brand
from app.schemas.catalog import ProductCreate, ProductUpdate, ProductOut, CategoryOut, CategoryCreate, BrandOut, BrandCreate
from app.schemas.common import Page

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=Page[ProductOut])
def list_products(
    db: DbSession,
    _: CurrentUser,
    q: Optional[str] = Query(None, description="Search across name, sku, barcode, brand"),
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    page: int = 1,
    size: int = 25,
):
    stmt = select(Product)
    if is_active is not None:
        stmt = stmt.where(Product.is_active.is_(is_active))
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if brand_id:
        stmt = stmt.where(Product.brand_id == brand_id)
    if q:
        like = f"%{q}%"
        stmt = stmt.outerjoin(Barcode).where(
            or_(
                Product.name.like(like),
                Product.sku.like(like),
                Barcode.code.like(like),
            )
        ).distinct()

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = list(db.scalars(stmt.order_by(Product.name).offset((page - 1) * size).limit(size)))

    items = []
    for p in rows:
        stock = db.scalar(
            select(func.coalesce(func.sum(InventoryLevel.on_hand), 0)).where(InventoryLevel.product_id == p.id)
        )
        items.append(ProductOut.from_product(p, Decimal(stock or 0)))
    return Page(items=items, total=total, page=page, size=size)


@router.get("/barcode/{code}", response_model=ProductOut)
def find_by_barcode(code: str, db: DbSession, _: CurrentUser):
    bc = db.scalar(select(Barcode).where(Barcode.code == code))
    p: Optional[Product] = None
    if bc:
        p = db.get(Product, bc.product_id)
    else:
        p = db.scalar(select(Product).where(Product.sku == code))
    if p is None:
        raise HTTPException(status_code=404, detail="Product not found")
    stock = db.scalar(
        select(func.coalesce(func.sum(InventoryLevel.on_hand), 0)).where(InventoryLevel.product_id == p.id)
    )
    return ProductOut.from_product(p, Decimal(stock or 0))


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: DbSession, _: CurrentUser):
    p = db.get(Product, product_id)
    if p is None:
        raise HTTPException(status_code=404, detail="Not found")
    stock = db.scalar(
        select(func.coalesce(func.sum(InventoryLevel.on_hand), 0)).where(InventoryLevel.product_id == p.id)
    )
    return ProductOut.from_product(p, Decimal(stock or 0))


@router.post("", response_model=ProductOut, status_code=201)
def create_product(payload: ProductCreate, db: DbSession, _: CurrentUser):
    if db.scalar(select(Product).where(Product.sku == payload.sku)):
        raise HTTPException(status_code=400, detail="SKU already exists")
    prod = Product(**payload.model_dump(exclude={"barcodes"}))
    db.add(prod)
    db.flush()
    for code in payload.barcodes:
        if not code:
            continue
        db.add(Barcode(product_id=prod.id, code=code))
    db.commit()
    db.refresh(prod)
    return ProductOut.from_product(prod, Decimal("0"))


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: DbSession, _: CurrentUser):
    p = db.get(Product, product_id)
    if p is None:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    stock = db.scalar(
        select(func.coalesce(func.sum(InventoryLevel.on_hand), 0)).where(InventoryLevel.product_id == p.id)
    )
    return ProductOut.from_product(p, Decimal(stock or 0))


# --- Categories / Brands ---


@router.get("/meta/categories", response_model=list[CategoryOut])
def list_categories(db: DbSession, _: CurrentUser):
    return list(db.scalars(select(Category).order_by(Category.name)))


@router.post("/meta/categories", response_model=CategoryOut, status_code=201)
def create_category(payload: CategoryCreate, db: DbSession, _: CurrentUser):
    cat = Category(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.get("/meta/brands", response_model=list[BrandOut])
def list_brands(db: DbSession, _: CurrentUser):
    return list(db.scalars(select(Brand).order_by(Brand.name)))


@router.post("/meta/brands", response_model=BrandOut, status_code=201)
def create_brand(payload: BrandCreate, db: DbSession, _: CurrentUser):
    if db.scalar(select(Brand).where(Brand.name == payload.name)):
        raise HTTPException(status_code=400, detail="Brand already exists")
    b = Brand(name=payload.name)
    db.add(b)
    db.commit()
    db.refresh(b)
    return b
