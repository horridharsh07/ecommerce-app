from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import require_admin
from app.models.domain import Order, User, Product, OrderStatus
from app.schemas import DashboardStats, SalesDataPoint
from typing import List

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    total_revenue = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0.0))
        .filter(Order.status != OrderStatus.CANCELLED)
        .scalar()
    )
    total_orders = db.query(Order).count()
    total_users = db.query(User).filter(User.is_admin == False).count()
    total_products = db.query(Product).count()
    pending_orders = db.query(Order).filter(Order.status == OrderStatus.PENDING).count()
    low_stock = db.query(Product).filter(Product.stock < 5, Product.is_active == True).count()

    return DashboardStats(
        total_revenue=round(float(total_revenue), 2),
        total_orders=total_orders,
        total_users=total_users,
        total_products=total_products,
        pending_orders=pending_orders,
        low_stock_products=low_stock,
    )


@router.get("/sales", response_model=List[SalesDataPoint])
def get_sales_chart(
    days: int = 30,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(
            func.date(Order.created_at).label("day"),
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("order_count"),
        )
        .filter(Order.created_at >= since, Order.status != OrderStatus.CANCELLED)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )
    return [
        SalesDataPoint(date=str(r.day), revenue=round(float(r.revenue), 2), order_count=r.order_count)
        for r in rows
    ]
