"""
MongoDB connection manager using Motor (async driver).
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ReturnDocument
from app.core.config import get_settings

settings = get_settings()

client = AsyncIOMotorClient(
    settings.MONGODB_URL, serverSelectionTimeoutMS=5000
)
db = client[settings.DATABASE_NAME]


# ── Collection references ──
users_collection = db["users"]
products_collection = db["products"]
categories_collection = db["categories"]
orders_collection = db["orders"]
reviews_collection = db["reviews"]
discount_codes_collection = db["discount_codes"]
site_content_collection = db["site_content"]
product_media_collection = db["product_media"]
counters_collection = db["counters"]


async def get_next_sequence(name: str) -> int:
    """Auto-increment helper — mimics SQL integer PKs for cleaner IDs."""
    result = await counters_collection.find_one_and_update(
        {"_id": name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return result["seq"]


async def create_indexes():
    """Create required indexes on startup."""
    await users_collection.create_index("email", unique=True)
    await products_collection.create_index("slug", unique=True)
    await categories_collection.create_index("slug", unique=True)
    await discount_codes_collection.create_index("code", unique=True)
    await reviews_collection.create_index([("product_id", 1), ("user_id", 1)], unique=True)
    await orders_collection.create_index("user_id")
