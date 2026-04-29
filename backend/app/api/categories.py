"""
Category routes — async MongoDB.
"""

import re
from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.core.database import categories_collection, get_next_sequence
from app.core.security import require_admin
from app.schemas import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryResponse])
async def list_categories():
    docs = await categories_collection.find().sort("name", 1).to_list(200)
    return [CategoryResponse(**d) for d in docs]


@router.post("/", response_model=CategoryResponse, status_code=201)
async def create_category(data: CategoryCreate, _admin=Depends(require_admin)):
    slug = re.sub(r"[^a-z0-9]+", "-", data.name.lower()).strip("-")
    if await categories_collection.find_one({"slug": slug}):
        raise HTTPException(status_code=409, detail="Category already exists")

    cat_id = await get_next_sequence("categories")
    doc = {"id": cat_id, "name": data.name, "slug": slug, "description": data.description}
    await categories_collection.insert_one(doc)
    return CategoryResponse(**doc)


@router.delete("/{category_id}", status_code=204)
async def delete_category(category_id: int, _admin=Depends(require_admin)):
    result = await categories_collection.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
