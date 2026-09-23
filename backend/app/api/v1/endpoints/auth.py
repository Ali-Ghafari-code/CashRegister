from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from app.core.deps import DbSession, CurrentUser
from app.core.security import create_access_token, verify_password
from app.models import User
from app.schemas.auth import LoginIn, PinLoginIn, Token, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _serialize_user(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        branch_id=user.branch_id,
        roles=[ur.role.name for ur in user.roles],
    )


@router.post("/login", response_model=Token)
def login(payload: LoginIn, db: DbSession) -> Token:
    user = db.scalar(select(User).where(User.username == payload.username))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong username or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User disabled")
    token = create_access_token(subject=user.id, extra={"u": user.username})
    return Token(access_token=token)


@router.post("/login/oauth", response_model=Token, include_in_schema=False)
def login_oauth(db: DbSession, form: OAuth2PasswordRequestForm = Depends()) -> Token:
    return login(LoginIn(username=form.username, password=form.password), db)


@router.post("/login/pin", response_model=Token)
def login_pin(payload: PinLoginIn, db: DbSession) -> Token:
    if not payload.pin or len(payload.pin) < 3:
        raise HTTPException(status_code=400, detail="PIN too short")
    user = db.scalar(select(User).where(User.pin_code == payload.pin, User.is_active.is_(True)))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid PIN")
    token = create_access_token(subject=user.id, extra={"u": user.username, "pin": True})
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def me(current: CurrentUser) -> UserOut:
    return _serialize_user(current)
