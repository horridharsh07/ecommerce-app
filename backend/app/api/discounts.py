from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import require_admin
from app.models.domain import DiscountCode
from app.schemas import (
    DiscountCodeCreate, DiscountCodeResponse,
    DiscountValidateRequest, DiscountValidateResponse,
)
from typing import List

router = APIRouter(prefix="/api/discounts", tags=["discounts"])


# ---- Public ----

@router.post("/validate", response_model=DiscountValidateResponse)
def validate_discount(data: DiscountValidateRequest, db: Session = Depends(get_db)):
    code = (
        db.query(DiscountCode)
        .filter(DiscountCode.code == data.code.upper(), DiscountCode.is_active == True)
        .first()
    )
    now = datetime.utcnow()
    if not code:
        return DiscountValidateResponse(valid=False, message="Code not found")
    if code.valid_from > now or code.valid_until < now:
        return DiscountValidateResponse(valid=False, message="Code has expired")
    if code.max_uses and code.times_used >= code.max_uses:
        return DiscountValidateResponse(valid=False, message="Code usage limit reached")

    return DiscountValidateResponse(
        valid=True,
        discount_percent=code.discount_percent,
        message=f"{code.discount_percent}% discount applied!",
    )


# ---- Admin ----

@router.get("/", response_model=List[DiscountCodeResponse])
def list_discounts(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return db.query(DiscountCode).order_by(DiscountCode.created_at.desc()).all()


@router.post("/", response_model=DiscountCodeResponse, status_code=201)
def create_discount(
    data: DiscountCodeCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    if db.query(DiscountCode).filter(DiscountCode.code == data.code.upper()).first():
        raise HTTPException(status_code=409, detail="Discount code already exists")

    code = DiscountCode(
        code=data.code.upper(),
        discount_percent=data.discount_percent,
        max_uses=data.max_uses,
        valid_from=data.valid_from,
        valid_until=data.valid_until,
    )
    db.add(code)
    db.commit()
    db.refresh(code)
    return code


@router.delete("/{code_id}", status_code=204)
def delete_discount(
    code_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    code = db.query(DiscountCode).filter(DiscountCode.id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Discount code not found")
    db.delete(code)
    db.commit()
