from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.core.deps import DbSession, CurrentUser
from app.models import Branch, Register, Warehouse
from app.schemas.org import BranchCreate, BranchOut, RegisterOut, RegisterCreate, WarehouseOut

router = APIRouter(prefix="/branches", tags=["branches"])


@router.get("", response_model=list[BranchOut])
def list_branches(db: DbSession, _: CurrentUser):
    return list(db.scalars(select(Branch).order_by(Branch.name)))


@router.post("", response_model=BranchOut, status_code=201)
def create_branch(payload: BranchCreate, db: DbSession, _: CurrentUser):
    if db.scalar(select(Branch).where(Branch.code == payload.code)):
        raise HTTPException(status_code=400, detail="Code already exists")
    b = Branch(**payload.model_dump())
    db.add(b)
    db.commit()
    db.refresh(b)
    return b


@router.get("/{branch_id}/registers", response_model=list[RegisterOut])
def list_registers(branch_id: int, db: DbSession, _: CurrentUser):
    return list(db.scalars(select(Register).where(Register.branch_id == branch_id)))


@router.post("/{branch_id}/registers", response_model=RegisterOut, status_code=201)
def create_register(branch_id: int, payload: RegisterCreate, db: DbSession, _: CurrentUser):
    if payload.branch_id != branch_id:
        raise HTTPException(status_code=400, detail="Branch mismatch")
    r = Register(**payload.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.get("/{branch_id}/warehouses", response_model=list[WarehouseOut])
def list_warehouses(branch_id: int, db: DbSession, _: CurrentUser):
    return list(db.scalars(select(Warehouse).where(Warehouse.branch_id == branch_id)))
