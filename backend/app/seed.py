"""
Seed script: populates the database with initial categories, an admin user, and products.
Run with: python -m app.seed
"""
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.domain import User, Category, Product

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# --- Admin user ---
admin = db.query(User).filter(User.email == "admin@lumacandles.in").first()
if not admin:
    admin = User(
        email="admin@lumacandles.in",
        hashed_password=hash_password("LumaAdmin2026!"),
        full_name="Luma Admin",
        is_admin=True,
    )
    db.add(admin)
    db.commit()
    print("✅ Admin user created (admin@lumacandles.in / LumaAdmin2026!)")
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
    if not db.query(Category).filter(Category.slug == slug).first():
        db.add(Category(name=name, slug=slug, description=desc))
        print(f"  ✅ Category: {name}")

db.commit()

# --- Products ---
woody = db.query(Category).filter(Category.slug == "woody").first()
floral = db.query(Category).filter(Category.slug == "floral").first()
fresh = db.query(Category).filter(Category.slug == "fresh").first()
spiced = db.query(Category).filter(Category.slug == "spiced").first()

PRODUCTS = [
    {
        "name": "Santal Blush",
        "slug": "santal-blush",
        "description": "A warm, enveloping blend of rich sandalwood and soft rose petals. The perfect candle for winding down after a long day.",
        "price": 2499.0,
        "image_url": "https://instagram.fluh1-2.fna.fbcdn.net/v/t51.82787-15/669835415_17879990529552870_8453002260224505071_n.webp?stp=dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=instagram.fluh1-2.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2gHqOYSVMDdHYerLtIJa2lIupHjGe5j6W--Np1ffK-fzBXnwe49P-GRN8L99H94P9a6hlYMrSR9M_cVqsqHF2F7_&_nc_ohc=Fp2-C082qwYQ7kNvwFHN9F9&_nc_gid=RaZJxYZaF74tQi7KQafanw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af3-XEDLkM-vjfCPecuQEhiqUX4G8dNRL1uiM0ceSyvgKA&oe=69EA9333&_nc_sid=8b3546",
        "stock": 25,
        "category_id": woody.id if woody else None,
        "top_notes": "Rose Water",
        "mid_notes": "Cardamom",
        "base_notes": "Sandalwood",
        "burn_time": "~60 hours",
        "wax_type": "Coconut Soy",
        "weight": "300g",
    },
    {
        "name": "Midnight Fig",
        "slug": "midnight-fig",
        "description": "Dark, sweet fig wrapped in earthy, grounding patchouli. A decadent, moody scent for late evenings.",
        "price": 2199.0,
        "image_url": "https://instagram.fluh1-2.fna.fbcdn.net/v/t51.82787-15/662595575_17868681720603138_3967954139308282128_n.webp?stp=dst-jpg_e35_p640x640_sh0.08_tt6&_nc_ht=instagram.fluh1-2.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2gHqOYSVMDdHYerLtIJa2lIupHjGe5j6W--Np1ffK-fzBXnwe49P-GRN8L99H94P9a6hlYMrSR9M_cVqsqHF2F7_&_nc_ohc=OAgdcltNwckQ7kNvwH7zvNa&_nc_gid=RaZJxYZaF74tQi7KQafanw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af1iAQH4JjrxUOl2h6wCbKYveOMVxb62xVp4XAZvLT1bbA&oe=69EA8E7C&_nc_sid=8b3546",
        "stock": 18,
        "category_id": woody.id if woody else None,
        "top_notes": "Ripe Fig",
        "mid_notes": "Cedar",
        "base_notes": "Patchouli",
        "burn_time": "~55 hours",
        "wax_type": "Coconut Soy",
        "weight": "280g",
    },
    {
        "name": "Cloud Nine",
        "slug": "cloud-nine",
        "description": "Airy vanilla and clean linen. Our lightest, most comforting burn — like fresh sheets on a Sunday morning.",
        "price": 1899.0,
        "image_url": "https://instagram.fluh1-2.fna.fbcdn.net/v/t51.82787-15/651760186_17874610566552870_4682752511604689303_n.webp?stp=dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=instagram.fluh1-2.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2gHqOYSVMDdHYerLtIJa2lIupHjGe5j6W--Np1ffK-fzBXnwe49P-GRN8L99H94P9a6hlYMrSR9M_cVqsqHF2F7_&_nc_ohc=-SQKmqejioQQ7kNvwGNWy9I&_nc_gid=RaZJxYZaF74tQi7KQafanw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af1rM3VcBCfIX9angZaqbFyCqFD1jQs5jq5AtZmC7gyF2g&oe=69EA86C8&_nc_sid=8b3546",
        "stock": 30,
        "category_id": fresh.id if fresh else None,
        "top_notes": "Linen",
        "mid_notes": "White Tea",
        "base_notes": "Vanilla Bean",
        "burn_time": "~60 hours",
        "wax_type": "Coconut Soy",
        "weight": "300g",
    },
    {
        "name": "Smoked Ember",
        "slug": "smoked-ember",
        "description": "Evokes the memory of a dying fire in a winter cabin. Bold, smoky, and utterly unforgettable.",
        "price": 2999.0,
        "image_url": "https://instagram.fluh1-2.fna.fbcdn.net/v/t51.82787-15/651097502_17874471846552870_9121783341167476345_n.webp?stp=dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=instagram.fluh1-2.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2gHqOYSVMDdHYerLtIJa2lIupHjGe5j6W--Np1ffK-fzBXnwe49P-GRN8L99H94P9a6hlYMrSR9M_cVqsqHF2F7_&_nc_ohc=qJYFEYgaLzsQ7kNvwHCG9zY&_nc_gid=RaZJxYZaF74tQi7KQafanw&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af22JE0HJzNtnTi9WVWpu_AhZM9Cw-H-SypYniaD8hGMFQ&oe=69EA7FB0&_nc_sid=8b3546",
        "stock": 12,
        "category_id": spiced.id if spiced else None,
        "top_notes": "Bergamot",
        "mid_notes": "Leather",
        "base_notes": "Smoked Ash",
        "burn_time": "~65 hours",
        "wax_type": "Coconut Soy",
        "weight": "350g",
    },
    {
        "name": "Petal Soft",
        "slug": "petal-soft",
        "description": "A delicate garden of peony and jasmine that fills any room with quiet elegance.",
        "price": 2299.0,
        "image_url": "https://instagram.fluh1-2.fna.fbcdn.net/v/t51.82787-15/640412026_17872969923552870_3356895958519274455_n.webp?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6",
        "stock": 20,
        "category_id": floral.id if floral else None,
        "top_notes": "Peony",
        "mid_notes": "Jasmine",
        "base_notes": "Musk",
        "burn_time": "~55 hours",
        "wax_type": "Coconut Soy",
        "weight": "280g",
    },
    {
        "name": "Golden Hour",
        "slug": "golden-hour",
        "description": "Warm amber and honey with a whisper of tonka bean. The scent of sunlight through curtains.",
        "price": 2699.0,
        "image_url": "https://instagram.fluh1-2.fna.fbcdn.net/v/t51.82787-15/640891342_17872732722552870_9046761802484785823_n.webp?stp=dst-jpg_e15_fr_p1080x1080_tt6",
        "stock": 15,
        "category_id": spiced.id if spiced else None,
        "top_notes": "Honey",
        "mid_notes": "Amber",
        "base_notes": "Tonka Bean",
        "burn_time": "~60 hours",
        "wax_type": "Coconut Soy",
        "weight": "300g",
    },
]

for p in PRODUCTS:
    if not db.query(Product).filter(Product.slug == p["slug"]).first():
        db.add(Product(**p))
        print(f"  ✅ Product: {p['name']}")

db.commit()
db.close()
print("\n🎉 Database seeded successfully!")
