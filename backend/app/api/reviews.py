from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.domain import Review, ReviewStatus, User
from app.schemas import ReviewCreate, ReviewResponse
from typing import List

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("/", response_model=ReviewResponse, status_code=201)
def submit_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(Review)
        .filter(Review.user_id == current_user.id, Review.product_id == data.product_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="You have already reviewed this product")

    review = Review(
        user_id=current_user.id,
        product_id=data.product_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.product_id == product_id, Review.status == ReviewStatus.APPROVED)
        .order_by(Review.created_at.desc())
        .all()
    )


@router.get("/pending", response_model=List[ReviewResponse])
def list_pending_reviews(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return db.query(Review).filter(Review.status == ReviewStatus.PENDING).all()


@router.patch("/{review_id}/approve", response_model=ReviewResponse)
def approve_review(
    review_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.status = ReviewStatus.APPROVED
    db.commit()
    db.refresh(review)
    return review


@router.patch("/{review_id}/reject", response_model=ReviewResponse)
def reject_review(
    review_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.status = ReviewStatus.REJECTED
    db.commit()
    db.refresh(review)
    return review
