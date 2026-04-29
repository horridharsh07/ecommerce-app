"""
Product routes — CRUD against MongoDB.
"""

import re
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timezone

from app.core.database import (
    products_collection,
    categories_collection,
    product_media_collection,
    get_next_sequence,
)
from app.core.security import require_admin
from app.schemas import (
    ProductCreate, ProductUpdate, ProductResponse,
    ProductListResponse, ProductMediaResponse, CategoryResponse,
)

router = APIRouter(prefix="/api/products", tags=["products"])


def _slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


async def _enrich_product(doc: dict) -> dict:
    """Attach category and media sub-documents for the response."""
    # Category
    category = None
    if doc.get("category_id"):
        cat = await categories_collection.find_one({"id": doc["category_id"]})
        if cat:
            category = CategoryResponse(
                id=cat["id"], name=cat["name"], slug=cat["slug"],
                description=cat.get("description"),
            )

    # Media
    media_docs = await product_media_collection.find(
        {"product_id": doc["id"]}
    ).sort("sort_order", 1).to_list(100)
    media = [
        ProductMediaResponse(
            id=m["id"], url=m["url"],
            media_type=m.get("media_type", "image"),
            sort_order=m.get("sort_order", 0),
        )
        for m in media_docs
    ]

    return {**doc, "category": category, "media": media}


# ---- Public ----

@router.get("/", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    all: bool = Query(False),
):
    query_filter: dict = {}
    if not all:
        query_filter["is_active"] = True

    if category:
        cat = await categories_collection.find_one({"slug": category})
        if cat:
            query_filter["category_id"] = cat["id"]
        else:
            return ProductListResponse(products=[], total=0, page=page, per_page=per_page)

    if search:
        query_filter["name"] = {"$regex": search, "$options": "i"}

    total = await products_collection.count_documents(query_filter)
    cursor = (
        products_collection.find(query_filter)
        .sort("created_at", -1)
        .skip((page - 1) * per_page)
        .limit(per_page)
    )
    docs = await cursor.to_list(per_page)
    products = [await _enrich_product(d) for d in docs]

    return ProductListResponse(products=products, total=total, page=page, per_page=per_page)


@router.get("/featured", response_model=List[ProductResponse])
async def list_featured():
    docs = await (
        products_collection.find({"is_active": True, "is_featured": True})
        .sort("created_at", -1)
        .limit(8)
        .to_list(8)
    )
    return [await _enrich_product(d) for d in docs]


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int):
    doc = await products_collection.find_one({"id": product_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return await _enrich_product(doc)


# ---- Admin ----

@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(data: ProductCreate, _admin=Depends(require_admin)):
    slug = _slugify(data.name)
    if await products_collection.find_one({"slug": slug}):
        raise HTTPException(status_code=409, detail="Product with this name already exists")

    product_id = await get_next_sequence("products")
    now = datetime.now(timezone.utc)

    product_doc = data.model_dump(exclude={"media_items"})
    product_doc.update({"id": product_id, "slug": slug, "created_at": now, "updated_at": now})
    await products_collection.insert_one(product_doc)

    # Create media entries
    if data.media_items:
        for i, item in enumerate(data.media_items):
            media_id = await get_next_sequence("product_media")
            await product_media_collection.insert_one({
                "id": media_id,
                "product_id": product_id,
                "url": item.url,
                "media_type": item.media_type,
                "sort_order": i,
                "created_at": now,
            })

    return await _enrich_product(product_doc)


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, data: ProductUpdate, _admin=Depends(require_admin)):
    doc = await products_collection.find_one({"id": product_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data:
        update_data["slug"] = _slugify(update_data["name"])
    update_data["updated_at"] = datetime.now(timezone.utc)

    await products_collection.update_one({"id": product_id}, {"$set": update_data})
    updated = await products_collection.find_one({"id": product_id})
    return await _enrich_product(updated)


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: int, _admin=Depends(require_admin)):
    result = await products_collection.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    # Clean up media
    await product_media_collection.delete_many({"product_id": product_id})
