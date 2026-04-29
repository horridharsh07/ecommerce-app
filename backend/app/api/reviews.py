"""
Review routes — async MongoDB.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone

from app.core.database import reviews_collection, users_collection, get_next_sequence
from app.core.security import get_current_user, require_admin
from app.models.domain import ReviewStatus
from app.schemas import ReviewCreate, ReviewResponse, UserResponse

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


async def _enrich_review(doc: dict) -> dict:
    """Attach user info to review."""
    user = await users_collection.find_one({"id": doc["user_id"]})
    if user:
        doc["user"] = UserResponse(
            id=user["id"], email=user["email"], full_name=user["full_name"],
            phone=user.get("phone"), is_admin=user.get("is_admin", False),
            created_at=user["created_at"],
        )
    return doc


@router.post("/", response_model=ReviewResponse, status_code=201)
async def submit_review(data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    existing = await reviews_collection.find_one({
        "user_id": current_user["id"], "product_id": data.product_id,
    })
    if existing:
        raise HTTPException(status_code=409, detail="You have already reviewed this product")

    review_id = await get_next_sequence("reviews")
    now = datetime.now(timezone.utc)
    doc = {
        "id": review_id,
        "user_id": current_user["id"],
        "product_id": data.product_id,
        "rating": data.rating,
        "comment": data.comment,
        "status": ReviewStatus.PENDING.value,
        "created_at": now,
    }
    await reviews_collection.insert_one(doc)
    return await _enrich_review(doc)


@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(product_id: int):
    docs = await (
        reviews_collection.find({"product_id": product_id, "status": ReviewStatus.APPROVED.value})
        .sort("created_at", -1)
        .to_list(200)
    )
    return [await _enrich_review(d) for d in docs]


@router.get("/pending", response_model=List[ReviewResponse])
async def list_pending_reviews(_admin=Depends(require_admin)):
    docs = await reviews_collection.find({"status": ReviewStatus.PENDING.value}).to_list(200)
    return [await _enrich_review(d) for d in docs]


@router.patch("/{review_id}/approve", response_model=ReviewResponse)
async def approve_review(review_id: int, _admin=Depends(require_admin)):
    result = await reviews_collection.update_one(
        {"id": review_id}, {"$set": {"status": ReviewStatus.APPROVED.value}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    doc = await reviews_collection.find_one({"id": review_id})
    return await _enrich_review(doc)


@router.patch("/{review_id}/reject", response_model=ReviewResponse)
async def reject_review(review_id: int, _admin=Depends(require_admin)):
    result = await reviews_collection.update_one(
        {"id": review_id}, {"$set": {"status": ReviewStatus.REJECTED.value}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    doc = await reviews_collection.find_one({"id": review_id})
    return await _enrich_review(doc)
