"""
Luma Candles API — FastAPI + MongoDB (Motor async driver).
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.database import create_indexes
from app.api import auth, products, categories, orders, reviews, discounts, analytics, upload, content


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    # ── Startup ──
    try:
        await create_indexes()
        print("✅ MongoDB indexes ensured.")

        # Auto-seed if DB is empty
        from app.core.database import users_collection
        admin_exists = await users_collection.find_one({"is_admin": True})
        if not admin_exists:
            from app.seed import run_seed
            await run_seed()
            print("🎉 Database automatically seeded on startup.")
    except Exception as e:
        print(f"MongoDB startup tasks skipped (is MongoDB running?): {e}")

    yield
    # ── Shutdown ──
    print("👋 Shutting down.")


app = FastAPI(
    title="Luma Candles API",
    description="Production-grade backend for the Luma Candles e-commerce platform — MongoDB edition",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend
origins = [
    "https://ecommerce-app-nine-ivory.vercel.app",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
app.include_router(upload.router)
app.include_router(content.router)

# Static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/", tags=["health"])
async def health_check():
    return {"status": "online", "service": "Luma Candles API v3.0.0", "database": "MongoDB"}
