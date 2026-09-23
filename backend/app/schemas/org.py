from typing import Optional
from pydantic import BaseModel, ConfigDict


class BranchBase(BaseModel):
    code: str
    name: str
    city: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    manager_name: Optional[str] = None
    is_active: bool = True


class BranchCreate(BranchBase):
    company_id: int = 1


class BranchOut(BranchBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    company_id: int


class RegisterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    branch_id: int
    code: str
    name: str
    is_active: bool
    is_online: bool


class RegisterCreate(BaseModel):
    branch_id: int
    code: str
    name: str


class WarehouseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    branch_id: int
    code: str
    name: str
    is_active: bool
