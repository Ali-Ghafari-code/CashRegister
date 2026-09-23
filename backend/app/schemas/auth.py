from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginIn(BaseModel):
    username: str
    password: str


class PinLoginIn(BaseModel):
    pin: str
    register_id: Optional[int] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    full_name: str
    email: Optional[str] = None
    is_active: bool
    is_superuser: bool
    branch_id: Optional[int] = None
    roles: List[str] = []


class UserCreate(BaseModel):
    username: str
    full_name: str
    password: str
    email: Optional[str] = None
    pin_code: Optional[str] = None
    branch_id: Optional[int] = None
    role_names: List[str] = []
    is_superuser: bool = False
