"""
Analytics routes — async MongoDB aggregation.
"""

from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone

from app.core.database import orders_collection, users_collection, products_collection
from app.core.security import require_admin
from app.models.domain import OrderStatus
from app.schemas import DashboardStats, SalesDataPoint
from typing import List

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(_admin=Depends(require_admin)):
    # Total revenue (non-cancelled orders)
    pipeline = [
        {"$match": {"status": {"$ne": OrderStatus.CANCELLED.value}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}},
    ]
    agg = await orders_collection.aggregate(pipeline).to_list(1)
    total_revenue = round(agg[0]["total"], 2) if agg else 0.0

    total_orders = await orders_collection.count_documents({})
    total_users = await users_collection.count_documents({"is_admin": False})
    total_products = await products_collection.count_documents({})
    pending_orders = await orders_collection.count_documents({"status": OrderStatus.PENDING.value})
    low_stock = await products_collection.count_documents({"stock": {"$lt": 5}, "is_active": True})

    return DashboardStats(
        total_revenue=total_revenue,
        total_orders=total_orders,
        total_users=total_users,
        total_products=total_products,
        pending_orders=pending_orders,
        low_stock_products=low_stock,
    )


@router.get("/sales", response_model=List[SalesDataPoint])
async def get_sales_chart(days: int = 30, _admin=Depends(require_admin)):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    pipeline = [
        {"$match": {"created_at": {"$gte": since}, "status": {"$ne": OrderStatus.CANCELLED.value}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "revenue": {"$sum": "$total_amount"},
            "order_count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    rows = await orders_collection.aggregate(pipeline).to_list(days + 1)
    return [
        SalesDataPoint(date=r["_id"], revenue=round(r["revenue"], 2), order_count=r["order_count"])
        for r in rows
    ]
