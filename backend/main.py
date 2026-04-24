from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.database import engine, Base
from app.api import auth, products, categories, orders, reviews, discounts, analytics, proxy, upload, content

# Create all tables (also creates new tables like product_media)
Base.metadata.create_all(bind=engine)

# Migrate existing tables: add new columns that don't exist yet
from sqlalchemy import inspect as _sa_inspect, text as _sa_text

def _run_migrations():
    insp = _sa_inspect(engine)
    if not insp.has_table("site_content"):
        # Auto create missing tables (e.g. SiteContent if newly added)
        Base.metadata.create_all(bind=engine, tables=[Base.metadata.tables.get('site_content')])
        
    if insp.has_table("products"):
        cols = [c["name"] for c in insp.get_columns("products")]
        with engine.connect() as conn:
            if "is_featured" not in cols:
                conn.execute(_sa_text("ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT 0 NOT NULL"))
            if "compare_at_price" not in cols:
                conn.execute(_sa_text("ALTER TABLE products ADD COLUMN compare_at_price FLOAT DEFAULT NULL"))
            if "discount_percent" not in cols:
                conn.execute(_sa_text("ALTER TABLE products ADD COLUMN discount_percent FLOAT DEFAULT NULL"))
            conn.commit()

_run_migrations()

app = FastAPI(
    title="Luma Candles API",
    description="Production-grade backend for the Luma Candles e-commerce platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
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
    allow_headers=["*"]
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
app.include_router(content.router)

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
def health_check():
    return {"status": "online", "service": "Luma Candles API v2.0.0"}
