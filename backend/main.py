from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.database import engine, Base
from app.api import auth, products, categories, orders, reviews, discounts, analytics, proxy, upload

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Luma Candles API",
    description="Production-grade backend for the Luma Candles e-commerce platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://lumacandles.vercel.app",     # production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(discounts.router)
app.include_router(analytics.router)
app.include_router(proxy.router)
app.include_router(upload.router)

static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/", tags=["health"])
def health_check():
    return {"status": "online", "service": "Luma Candles API v2.0.0"}
