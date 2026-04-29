"""
Domain / document models — plain Pydantic models that mirror MongoDB documents.
These are NOT SQLAlchemy ORM models. They define the shape of documents stored in Mongo.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class ReviewStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class UserDoc(BaseModel):
    id: int
    email: str
    hashed_password: str
    full_name: str
    phone: Optional[str] = None
    is_admin: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------

class CategoryDoc(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None


# ---------------------------------------------------------------------------
# Product
# ---------------------------------------------------------------------------

class ProductDoc(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    price: float
    compare_at_price: Optional[float] = None
    discount_percent: Optional[float] = None
    image_url: Optional[str] = None
    stock: int = 0
    is_active: bool = True
    is_featured: bool = False
    category_id: Optional[int] = None

    # Sensory profile
    top_notes: Optional[str] = None
    mid_notes: Optional[str] = None
    base_notes: Optional[str] = None
    burn_time: Optional[str] = None
    wax_type: Optional[str] = None
    weight: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# ProductMedia
# ---------------------------------------------------------------------------

class ProductMediaDoc(BaseModel):
    id: int
    product_id: int
    url: str
    media_type: str = "image"
    sort_order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# Order
# ---------------------------------------------------------------------------

class OrderItemDoc(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: float


class OrderDoc(BaseModel):
    id: int
    user_id: int
    status: OrderStatus = OrderStatus.PENDING
    total_amount: float
    discount_applied: float = 0.0

    # Razorpay fields
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None

    # Shipping
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_pincode: Optional[str] = None

    items: List[OrderItemDoc] = []

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# Review
# ---------------------------------------------------------------------------

class ReviewDoc(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    comment: Optional[str] = None
    status: ReviewStatus = ReviewStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# DiscountCode
# ---------------------------------------------------------------------------

class DiscountCodeDoc(BaseModel):
    id: int
    code: str
    discount_percent: float
    max_uses: Optional[int] = None
    times_used: int = 0
    is_active: bool = True
    valid_from: datetime
    valid_until: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# SiteContent
# ---------------------------------------------------------------------------

class SiteContentDoc(BaseModel):
    id: int
    section: str
    key: str
    value: str
