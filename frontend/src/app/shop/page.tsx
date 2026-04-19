import ProductCard from "@/components/product/ProductCard";
import { dummyProducts } from "@/lib/data";

export default function Shop() {
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
            
            {/* Minimalist Category Filter */}
            <div className="flex flex-wrap gap-6 text-xs font-sans uppercase tracking-[0.15em] text-primary/80">
                <button className="text-foreground border-b border-foreground pb-1">All</button>
                <button className="hover:text-foreground transition-colors pb-1">Woody</button>
                <button className="hover:text-foreground transition-colors pb-1">Floral</button>
                <button className="hover:text-foreground transition-colors pb-1">Fresh</button>
            </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {dummyProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
      </div>
    </div>
  );
}
