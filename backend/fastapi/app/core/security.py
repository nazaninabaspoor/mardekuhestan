"""JWT helpers — verify Django SimpleJWT access tokens."""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import get_settings

_bearer = HTTPBearer(auto_error=False)


@dataclass(slots=True, frozen=True)
class AuthUser:
    id: int
    is_staff: bool = False
    is_superuser: bool = False


def decode_access_token(token: str) -> AuthUser:
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False},
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="توکن نامعتبر است",
        ) from exc

    if payload.get("token_type") and payload.get("token_type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نوع توکن مجاز نیست",
        )

    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="شناسه کاربر در توکن نیست",
        )

    return AuthUser(
        id=int(user_id),
        is_staff=bool(payload.get("is_staff", False)),
        is_superuser=bool(payload.get("is_superuser", False)),
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> AuthUser:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ورود لازم است",
        )
    return decode_access_token(credentials.credentials)


async def get_staff_user(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    if not (user.is_staff or user.is_superuser):
        # Fallback: SimpleJWT default payload may omit is_staff — resolve in dependency via DB later.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="فقط ادمین",
        )
    return user
