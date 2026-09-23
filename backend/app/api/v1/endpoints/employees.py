from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select

from app.core.deps import DbSession, CurrentUser
from app.models import Employee

router = APIRouter(prefix="/employees", tags=["employees"])


class EmployeeBase(BaseModel):
    code: str
    full_name: str
    role_title: str = "صندوقدار"
    branch_id: Optional[int] = None
    user_id: Optional[int] = None
    phone: Optional[str] = None
    is_active: bool = True


class EmployeeOut(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


@router.get("", response_model=list[EmployeeOut])
def list_employees(db: DbSession, _: CurrentUser, branch_id: Optional[int] = None):
    stmt = select(Employee)
    if branch_id:
        stmt = stmt.where(Employee.branch_id == branch_id)
    return list(db.scalars(stmt.order_by(Employee.full_name).limit(500)))


@router.post("", response_model=EmployeeOut, status_code=201)
def create_employee(payload: EmployeeBase, db: DbSession, _: CurrentUser):
    if db.scalar(select(Employee).where(Employee.code == payload.code)):
        raise HTTPException(status_code=400, detail="Code exists")
    e = Employee(**payload.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return e
