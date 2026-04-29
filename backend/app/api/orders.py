"""
Order routes — async MongoDB.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone
import os

from app.core.database import (
    orders_collection, products_collection, discount_codes_collection,
    get_next_sequence,
)
from app.core.security import get_current_user, require_admin
from app.models.domain import OrderStatus
from app.schemas import OrderCreate, OrderResponse, OrderStatusUpdate

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_dummykey123")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "dummysecret123")

try:
    import razorpay
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
except Exception:
    razorpay_client = None

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(data: OrderCreate, current_user: dict = Depends(get_current_user)):
    total = 0.0
    order_items = []

    for item in data.items:
        product = await products_collection.find_one({"id": item.product_id})
        if not product or not product.get("is_active", True):
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product["stock"] < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product['name']}'. Available: {product['stock']}",
            )
        total += product["price"] * item.quantity
        order_items.append({"product": product, "quantity": item.quantity})

    # Apply discount
    discount_applied = 0.0
    if data.discount_code:
        now = datetime.now(timezone.utc)
        code = await discount_codes_collection.find_one({
            "code": data.discount_code.upper(), "is_active": True,
        })
        if not code or code["valid_from"] > now or code["valid_until"] < now:
            raise HTTPException(status_code=400, detail="Invalid or expired discount code")
        if code.get("max_uses") and code["times_used"] >= code["max_uses"]:
            raise HTTPException(status_code=400, detail="Discount code usage limit reached")
        discount_applied = round(total * (code["discount_percent"] / 100), 2)
        await discount_codes_collection.update_one(
            {"id": code["id"]}, {"$inc": {"times_used": 1}}
        )

    order_id = await get_next_sequence("orders")
    now = datetime.now(timezone.utc)

    items_for_doc = [
        {"product_id": oi["product"]["id"], "quantity": oi["quantity"],
         "price_at_purchase": oi["product"]["price"]}
        for oi in order_items
    ]

    order_doc = {
        "id": order_id,
        "user_id": current_user["id"],
        "status": OrderStatus.PENDING.value,
        "total_amount": round(total - discount_applied, 2),
        "discount_applied": discount_applied,
        "shipping_address": data.shipping_address,
        "shipping_city": data.shipping_city,
        "shipping_state": data.shipping_state,
        "shipping_pincode": data.shipping_pincode,
        "razorpay_order_id": None,
        "items": items_for_doc,
        "created_at": now,
        "updated_at": now,
    }

    # Razorpay order
    if razorpay_client:
        try:
            rzp_order = razorpay_client.order.create({
                "amount": int(order_doc["total_amount"] * 100),
                "currency": "INR",
                "receipt": f"order_rcptid_{order_id}",
            })
            order_doc["razorpay_order_id"] = rzp_order.get("id")
        except Exception as e:
            print("Razorpay Error:", e)

    await orders_collection.insert_one(order_doc)

    # Deduct stock
    for oi in order_items:
        await products_collection.update_one(
            {"id": oi["product"]["id"]},
            {"$inc": {"stock": -oi["quantity"]}},
        )

    return order_doc


@router.get("/", response_model=List[OrderResponse])
async def list_my_orders(current_user: dict = Depends(get_current_user)):
    docs = await (
        orders_collection.find({"user_id": current_user["id"]})
        .sort("created_at", -1)
        .to_list(500)
    )
    return docs


@router.get("/all", response_model=List[OrderResponse])
async def list_all_orders(_admin=Depends(require_admin)):
    return await orders_collection.find().sort("created_at", -1).to_list(1000)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, current_user: dict = Depends(get_current_user)):
    order = await orders_collection.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["user_id"] != current_user["id"] and not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Access denied")
    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int, data: OrderStatusUpdate, _admin=Depends(require_admin)
):
    order = await orders_collection.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore stock if cancelling
    if data.status == OrderStatus.CANCELLED and order["status"] != OrderStatus.CANCELLED.value:
        for item in order.get("items", []):
            await products_collection.update_one(
                {"id": item["product_id"]},
                {"$inc": {"stock": item["quantity"]}},
            )

    await orders_collection.update_one(
        {"id": order_id},
        {"$set": {"status": data.status.value, "updated_at": datetime.now(timezone.utc)}},
    )
    return await orders_collection.find_one({"id": order_id})
