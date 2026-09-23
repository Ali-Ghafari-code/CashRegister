from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Product, Sale, SaleItem, Payment, StockMovementType, Shift,
    Customer, LoyaltyTransaction,
)
from app.models.sale import SaleStatus, PaymentMethod
from app.models.shift import ShiftStatus
from app.schemas.sale import SaleCreate
from app.services.inventory import default_warehouse_for_branch, move_stock, total_stock
from app.services.numbering import next_invoice_no


TWO = Decimal("0.01")


def _q(x: Decimal) -> Decimal:
    return x.quantize(TWO, rounding=ROUND_HALF_UP)


def create_sale(db: Session, *, payload: SaleCreate, cashier_id: Optional[int]) -> Sale:
    # Idempotency: same client_uid → return existing
    if payload.client_uid:
        existing = db.scalar(select(Sale).where(Sale.client_uid == payload.client_uid))
        if existing:
            return existing

    if not payload.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sale must contain at least one item")

    wh = None
    if payload.warehouse_id:
        from app.models import Warehouse
        wh = db.get(Warehouse, payload.warehouse_id)
        if wh is None or wh.branch_id != payload.branch_id:
            raise HTTPException(status_code=400, detail="Warehouse does not belong to branch")
    else:
        wh = default_warehouse_for_branch(db, payload.branch_id)

    # Validate active shift when register/shift provided
    shift: Optional[Shift] = None
    if payload.shift_id:
        shift = db.get(Shift, payload.shift_id)
        if shift is None or shift.status != ShiftStatus.OPEN:
            raise HTTPException(status_code=400, detail="Shift is not open")

    sale = Sale(
        invoice_no=next_invoice_no(db, payload.branch_id),
        branch_id=payload.branch_id,
        register_id=payload.register_id,
        shift_id=payload.shift_id,
        cashier_id=cashier_id,
        customer_id=payload.customer_id,
        warehouse_id=wh.id,
        status=payload.status,
        type=payload.type,
        client_uid=payload.client_uid,
        is_offline=payload.is_offline,
        notes=payload.notes,
    )
    db.add(sale)
    db.flush()

    subtotal = Decimal("0")
    discount_total = Decimal("0")

    for line in payload.items:
        product = db.get(Product, line.product_id)
        if product is None or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {line.product_id} not available")
        if line.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")
        unit_price = line.unit_price if line.unit_price is not None else product.price
        if unit_price < 0:
            raise HTTPException(status_code=400, detail="Unit price cannot be negative")

        gross = _q(Decimal(unit_price) * Decimal(line.quantity))
        line_discount_percent = min(Decimal(line.discount_percent or 0), Decimal(product.max_discount_percent))
        line_discount = _q(gross * line_discount_percent / Decimal(100))
        net = gross - line_discount

        item = SaleItem(
            sale_id=sale.id,
            product_id=product.id,
            product_name=product.name,
            sku=product.sku,
            quantity=Decimal(line.quantity),
            unit=product.unit,
            unit_price=Decimal(unit_price),
            discount_percent=line_discount_percent,
            discount_amount=line_discount,
            tax_percent=Decimal(product.tax_percent),
            tax_amount=Decimal("0"),  # will be recomputed after invoice discount
            line_total=net,
            salesperson_id=line.salesperson_id,
            note=line.note,
        )
        db.add(item)

        subtotal += gross
        discount_total += line_discount

        # decrement inventory only for stockable, completed sales
        if payload.status == SaleStatus.COMPLETED and not product.is_service:
            move_stock(
                db,
                product_id=product.id,
                warehouse_id=wh.id,
                quantity=-Decimal(line.quantity),
                type=StockMovementType.SALE,
                reference=sale.invoice_no,
                reason="POS sale",
                user_id=cashier_id,
            )

    # invoice-level discount
    after_lines = subtotal - discount_total
    inv_disc = _q(after_lines * Decimal(payload.invoice_discount_percent or 0) / Decimal(100))
    discount_total += inv_disc

    # tax recomputed per-line proportionally to net-of-invoice-discount amount
    tax_total = Decimal("0")
    items = list(db.scalars(select(SaleItem).where(SaleItem.sale_id == sale.id)))
    for it in items:
        if inv_disc > 0 and after_lines > 0:
            share = _q(it.line_total * inv_disc / after_lines)
            it.line_total = it.line_total - share
            it.discount_amount = it.discount_amount + share
        it.tax_amount = _q(it.line_total * it.tax_percent / Decimal(100))
        tax_total += it.tax_amount

    grand = _q(subtotal - discount_total + tax_total)
    paid = Decimal("0")
    for p in payload.payments:
        if p.amount <= 0:
            continue
        db.add(Payment(
            sale_id=sale.id,
            method=p.method,
            amount=_q(Decimal(p.amount)),
            reference=p.reference,
            provider=p.provider,
            approved=True,
        ))
        paid += _q(Decimal(p.amount))

    if payload.status == SaleStatus.COMPLETED and paid + Decimal("0.01") < grand:
        raise HTTPException(status_code=400, detail="Payments do not cover total")

    change = max(Decimal("0"), paid - grand) if payload.status == SaleStatus.COMPLETED else Decimal("0")

    sale.subtotal = _q(subtotal)
    sale.discount_total = _q(discount_total)
    sale.tax_total = _q(tax_total)
    sale.grand_total = grand
    sale.paid_total = _q(paid)
    sale.change_due = _q(change)
    sale.completed_at = datetime.now(timezone.utc) if payload.status == SaleStatus.COMPLETED else None

    # Update shift expected cash from cash-tender payments
    if shift and payload.status == SaleStatus.COMPLETED:
        cash_paid = sum(
            (Decimal(p.amount) for p in payload.payments if p.method == PaymentMethod.CASH),
            Decimal("0"),
        )
        shift.expected_cash = _q((shift.expected_cash or Decimal("0")) + cash_paid - change)

    # Customer credit / loyalty
    if payload.customer_id and payload.status == SaleStatus.COMPLETED:
        customer = db.get(Customer, payload.customer_id)
        if customer:
            credit_paid = sum(
                (Decimal(p.amount) for p in payload.payments if p.method == PaymentMethod.CREDIT),
                Decimal("0"),
            )
            if credit_paid > 0:
                customer.balance = (customer.balance or Decimal("0")) + credit_paid
            # 1 point per 10,000 tomans
            earn = int(grand // Decimal("10000"))
            if earn > 0:
                customer.loyalty_points = (customer.loyalty_points or 0) + earn
                db.add(LoyaltyTransaction(
                    customer_id=customer.id,
                    sale_id=sale.id,
                    points_delta=earn,
                    reason="Earned from sale",
                ))

    db.flush()
    return sale


def void_sale(db: Session, sale_id: int, user_id: Optional[int]) -> Sale:
    sale = db.get(Sale, sale_id)
    if sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    if sale.status == SaleStatus.VOIDED:
        return sale
    # Restore inventory
    for it in sale.items:
        move_stock(
            db,
            product_id=it.product_id,
            warehouse_id=sale.warehouse_id,
            quantity=Decimal(it.quantity),
            type=StockMovementType.RETURN,
            reference=sale.invoice_no,
            reason="Void sale",
            user_id=user_id,
        )
    sale.status = SaleStatus.VOIDED
    db.flush()
    return sale
