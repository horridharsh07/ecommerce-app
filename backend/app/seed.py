"""
Seed script: populates MongoDB with initial categories, an admin user, and products.

Can be run standalone:  python -m app.seed
Or is called automatically on first startup from main.py lifespan.
"""

import asyncio
from datetime import datetime, timezone

from app.core.config import get_settings
from app.core.database import (
    users_collection, categories_collection, products_collection,
    product_media_collection, get_next_sequence, create_indexes,
)
from app.core.security import hash_password

settings = get_settings()


async def run_seed():
    await create_indexes()

    # --- Admin user ---
    admin = await users_collection.find_one({"email": settings.ADMIN_EMAIL})
    if not admin:
        admin_id = await get_next_sequence("users")
        now = datetime.now(timezone.utc)
        await users_collection.insert_one({
            "id": admin_id,
            "email": settings.ADMIN_EMAIL,
            "hashed_password": hash_password("LumaAdmin2026!"),
            "full_name": "Luma Admin",
            "phone": None,
            "is_admin": True,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        })
        print(f"✅ Admin user created ({settings.ADMIN_EMAIL} / LumaAdmin2026!)")
    else:
        print("⏭  Admin user already exists")

    # --- Categories ---
    CATEGORIES = [
        ("Woody", "woody", "Rich, earthy scents with sandalwood, cedar, and vetiver."),
        ("Floral", "floral", "Soft, romantic notes of rose, jasmine, and lavender."),
        ("Fresh", "fresh", "Clean, airy scents with linen, citrus, and sea salt."),
        ("Spiced", "spiced", "Warm, inviting aromas of cinnamon, cardamom, and clove."),
    ]

    for name, slug, desc in CATEGORIES:
        if not await categories_collection.find_one({"slug": slug}):
            cat_id = await get_next_sequence("categories")
            await categories_collection.insert_one({
                "id": cat_id, "name": name, "slug": slug, "description": desc,
            })
            print(f"  ✅ Category: {name}")

    # Fetch category ids for product references
    woody = await categories_collection.find_one({"slug": "woody"})
    floral = await categories_collection.find_one({"slug": "floral"})
    fresh = await categories_collection.find_one({"slug": "fresh"})
    spiced = await categories_collection.find_one({"slug": "spiced"})

    # --- Products ---
    PRODUCTS = [
        {
            "name": "Santal Blush",
            "slug": "santal-blush",
            "description": "A warm, enveloping blend of rich sandalwood and soft rose petals. The perfect candle for winding down after a long day.",
            "price": 2499.0,
            "image_url": "https://images.unsplash.com/photo-1602607711890-89d1e7a35d9f?w=600",
            "stock": 25,
            "category_id": woody["id"] if woody else None,
            "top_notes": "Rose Water", "mid_notes": "Cardamom", "base_notes": "Sandalwood",
            "burn_time": "~60 hours", "wax_type": "Coconut Soy", "weight": "300g",
            "is_featured": True,
        },
        {
            "name": "Midnight Fig",
            "slug": "midnight-fig",
            "description": "Dark, sweet fig wrapped in earthy, grounding patchouli. A decadent, moody scent for late evenings.",
            "price": 2199.0,
            "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600",
            "stock": 18,
            "category_id": woody["id"] if woody else None,
            "top_notes": "Ripe Fig", "mid_notes": "Cedar", "base_notes": "Patchouli",
            "burn_time": "~55 hours", "wax_type": "Coconut Soy", "weight": "280g",
            "is_featured": False,
        },
        {
            "name": "Cloud Nine",
            "slug": "cloud-nine",
            "description": "Airy vanilla and clean linen. Our lightest, most comforting burn — like fresh sheets on a Sunday morning.",
            "price": 1899.0,
            "image_url": "https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=600",
            "stock": 30,
            "category_id": fresh["id"] if fresh else None,
            "top_notes": "Linen", "mid_notes": "White Tea", "base_notes": "Vanilla Bean",
            "burn_time": "~60 hours", "wax_type": "Coconut Soy", "weight": "300g",
            "is_featured": True,
        },
        {
            "name": "Smoked Ember",
            "slug": "smoked-ember",
            "description": "Evokes the memory of a dying fire in a winter cabin. Bold, smoky, and utterly unforgettable.",
            "price": 2999.0,
            "image_url": "https://images.unsplash.com/photo-1608181831688-ba943fb1e14b?w=600",
            "stock": 12,
            "category_id": spiced["id"] if spiced else None,
            "top_notes": "Bergamot", "mid_notes": "Leather", "base_notes": "Smoked Ash",
            "burn_time": "~65 hours", "wax_type": "Coconut Soy", "weight": "350g",
            "is_featured": True,
        },
        {
            "name": "Petal Soft",
            "slug": "petal-soft",
            "description": "A delicate garden of peony and jasmine that fills any room with quiet elegance.",
            "price": 2299.0,
            "image_url": "https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?w=600",
            "stock": 20,
            "category_id": floral["id"] if floral else None,
            "top_notes": "Peony", "mid_notes": "Jasmine", "base_notes": "Musk",
            "burn_time": "~55 hours", "wax_type": "Coconut Soy", "weight": "280g",
            "is_featured": False,
        },
        {
            "name": "Golden Hour",
            "slug": "golden-hour",
            "description": "Warm amber and honey with a whisper of tonka bean. The scent of sunlight through curtains.",
            "price": 2699.0,
            "image_url": "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600",
            "stock": 15,
            "category_id": spiced["id"] if spiced else None,
            "top_notes": "Honey", "mid_notes": "Amber", "base_notes": "Tonka Bean",
            "burn_time": "~60 hours", "wax_type": "Coconut Soy", "weight": "300g",
            "is_featured": True,
        },
    ]

    now = datetime.now(timezone.utc)
    for p in PRODUCTS:
        if not await products_collection.find_one({"slug": p["slug"]}):
            prod_id = await get_next_sequence("products")
            doc = {**p, "id": prod_id, "is_active": True, "created_at": now, "updated_at": now}
            await products_collection.insert_one(doc)
            print(f"  ✅ Product: {p['name']}")

            # Create media entry from image_url
            if p.get("image_url"):
                media_id = await get_next_sequence("product_media")
                await product_media_collection.insert_one({
                    "id": media_id, "product_id": prod_id,
                    "url": p["image_url"], "media_type": "image",
                    "sort_order": 0, "created_at": now,
                })

    print("\n🎉 MongoDB seeded successfully!")


# Allow running standalone: python -m app.seed
if __name__ == "__main__":
    asyncio.run(run_seed())
