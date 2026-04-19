import Link from "next/link";

export interface Product {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  discount_percent?: number | null;
  image: string;
  description: string;
  notes: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group cursor-pointer flex flex-col items-center text-center hover-lift"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/5] bg-secondary overflow-hidden mb-6">
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {product.discount_percent && (
          <div className="absolute top-3 left-3 z-20">
             <span className="bg-red-700/80 text-white text-[9px] uppercase tracking-[0.2em] px-2 py-1 font-sans backdrop-blur-sm">
               {product.discount_percent}% OFF
             </span>
          </div>
        )}
      </div>

      {/* Details */}
      <h3 className="font-sans tracking-[0.15em] text-xs uppercase text-foreground mb-2 transition-colors group-hover:text-primary duration-300">
        {product.name}
      </h3>
      <div className="flex gap-2 items-center font-sans text-sm mb-3">
        <span className="text-primary font-medium">₹{product.price.toLocaleString("en-IN")}</span>
        {product.compare_at_price && (
          <span className="text-primary/50 line-through text-[11px]">₹{product.compare_at_price.toLocaleString("en-IN")}</span>
        )}
      </div>
      <p className="font-serif italic text-primary/70 text-xs px-4 line-clamp-1">
        {product.notes}
      </p>
    </Link>
  );
}
