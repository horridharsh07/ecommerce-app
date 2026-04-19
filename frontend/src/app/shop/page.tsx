import { getProducts, getCategories } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop the Collection | Luma Candles",
  description: "Browse our signature collection of handcrafted aesthetic candles.",
};

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category || null;

  const [data, categories] = await Promise.all([
    getProducts({
      page: Number(params.page) || 1,
      per_page: 12,
      category: activeCategory || undefined,
      search: params.search || undefined,
    }),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 animate-slide-up">
          <div>
            <h1 className="font-serif text-4xl md:text-6xl font-light text-foreground mb-4">
              The Collection
            </h1>
            <p className="font-sans text-primary text-sm tracking-wide">
              Discover our signature scents, hand-poured for your sanctuary.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap gap-6 text-xs font-sans uppercase tracking-[0.15em] text-primary/80">
              <Link
                href="/shop"
                className={`pb-1 transition-colors duration-300 ${
                  !activeCategory
                    ? "text-foreground border-b border-foreground"
                    : "hover:text-foreground"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`pb-1 transition-colors duration-300 ${
                    activeCategory === cat.slug
                      ? "text-foreground border-b border-foreground"
                      : "hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {data.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <img src="/logo.jpg" alt="Luma Candles Logo" className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-foreground/10 shadow-sm opacity-60 grayscale" />
            <p className="font-sans text-primary mt-8 text-sm tracking-wide text-foreground/50 italic">
              New collection dropping soon...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 justify-items-center">
            {data.products.map((product, i) => (
              <div key={product.id} className={`w-full animate-slide-up stagger-${Math.min(i + 1, 8)}`}>
                <ProductCard
                  product={{
                    id: String(product.id),
                    name: product.name,
                    price: product.price,
                    compare_at_price: product.compare_at_price,
                    discount_percent: product.discount_percent,
                    image: resolveMediaUrl(product.image_url) || "",
                    description: product.description,
                    notes: [product.top_notes, product.mid_notes, product.base_notes]
                      .filter(Boolean)
                      .join(" — "),
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {data.total > data.per_page && (
          <div className="text-center mt-16 text-xs font-sans uppercase tracking-widest text-primary/60 animate-fade-in">
            Showing {data.products.length} of {data.total} candles
          </div>
        )}
      </div>
    </div>
  );
}
