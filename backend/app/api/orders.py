from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.domain import Order, OrderItem, Product, DiscountCode, OrderStatus, User
from app.schemas import OrderCreate, OrderResponse, OrderStatusUpdate
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Validate products and compute total
    total = 0.0
    order_items = []
    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock}",
            )
        total += product.price * item.quantity
        order_items.append((product, item.quantity))

    # 2. Apply discount if provided
    discount_applied = 0.0
    if data.discount_code:
        code = (
            db.query(DiscountCode)
            .filter(DiscountCode.code == data.discount_code.upper(), DiscountCode.is_active == True)
            .first()
        )
        now = datetime.utcnow()
        if not code or code.valid_from > now or code.valid_until < now:
            raise HTTPException(status_code=400, detail="Invalid or expired discount code")
        if code.max_uses and code.times_used >= code.max_uses:
            raise HTTPException(status_code=400, detail="Discount code usage limit reached")

        discount_applied = round(total * (code.discount_percent / 100), 2)
        code.times_used += 1

    # 3. Create order
    order = Order(
        user_id=current_user.id,
        total_amount=round(total - discount_applied, 2),
        discount_applied=discount_applied,
        shipping_address=data.shipping_address,
        shipping_city=data.shipping_city,
        shipping_state=data.shipping_state,
        shipping_pincode=data.shipping_pincode,
    )
    db.add(order)
    db.flush()  # get order.id before adding items

    # 4. Create order items and deduct stock
    for product, qty in order_items:
        db.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            price_at_purchase=product.price,
        ))
        product.stock -= qty

    db.commit()
    db.refresh(order)
    return order


@router.get("/", response_model=List[OrderResponse])
def list_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/all", response_model=List[OrderResponse])
def list_all_orders(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return db.query(Order).order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")
    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore stock if cancelling
    if data.status == OrderStatus.CANCELLED and order.status != OrderStatus.CANCELLED:
        for item in order.items:
            item.product.stock += item.quantity

    order.status = data.status
    db.commit()
    db.refresh(order)
    return order
