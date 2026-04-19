import { getProducts, getCategories, type Product, type Category } from "@/lib/api";
import { getProxyImageUrl } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category || null;

  // Fetch from live API
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
    <div className="min-h-screen px-8 py-12 animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto">

        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <h1 className="font-serif text-4xl md:text-6xl font-light text-foreground mb-4">The Collection</h1>
            <p className="font-sans text-primary text-sm tracking-wide">
              Discover our signature scents, hand-poured for your sanctuary.
            </p>
          </div>

          {/* Dynamic Category Filters from API */}
          <div className="flex flex-wrap gap-6 text-xs font-sans uppercase tracking-[0.15em] text-primary/80">
            <Link
              href="/shop"
              className={`pb-1 transition-colors ${!activeCategory ? "text-foreground border-b border-foreground" : "hover:text-foreground"}`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={`pb-1 transition-colors ${activeCategory === cat.slug ? "text-foreground border-b border-foreground" : "hover:text-foreground"}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {data.products.length === 0 ? (
          <p className="font-sans text-primary text-center py-24 italic">No candles found in this collection yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {data.products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: String(product.id),
                  name: product.name,
                  price: product.price,
                  image: getProxyImageUrl(product.image_url) || "",
                  description: product.description,
                  notes: [product.top_notes, product.mid_notes, product.base_notes].filter(Boolean).join(" — "),
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination hint */}
        {data.total > data.per_page && (
          <div className="text-center mt-16 text-xs font-sans uppercase tracking-widest text-primary/60">
            Showing {data.products.length} of {data.total} candles
          </div>
        )}
      </div>
    </div>
  );
}
