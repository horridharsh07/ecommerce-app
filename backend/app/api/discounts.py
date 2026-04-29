"""
Discount code routes — async MongoDB.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone

from app.core.database import discount_codes_collection, get_next_sequence
from app.core.security import require_admin
from app.schemas import (
    DiscountCodeCreate, DiscountCodeResponse,
    DiscountValidateRequest, DiscountValidateResponse,
)

router = APIRouter(prefix="/api/discounts", tags=["discounts"])


# ---- Public ----

@router.post("/validate", response_model=DiscountValidateResponse)
async def validate_discount(data: DiscountValidateRequest):
    code = await discount_codes_collection.find_one({
        "code": data.code.upper(), "is_active": True,
    })
    now = datetime.now(timezone.utc)

    if not code:
        return DiscountValidateResponse(valid=False, message="Code not found")
    if code["valid_from"] > now or code["valid_until"] < now:
        return DiscountValidateResponse(valid=False, message="Code has expired")
    if code.get("max_uses") and code["times_used"] >= code["max_uses"]:
        return DiscountValidateResponse(valid=False, message="Code usage limit reached")

    return DiscountValidateResponse(
        valid=True,
        discount_percent=code["discount_percent"],
        message=f"{code['discount_percent']}% discount applied!",
    )


# ---- Admin ----

@router.get("/", response_model=List[DiscountCodeResponse])
async def list_discounts(_admin=Depends(require_admin)):
    return await discount_codes_collection.find().sort("created_at", -1).to_list(500)


@router.post("/", response_model=DiscountCodeResponse, status_code=201)
async def create_discount(data: DiscountCodeCreate, _admin=Depends(require_admin)):
    if await discount_codes_collection.find_one({"code": data.code.upper()}):
        raise HTTPException(status_code=409, detail="Discount code already exists")

    code_id = await get_next_sequence("discount_codes")
    now = datetime.now(timezone.utc)
    doc = {
        "id": code_id,
        "code": data.code.upper(),
        "discount_percent": data.discount_percent,
        "max_uses": data.max_uses,
        "times_used": 0,
        "is_active": True,
        "valid_from": data.valid_from,
        "valid_until": data.valid_until,
        "created_at": now,
    }
    await discount_codes_collection.insert_one(doc)
    return doc


@router.delete("/{code_id}", status_code=204)
async def delete_discount(code_id: int, _admin=Depends(require_admin)):
    result = await discount_codes_collection.delete_one({"id": code_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Discount code not found")
