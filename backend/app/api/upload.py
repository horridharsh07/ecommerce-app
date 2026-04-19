import os
import shutil
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from app.core.security import require_admin

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    _admin=Depends(require_admin)
):
    valid_extensions = {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov"}
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in valid_extensions:
         raise HTTPException(status_code=400, detail="Invalid file type. Only standard media allowed.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return the URL string to store in the DB
    return {"url": f"/static/uploads/{file.filename}"}
