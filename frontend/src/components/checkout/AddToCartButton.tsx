"use client";
import { useCart } from "@/context/CartContext";
import { Product } from "@/components/product/ProductCard";

export default function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();
    
    return (
        <button 
            onClick={() => addToCart(product)}
            className="flex-1 bg-foreground text-background py-5 font-sans uppercase tracking-[0.2em] text-xs hover:bg-primary transition-colors duration-300"
        >
            Add to Cart
        </button>
    );
}
