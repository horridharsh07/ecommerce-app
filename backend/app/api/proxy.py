import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from urllib.parse import unquote
import io

router = APIRouter(prefix="/api/proxy", tags=["proxy"])


@router.get("/image")
async def proxy_image(url: str):
    """
    Proxies an external image URL through our backend to bypass
    Instagram's Cross-Origin-Resource-Policy restrictions.
    Usage: /api/proxy/image?url=https://instagram...
    """
    decoded_url = unquote(url)

    if not decoded_url.startswith("https://instagram."):
        raise HTTPException(status_code=400, detail="Only Instagram image URLs are allowed")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(decoded_url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://www.instagram.com/",
            })
            resp.raise_for_status()
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Failed to fetch image from source")

    content_type = resp.headers.get("content-type", "image/jpeg")

    return StreamingResponse(
        io.BytesIO(resp.content),
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=86400"},  # cache 24h
    )
