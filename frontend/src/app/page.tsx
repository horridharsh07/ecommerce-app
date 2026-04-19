import Link from "next/link";
import { getFeaturedProducts, getCategories, getSiteContent } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luma Candles - Aesthetic Handcrafted Candles",
  description: "Shop ethical, vegan, and handcrafted luxury coconut soy candles. Signature minimal aesthetics to bring warmth to your home.",
  openGraph: {
    title: "Luma Candles - Aesthetic Handcrafted Candles",
    description: "Shop ethical, vegan, and handcrafted luxury coconut soy candles.",
    url: "https://lumacandles.vercel.app/",
    siteName: "Luma Candles",
    images: [{ url: "/logo.jpg", width: 800, height: 800 }],
    locale: "en_IN",
    type: "website",
  },
};

export default async function Home() {
  let featured: any[] = [];
  let categories: any[] = [];
  let content: Record<string, string> = {};

  try {
    const results = await Promise.all([
      getFeaturedProducts(),
      getCategories(),
      getSiteContent(),
    ]);
    featured = results[0];
    categories = results[1];
    content = results[2];
  } catch {
    // API may be down during static build
  }

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-transparent" />
        <div className="relative z-10 animate-slide-up">
          <h1 className="font-serif text-7xl md:text-9xl font-light tracking-wide text-foreground mb-6 whitespace-pre-wrap">
            {content["home_hero_title"] || "LUMA"}
          </h1>
          <p className="font-sans text-lg md:text-xl text-primary font-light max-w-xl mx-auto leading-relaxed mb-10 animate-fade-in stagger-2 whitespace-pre-wrap">
            {content["home_hero_subtitle"] || "Curating minimal spaces with warmth and scent.\nEthically poured, undeniably cozy."}
          </p>
          <Link
            href="/shop"
            className="inline-block px-12 py-5 bg-foreground text-background font-sans tracking-[0.2em] text-xs uppercase hover:bg-primary transition-colors duration-500 btn-press animate-fade-in stagger-4"
          >
            Explore the Collection
          </Link>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="py-20 px-8 border-t border-foreground/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-light text-foreground mb-4 animate-slide-up">
              Signature Scents
            </h2>
            <p className="font-sans text-sm text-primary tracking-wide animate-fade-in stagger-2">
              Our most loved candles, handpicked for you.
            </p>
          </div>
          
          {featured.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <img src="/logo.jpg" alt="Luma Candles Logo" className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-foreground/10 shadow-sm opacity-60 grayscale" />
              <p className="font-sans text-primary mt-8 text-sm tracking-wide text-foreground/50 italic">
                New collection dropping soon...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14 justify-items-center">
              {featured.map((product: any, i: number) => (
                <div key={product.id} className={`w-full animate-slide-up stagger-${Math.min(i + 1, 8)} relative`}>
                  <div className="absolute top-4 left-4 z-30">
                    <span className="bg-foreground text-background text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 font-sans">
                      Featured
                    </span>
                  </div>
                  <ProductCard
                    product={{
                      id: String(product.id),
                      name: product.name,
                      price: product.price,
                      compare_at_price: product.compare_at_price,
                      discount_percent: product.discount_percent,
                      image: resolveMediaUrl(product.image_url) || "",
                      description: product.description,
                      notes: [product.top_notes, product.mid_notes, product.base_notes].filter(Boolean).join(" — "),
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Categories ─── */}
      {categories.length > 0 && (
        <section className="py-20 px-8 bg-secondary/30 border-t border-foreground/5">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl font-light text-foreground mb-4">
              Shop by Mood
            </h2>
            <p className="font-sans text-sm text-primary tracking-wide mb-14">
              Find the scent that speaks to you.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((cat: any, i: number) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`group p-8 bg-background border border-foreground/5 hover:border-foreground/20 transition-all duration-500 hover-lift animate-scale-in stagger-${i + 1}`}
                >
                  <h3 className="font-serif text-xl md:text-2xl text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="font-sans text-xs text-primary/70 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── The Ritual (Video) ─── */}
      {content["show_video"] !== "false" && (() => {
        const mediaUrl = content["ritual_embed_url"] || "https://www.instagram.com/reel/DU_VuD2klkT/embed";
        const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i);
        const isImage = mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
        
        return (
          <section className="py-24 px-8 bg-background border-t border-foreground/5">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-5xl font-light text-foreground mb-4">The Ritual</h2>
              <p className="font-sans text-primary mb-12 text-sm tracking-wide">
                Experience the pour, the wick, the glow.
              </p>
              <div className="aspect-[9/16] md:aspect-video w-full max-w-2xl mx-auto overflow-hidden bg-secondary shadow-lg relative rounded-md">
                {isVideo ? (
                  <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover absolute inset-0" />
                ) : isImage ? (
                  <img src={mediaUrl} alt="Luma Ritual" className="w-full h-full object-cover absolute inset-0" />
                ) : (
                  <iframe
                    src={mediaUrl}
                    className="w-full h-full border-0 absolute inset-0"
                    allowFullScreen
                    scrolling="no"
                  />
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ─── CTA Footer ─── */}
      <section className="py-24 px-8 bg-secondary/20 border-t border-foreground/5 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-4">
          Ready to glow?
        </h2>
        <p className="font-sans text-sm text-primary tracking-wide mb-8 max-w-md mx-auto">
          Every Luma candle is hand-poured with ethically sourced coconut soy wax.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/shop"
            className="px-10 py-4 bg-foreground text-background font-sans tracking-[0.2em] text-xs uppercase hover:bg-primary transition-colors duration-500 btn-press"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}
