import { getProduct, getProductReviews } from "@/lib/api";
import { getProxyImageUrl } from "@/lib/utils";
import AddToCartButton from "@/components/checkout/AddToCartButton";
import ReviewForm from "@/components/product/ReviewForm";

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
    image: getProxyImageUrl(product.image_url) || "",
    description: product.description,
    notes: notesString,
  };

  return (
    <div className="min-h-screen px-8 py-12 lg:py-24 animate-in fade-in duration-1000">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">

        {/* Product Image */}
        <div className="w-full md:w-1/2 aspect-[4/5] bg-secondary flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 z-10" />
          {product.image_url ? (
            <img src={getProxyImageUrl(product.image_url)!} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-serif text-primary/40 tracking-widest">LUMA</span>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          {product.category && (
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-primary/60 mb-3">
              {product.category.name}
            </p>
          )}
          <h1 className="font-serif text-5xl mb-3 text-foreground font-light">{product.name}</h1>
          <p className="font-sans text-xl text-primary mb-4 tracking-wider">
            ₹{product.price.toLocaleString("en-IN")}
          </p>

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
              <p className="font-serif italic text-primary/90 mb-3 text-sm">
                {notesString}
              </p>
            )}
            <div className="flex gap-4 text-xs font-sans text-foreground/50 uppercase tracking-widest">
              {product.burn_time && <span>{product.burn_time}</span>}
              {product.burn_time && product.wax_type && <span>•</span>}
              {product.wax_type && <span>{product.wax_type}</span>}
              {product.weight && <span>•</span>}
              {product.weight && <span>{product.weight}</span>}
            </div>
          </div>

          {/* Stock indicator */}
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-xs font-sans uppercase tracking-widest text-accent mb-6">
              Only {product.stock} left in stock
            </p>
          )}

          {/* Add to Cart */}
          <div className="flex gap-4">
            {product.stock > 0 ? (
              <AddToCartButton product={cartProduct} />
            ) : (
              <button disabled className="flex-1 bg-secondary text-primary py-5 font-sans uppercase tracking-[0.2em] text-xs cursor-not-allowed">
                Sold Out
              </button>
            )}
          </div>

          <div className="mt-16 pt-12 border-t border-foreground/10">
            <ReviewForm productId={product.id} />
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mt-4">
              <h3 className="font-sans uppercase tracking-[0.2em] text-xs font-bold text-foreground mb-8">
                Customer Reviews ({reviews.length})
              </h3>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-foreground/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-foreground">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
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
