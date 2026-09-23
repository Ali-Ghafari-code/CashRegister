"""Seed the database with a minimal Persian-language dataset.

Idempotent: only inserts rows when the tables are still empty.
"""
from __future__ import annotations

from decimal import Decimal
from typing import List, Tuple

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import (
    Company, Branch, Register, Warehouse,
    Role, User, UserRole,
    Category, Brand, Product, Barcode,
    CustomerGroup, Customer,
    Supplier,
    Employee,
    InventoryLevel,
)
from app.models.inventory import StockMovementType, StockMovement


def seed_organization(db) -> Tuple[Company, List[Branch]]:
    company = db.scalar(select(Company))
    if company is None:
        company = Company(
            name="فروشگاه‌های زنجیره‌ای کش‌رجیستر",
            legal_id="1400123456",
            tax_id="14001234567",
            phone="۰۲۱-۸۸۸۸۰۰۰۰",
            address="تهران، خیابان ولیعصر",
            currency="IRT",
        )
        db.add(company)
        db.flush()

    branch_seed = [
        ("BR-001", "شعبه مرکزی تهران", "تهران", "سعید تهرانی"),
        ("BR-002", "شعبه ونک", "تهران", "مریم شاهی"),
        ("BR-003", "شعبه اصفهان چهارباغ", "اصفهان", "امیر نجفی"),
        ("BR-004", "شعبه مشهد رضا", "مشهد", "فاطمه رضوی"),
        ("BR-005", "شعبه شیراز زند", "شیراز", "بهرام کاووسی"),
    ]
    branches: List[Branch] = []
    for code, name, city, mgr in branch_seed:
        br = db.scalar(select(Branch).where(Branch.code == code))
        if br is None:
            br = Branch(company_id=company.id, code=code, name=name, city=city, manager_name=mgr)
            db.add(br)
            db.flush()
            db.add(Warehouse(branch_id=br.id, code=f"WH-{code}", name=f"انبار {name}"))
            for i in range(1, 4):
                db.add(Register(branch_id=br.id, code=f"R{i:02d}", name=f"صندوق {i}"))
        branches.append(br)
    return company, branches


def seed_roles(db) -> dict[str, Role]:
    names = {
        "admin": "دسترسی کامل مدیر سیستم",
        "manager": "مدیر شعبه",
        "cashier": "صندوقدار",
        "senior_cashier": "صندوقدار ارشد",
        "accountant": "حسابدار",
        "warehouse": "انباردار",
    }
    out: dict[str, Role] = {}
    for name, desc in names.items():
        role = db.scalar(select(Role).where(Role.name == name))
        if role is None:
            role = Role(name=name, description=desc, permissions="")
            db.add(role)
            db.flush()
        out[name] = role
    return out


def seed_users(db, branches: List[Branch], roles: dict[str, Role]) -> None:
    if db.scalar(select(User).where(User.username == "admin")) is None:
        u = User(
            username="admin",
            email="admin@cashregister.local",
            full_name="مدیر سیستم",
            hashed_password=hash_password("admin123"),
            is_active=True,
            is_superuser=True,
            pin_code="0000",
            branch_id=branches[0].id if branches else None,
        )
        db.add(u)
        db.flush()
        db.add(UserRole(user_id=u.id, role_id=roles["admin"].id))

    cashiers = [
        ("cashier1", "رضا مرادی", "1234", branches[0].id),
        ("cashier2", "سمیرا حسینی", "5678", branches[0].id),
        ("cashier3", "کوروش امینی", "9991", branches[1].id),
    ]
    for uname, name, pin, br_id in cashiers:
        if db.scalar(select(User).where(User.username == uname)) is None:
            u = User(
                username=uname, full_name=name,
                hashed_password=hash_password("cashier123"),
                pin_code=pin, branch_id=br_id, is_active=True,
            )
            db.add(u)
            db.flush()
            db.add(UserRole(user_id=u.id, role_id=roles["cashier"].id))


