"""
Site content routes — async MongoDB.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

from app.core.database import site_content_collection, get_next_sequence
from app.core.security import require_admin

router = APIRouter(prefix="/api/content", tags=["content"])


class ContentUpdateInfo(BaseModel):
    key: str
    value: str


class ContentBatchUpdate(BaseModel):
    items: List[ContentUpdateInfo]


@router.get("/")
async def get_all_content():
    docs = await site_content_collection.find().to_list(200)
    return {doc["key"]: doc["value"] for doc in docs}


@router.put("/")
async def update_content(data: ContentBatchUpdate, _admin=Depends(require_admin)):
    for item in data.items:
        existing = await site_content_collection.find_one({"key": item.key})
        if existing:
            await site_content_collection.update_one(
                {"key": item.key}, {"$set": {"value": item.value}}
            )
        else:
            content_id = await get_next_sequence("site_content")
            await site_content_collection.insert_one({
                "id": content_id,
                "section": "general",
                "key": item.key,
                "value": item.value,
            })
    return {"message": "Content updated successfully"}
