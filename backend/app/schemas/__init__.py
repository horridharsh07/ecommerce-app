from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.domain import OrderStatus, ReviewStatus


# ===================================================================
# Auth / User Schemas
# ===================================================================

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ===================================================================
# Category Schemas
# ===================================================================

class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ===================================================================
# Product Schemas
# ===================================================================

class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    price: float = Field(gt=0)
    image_url: Optional[str] = None
    stock: int = Field(ge=0, default=0)
    category_id: Optional[int] = None
    top_notes: Optional[str] = None
    mid_notes: Optional[str] = None
    base_notes: Optional[str] = None
    burn_time: Optional[str] = None
    wax_type: Optional[str] = None
    weight: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    top_notes: Optional[str] = None
    mid_notes: Optional[str] = None
    base_notes: Optional[str] = None
    burn_time: Optional[str] = None
    wax_type: Optional[str] = None
    weight: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    price: float
    image_url: Optional[str] = None
    stock: int
    is_active: bool
    category_id: Optional[int] = None
    category: Optional[CategoryResponse] = None
    top_notes: Optional[str] = None
    mid_notes: Optional[str] = None
    base_notes: Optional[str] = None
    burn_time: Optional[str] = None
    wax_type: Optional[str] = None
    weight: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    per_page: int


# ===================================================================
# Review Schemas
# ===================================================================

class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    comment: Optional[str] = None
    status: ReviewStatus
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# ===================================================================
# Order Schemas
# ===================================================================

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(min_length=1)
    discount_code: Optional[str] = None
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str = Field(min_length=6, max_length=6)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_purchase: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: OrderStatus
    total_amount: float
    discount_applied: float
    razorpay_order_id: Optional[str] = None
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    items: List[OrderItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ===================================================================
# Discount Code Schemas
# ===================================================================

class DiscountCodeCreate(BaseModel):
    code: str = Field(min_length=3, max_length=50)
    discount_percent: float = Field(gt=0, le=100)
    max_uses: Optional[int] = Field(None, gt=0)
    valid_from: datetime
    valid_until: datetime

    @field_validator("valid_until")
    @classmethod
    def end_after_start(cls, v, info):
        if "valid_from" in info.data and v <= info.data["valid_from"]:
            raise ValueError("valid_until must be after valid_from")
        return v


class DiscountCodeResponse(BaseModel):
    id: int
    code: str
    discount_percent: float
    max_uses: Optional[int] = None
    times_used: int
    is_active: bool
    valid_from: datetime
    valid_until: datetime

    class Config:
        from_attributes = True


class DiscountValidateRequest(BaseModel):
    code: str


class DiscountValidateResponse(BaseModel):
    valid: bool
    discount_percent: Optional[float] = None
    message: str


# ===================================================================
# Analytics Schemas
# ===================================================================

class DashboardStats(BaseModel):
    total_revenue: float
    total_orders: int
    total_users: int
    total_products: int
    pending_orders: int
    low_stock_products: int          # stock < 5


class SalesDataPoint(BaseModel):
    date: str                         # "2026-04-19"
    revenue: float
    order_count: int