def seed_catalog(db, branches: List[Branch]) -> None:
    if db.scalar(select(Product)) is not None:
        return

    cat_names = ["لبنیات", "تنقلات", "نوشیدنی", "خواروبار", "شوینده", "بهداشتی", "پروتئینی", "میوه و سبزی", "نانوایی"]
    cats = {name: Category(name=name) for name in cat_names}
    for c in cats.values():
        db.add(c)
    db.flush()

    brand_names = ["پگاه", "کاله", "کوکاکولا", "دماوند", "چی‌توز", "مینو", "طلای شمال", "لادن", "اکتیو", "کلیر", "سیگنال", "محلی"]
    brands = {name: Brand(name=name) for name in brand_names}
    for b in brands.values():
        db.add(b)
    db.flush()

    seed = [
        # sku, name, cat, brand, price, cost, unit, emoji, weighted, reorder_point
        ("SKU-1001", "شیر پرچرب پگاه ۱ لیتری", "لبنیات", "پگاه", 42000, 33000, "عدد", "🥛", False, 30),
        ("SKU-1002", "ماست موسیر کاله ۵۰۰ گرمی", "لبنیات", "کاله", 68500, 51000, "عدد", "🥣", False, 20),
        ("SKU-1003", "پنیر لیقوان تازه", "لبنیات", "محلی", 320000, 260000, "کیلوگرم", "🧀", True, 15),
        ("SKU-2001", "نوشابه کوکاکولا ۱.۵ لیتری", "نوشیدنی", "کوکاکولا", 55000, 42000, "عدد", "🥤", False, 50),
        ("SKU-2002", "آب معدنی دماوند ۱.۵ لیتری", "نوشیدنی", "دماوند", 18000, 13500, "عدد", "💧", False, 80),
        ("SKU-3001", "چیپس چاکلز پنیری", "تنقلات", "چی‌توز", 39000, 29500, "عدد", "🍟", False, 40),
        ("SKU-3002", "پفک نمکی مینو", "تنقلات", "مینو", 22000, 15500, "عدد", "🌽", False, 60),
        ("SKU-4001", "برنج ایرانی هاشمی ۱۰ کیلویی", "خواروبار", "طلای شمال", 1_650_000, 1_380_000, "کیسه", "🍚", False, 25),
        ("SKU-4002", "روغن سرخ‌کردنی لادن ۱.۸ لیتری", "خواروبار", "لادن", 245_000, 205_000, "عدد", "🛢️", False, 20),
        ("SKU-5001", "مایع ظرفشویی اکتیو ۳.۷۵ لیتری", "شوینده", "اکتیو", 175_000, 138_000, "عدد", "🧴", False, 25),
        ("SKU-6001", "شامپو حجم‌دهنده کلیر ۴۰۰ml", "بهداشتی", "کلیر", 235_000, 178_000, "عدد", "🧴", False, 20),
        ("SKU-6002", "خمیر دندان سیگنال ضد پوسیدگی", "بهداشتی", "سیگنال", 68000, 52000, "عدد", "🪥", False, 40),
        ("SKU-7001", "مرغ تازه", "پروتئینی", "محلی", 195_000, 172_000, "کیلوگرم", "🍗", True, 15),
        ("SKU-7002", "ران گوسفندی", "پروتئینی", "محلی", 890_000, 780_000, "کیلوگرم", "🥩", True, 15),
        ("SKU-8001", "پرتقال تامسون درجه یک", "میوه و سبزی", "محلی", 78000, 58000, "کیلوگرم", "🍊", True, 30),
        ("SKU-8002", "سیب زرد لبنانی", "میوه و سبزی", "محلی", 92000, 71000, "کیلوگرم", "🍎", True, 30),
        ("SKU-9001", "نان بربری کنجدی", "نانوایی", "محلی", 24000, 15000, "عدد", "🥖", False, 50),
        ("SKU-9002", "نان لواش ماشینی", "نانوایی", "محلی", 14000, 9000, "بسته", "🥙", False, 100),
    ]
    products: List[Product] = []
    for i, (sku, name, cat, brand, price, cost, unit, emoji, weighted, rp) in enumerate(seed, 1):
        p = Product(
            sku=sku, name=name,
            category_id=cats[cat].id, brand_id=brands[brand].id,
            price=Decimal(price), cost=Decimal(cost),
            unit=unit, emoji=emoji, is_weighted=weighted, reorder_point=rp,
            tax_percent=Decimal("9"),
        )
        db.add(p)
        db.flush()
        db.add(Barcode(product_id=p.id, code=f"626010000{i:04d}", label="EAN"))
        products.append(p)
    db.flush()

    # opening stock across all warehouses
    for br in branches:
        wh = db.scalar(select(Warehouse).where(Warehouse.branch_id == br.id).limit(1))
        if not wh:
            continue
        for p in products:
            qty = Decimal(50) if not p.is_weighted else Decimal("20")
            db.add(InventoryLevel(product_id=p.id, warehouse_id=wh.id, on_hand=qty, reserved=Decimal("0")))
            db.add(StockMovement(
                product_id=p.id, warehouse_id=wh.id,
                type=StockMovementType.OPENING, quantity=qty,
                reference="OPENING", reason="Opening stock",
            ))


