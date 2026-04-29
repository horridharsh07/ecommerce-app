"""
Auth routes — register, login, get-me.

Admin logic:
  - If the registering email matches ADMIN_EMAIL → is_admin is set True automatically.
  - The `require_admin` dependency (in security.py) blocks non-admin users.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone

from app.core.config import get_settings
from app.core.database import users_collection, get_next_sequence
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.schemas import UserRegister, UserLogin, UserResponse, TokenResponse

settings = get_settings()
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: UserRegister):
    # Check for duplicate email
    existing = await users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Determine admin status from ADMIN_EMAIL
    is_admin = data.email.lower() == settings.ADMIN_EMAIL.lower()

    user_id = await get_next_sequence("users")
    now = datetime.now(timezone.utc)

    user_doc = {
        "id": user_id,
        "email": data.email,
        "hashed_password": hash_password(data.password),
        "full_name": data.full_name,
        "phone": data.phone,
        "is_admin": is_admin,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    await users_collection.insert_one(user_doc)

    return UserResponse(
        id=user_id,
        email=data.email,
        full_name=data.full_name,
        phone=data.phone,
        is_admin=is_admin,
        created_at=now,
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await users_collection.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account deactivated")

    # Ensure admin flag stays in sync with ADMIN_EMAIL
    should_be_admin = data.email.lower() == settings.ADMIN_EMAIL.lower()
    if user.get("is_admin") != should_be_admin:
        await users_collection.update_one(
            {"id": user["id"]}, {"$set": {"is_admin": should_be_admin}}
        )
        user["is_admin"] = should_be_admin

    token = create_access_token({"sub": str(user["id"])})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        phone=current_user.get("phone"),
        is_admin=current_user.get("is_admin", False),
        created_at=current_user["created_at"],
    )
