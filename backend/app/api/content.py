from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.domain import SiteContent
from app.core.security import require_admin
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter(prefix="/api/content", tags=["content"])

class ContentUpdateInfo(BaseModel):
    key: str
    value: str

class ContentBatchUpdate(BaseModel):
    items: List[ContentUpdateInfo]

@router.get("/")
def get_all_content(db: Session = Depends(get_db)):
    content = db.query(SiteContent).all()
    # return as dictionary for easy frontend parsing key:value
    return {item.key: item.value for item in content}

@router.put("/")
def update_content(data: ContentBatchUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    for item in data.items:
        record = db.query(SiteContent).filter(SiteContent.key == item.key).first()
        if record:
            record.value = item.value
        else:
            new_record = SiteContent(section="general", key=item.key, value=item.value)
            db.add(new_record)
    db.commit()
    return {"message": "Content updated successfully"}
