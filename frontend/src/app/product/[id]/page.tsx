import { getProduct, getProductReviews } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/utils";
import AddToCartButton from "@/components/checkout/AddToCartButton";
import ReviewForm from "@/components/product/ReviewForm";
import MediaGallery from "@/components/product/MediaGallery";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProduct(Number(id));
    return {
      title: `${product.name} | Luma Candles`,
      description: product.description.substring(0, 160),
      openGraph: {
        title: `${product.name} | Luma Candles`,
        description: product.description.substring(0, 160),
        images: product.image_url ? [{ url: resolveMediaUrl(product.image_url) || "" }] : [],
      }
    };
  } catch {
    return { title: "Product | Luma Candles" };
  }
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  const reviews = await getProductReviews(Number(id));

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const notesString = [product.top_notes, product.mid_notes, product.base_notes]
    .filter(Boolean)
    .join(" — ");

  const cartProduct = {
    id: String(product.id),
    name: product.name,
    price: product.price,
    image: resolveMediaUrl(product.image_url) || "",
    description: product.description,
    notes: notesString,
  };

  return (
    <div className="min-h-screen px-8 py-12 lg:py-24">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
        {/* ─── Media Gallery ─── */}
        <div className="w-full md:w-1/2">
          <MediaGallery
            primaryImage={product.image_url}
            media={product.media || []}
            productName={product.name}
          />
        </div>

        {/* ─── Product Details ─── */}
        <div className="w-full md:w-1/2 flex flex-col justify-center animate-slide-up stagger-2">
          {product.category && (
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-primary/60 mb-3 animate-fade-in">
              {product.category.name}
            </p>
          )}
          <h1 className="font-serif text-5xl mb-3 text-foreground font-light">{product.name}</h1>
          <div className="flex gap-4 items-center mb-4">
            <span className="font-sans text-xl text-primary tracking-wider">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.compare_at_price && (
              <span className="font-sans text-lg text-primary/50 line-through tracking-wider">
                ₹{product.compare_at_price.toLocaleString("en-IN")}
              </span>
            )}
            {product.discount_percent && (
              <span className="bg-red-700/80 text-white text-[10px] uppercase tracking-[0.2em] px-2 py-1 font-sans rounded-sm">
                {product.discount_percent}% OFF
              </span>
            )}
          </div>

          {avgRating && (
            <p className="font-sans text-sm text-foreground/60 mb-8">
              ★ {avgRating} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          )}

          <p className="font-sans text-foreground/80 leading-relaxed mb-12 text-sm">
            {product.description}
          </p>

          {/* Scent Profile */}
          <div className="border-t border-b border-foreground/10 py-8 mb-12">
            <h3 className="font-sans uppercase tracking-[0.2em] text-xs font-bold text-foreground mb-4">
              Scent Profile
            </h3>
            {notesString && (
              <p className="font-serif italic text-primary/90 mb-3 text-sm">{notesString}</p>
            )}
            <div className="flex gap-4 text-xs font-sans text-foreground/50 uppercase tracking-widest">
              {product.burn_time && <span>{product.burn_time}</span>}
              {product.burn_time && product.wax_type && <span>•</span>}
              {product.wax_type && <span>{product.wax_type}</span>}
              {product.weight && <span>•</span>}
              {product.weight && <span>{product.weight}</span>}
            </div>
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-xs font-sans uppercase tracking-widest text-accent mb-6 animate-fade-in">
              Only {product.stock} left in stock
            </p>
          )}

          <div className="flex gap-4">
            {product.stock > 0 ? (
              <AddToCartButton product={cartProduct} />
            ) : (
              <button disabled className="flex-1 bg-secondary text-primary py-5 font-sans uppercase tracking-[0.2em] text-xs cursor-not-allowed">
                Sold Out
              </button>
            )}
          </div>

          <div className="mt-6 text-[10px] font-sans uppercase tracking-widest text-foreground/30">
            Displayed on: Shop Page{product.is_featured ? " · Home Page (Featured)" : ""}
          </div>

          <div className="mt-16 pt-12 border-t border-foreground/10">
            <ReviewForm productId={product.id} />
          </div>

          {reviews.length > 0 && (
            <div className="mt-4">
              <h3 className="font-sans uppercase tracking-[0.2em] text-xs font-bold text-foreground mb-8">
                Customer Reviews ({reviews.length})
              </h3>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-foreground/5 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-foreground">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="font-sans text-sm text-foreground/70">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
