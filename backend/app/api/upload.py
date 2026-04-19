import os
import shutil
from uuid import uuid4
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.core.security import require_admin
from app.core.database import get_db
from app.models.domain import ProductMedia

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov"}
VIDEO_EXTENSIONS = {".mp4", ".mov"}


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    _admin=Depends(require_admin),
):
    """Upload a single media file. Returns the URL and detected media type."""
    ext = os.path.splitext(file.filename or "")[1].lower()

    if ext not in VALID_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: JPG, PNG, WEBP, MP4, MOV.",
        )

    # UUID filename prevents collisions and path-traversal
    unique_name = f"{uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    media_type = "video" if ext in VIDEO_EXTENSIONS else "image"
    return {"url": f"/static/uploads/{unique_name}", "media_type": media_type}


@router.delete("/media/{media_id}")
async def delete_media(
    media_id: int,
    _admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a product media entry and its physical file."""
    media = db.query(ProductMedia).filter(ProductMedia.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Try to remove the physical file
    file_path = os.path.join(UPLOAD_DIR, os.path.basename(media.url))
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(media)
    db.commit()
    return {"detail": "Media deleted"}
