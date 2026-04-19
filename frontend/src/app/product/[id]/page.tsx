import { dummyProducts } from "@/lib/data";
import AddToCartButton from "@/components/checkout/AddToCartButton";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = dummyProducts.find(p => p.id === id) || dummyProducts[0];

  return (
    <div className="min-h-screen px-8 py-12 lg:py-24 animate-in fade-in duration-1000">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
        
        {/* Product Image Space */}
        <div className="w-full md:w-1/2 aspect-[4/5] bg-secondary flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 z-10" />
          <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover" 
          />
        </div>

        {/* Product Details Space */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h1 className="font-serif text-5xl mb-3 text-foreground font-light">{product.name}</h1>
            <p className="font-sans text-xl text-primary mb-8 tracking-wider">
                ₹{product.price.toLocaleString('en-IN')}
            </p>
            
            <p className="font-sans text-foreground/80 leading-relaxed mb-12 text-sm">
               {product.description}
            </p>

            {/* Premium Scent Profile Details */}
            <div className="border-t border-b border-foreground/10 py-8 mb-12">
                <h3 className="font-sans uppercase tracking-[0.2em] text-xs font-bold text-foreground mb-4">
                  Scent Profile
                </h3>
                <p className="font-serif italic text-primary/90 mb-3 text-sm">
                  {product.notes}
                </p>
                <div className="flex gap-4 text-xs font-sans text-foreground/50 uppercase tracking-widest">
                  <span>~60 Hour Burn</span>
                  <span>•</span>
                  <span>Coconut Soy Wax</span>
                </div>
            </div>

            {/* Shopping Action */}
            <div className="flex gap-4">
                <AddToCartButton product={product} />
            </div>
        </div>

      </div>
    </div>
  );
}