def seed_customers_and_suppliers(db) -> None:
    if db.scalar(select(CustomerGroup)) is None:
        groups = [
            ("عادی", Decimal("0")),
            ("نقره‌ای", Decimal("2")),
            ("طلایی", Decimal("5")),
            ("شرکتی", Decimal("8")),
        ]
        for name, disc in groups:
            db.add(CustomerGroup(name=name, discount_percent=disc))
        db.flush()

    if db.scalar(select(Customer)) is None:
        gold = db.scalar(select(CustomerGroup).where(CustomerGroup.name == "طلایی"))
        silver = db.scalar(select(CustomerGroup).where(CustomerGroup.name == "نقره‌ای"))
        corp = db.scalar(select(CustomerGroup).where(CustomerGroup.name == "شرکتی"))
        rows = [
            ("CU-0001", "علی رضایی", "09121234567", gold.id, 12_500, 0),
            ("CU-0002", "زهرا محمدی", "09354443322", silver.id, 4_800, 250_000),
            ("CU-0003", "شرکت پارس‌گستر", "02188887766", corp.id, 0, 5_400_000),
            ("CU-0004", "محمد کریمی", "09129988776", None, 900, 0),
            ("CU-0005", "نگار احمدی", "09391112233", gold.id, 21_400, 0),
        ]
        for code, name, phone, gid, points, balance in rows:
            db.add(Customer(
                code=code, full_name=name, phone=phone, group_id=gid,
                loyalty_points=points, balance=Decimal(balance),
                credit_limit=Decimal(2_000_000),
            ))

    if db.scalar(select(Supplier)) is None:
        rows = [
            ("SUP-001", "شرکت پگاه شمال", "01133445566", "آمل", 30, 3, "4.6"),
            ("SUP-002", "کاله آمل", "01144556677", "آمل", 30, 4, "4.4"),
            ("SUP-003", "چی‌توز البرز", "02633221100", "کرج", 45, 5, "4.2"),
            ("SUP-004", "کوکاکولا ایران", "02188889900", "تهران", 15, 2, "4.8"),
            ("SUP-005", "لادن گلستان", "01733221199", "گرگان", 60, 7, "4.1"),
        ]
        for code, name, phone, city, terms, lead, rating in rows:
            db.add(Supplier(
                code=code, name=name, phone=phone, city=city,
                payment_terms_days=terms, lead_time_days=lead, rating=Decimal(rating),
            ))


def seed_employees(db, branches: List[Branch]) -> None:
    if db.scalar(select(Employee)) is not None:
        return
    rows = [
        ("E-0001", "رضا مرادی", "صندوقدار", branches[0].id),
        ("E-0002", "سمیرا حسینی", "صندوقدار ارشد", branches[0].id),
        ("E-0003", "کوروش امینی", "سرشیفت", branches[1].id),
        ("E-0004", "مریم شاهی", "مدیر شعبه", branches[1].id),
        ("E-0005", "بهنام قربانی", "انبار", branches[2].id),
        ("E-0006", "لیلا کاظمی", "حسابدار", branches[0].id),
    ]
    for code, name, role_title, br_id in rows:
        db.add(Employee(code=code, full_name=name, role_title=role_title, branch_id=br_id))


def main() -> None:
    with SessionLocal() as db:
        _, branches = seed_organization(db)
        roles = seed_roles(db)
        seed_users(db, branches, roles)
        seed_catalog(db, branches)
        seed_customers_and_suppliers(db)
        seed_employees(db, branches)
        db.commit()
        print("Seed complete.")


if __name__ == "__main__":
    main()
