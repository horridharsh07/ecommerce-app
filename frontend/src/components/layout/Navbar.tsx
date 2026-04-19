"use client";
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { items, setIsOpen } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="w-full py-6 px-8 flex justify-between items-center fixed top-0 bg-background/90 backdrop-blur-md z-50">
      <div className="flex gap-8 text-xs font-sans uppercase tracking-[0.15em] text-foreground/80">
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <Link href="/about" className="hover:text-primary transition-colors">Our Story</Link>
      </div>
      
      <Link href="/" className="font-serif text-3xl tracking-widest text-foreground ml-4 flex items-center gap-4">
        <img src="https://instagram.fluh1-2.fna.fbcdn.net/v/t51.82787-19/539918011_17846476830552870_324910419738793620_n.jpg?stp=dst-jpg_s320x320_tt6" alt="Luma Logo" className="w-10 h-10 rounded-full border border-foreground/10" />
        LUMA
      </Link>
      
      <div className="flex gap-8 text-xs font-sans uppercase tracking-[0.15em] text-foreground/80">
        <button className="hover:text-primary transition-colors">Account</button>
        <button onClick={() => setIsOpen(true)} className="hover:text-primary transition-colors">
          Cart ({cartCount})
        </button>
      </div>
    </nav>
  );
}
