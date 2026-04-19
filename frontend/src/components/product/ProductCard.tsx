import Link from 'next/link';

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    notes: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} className="group cursor-pointer flex flex-col items-center text-center">
      {/* Aspect Ratio Box for Image (Using a tinted div placeholder) */}
      <div className="relative w-full aspect-[4/5] bg-secondary overflow-hidden mb-6">
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
        <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
      </div>
      
      {/* Product Details */}
      <h3 className="font-sans tracking-[0.15em] text-xs uppercase text-foreground mb-2">
        {product.name}
      </h3>
      <p className="font-sans text-primary text-sm mb-3">
        ₹{product.price.toLocaleString('en-IN')}
      </p>
      <p className="font-serif italic text-primary/70 text-xs px-4 line-clamp-1">
        {product.notes}
      </p>
    </Link>
  );
}
