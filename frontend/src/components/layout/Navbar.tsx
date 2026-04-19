"use client";
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { items, setIsOpen } = useCart();
  const { user, logout } = useAuth();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="w-full py-6 px-8 flex justify-between items-center fixed top-0 bg-background/90 backdrop-blur-md z-50">
      <Link href="/" className="font-serif text-3xl tracking-widest text-foreground flex items-center gap-4">
        <img src="/logo.jpg" alt="Luma Logo" className="w-10 h-10 rounded-full border border-foreground/10" />
        LUMA
      </Link>
      
      <div className="flex gap-8 text-xs font-sans uppercase tracking-[0.15em] text-foreground/80 items-center">
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <Link href="/about" className="hover:text-primary transition-colors">Our Story</Link>
        
        {user ? (
          <div className="group relative">
            <button className="hover:text-primary transition-colors">ACCOUNT</button>
            <div className="absolute top-full right-0 mt-4 bg-background border border-foreground/10 p-6 hidden group-hover:flex flex-col gap-4 shadow-xl min-w-40 z-50">
              {user.is_admin && <Link href="/admin" className="hover:text-primary transition-colors">Dashboard</Link>}
              <button onClick={logout} className="hover:text-primary transition-colors text-left">Sign Out</button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="hover:text-primary transition-colors">Log In</Link>
        )}
        
        <button onClick={() => setIsOpen(true)} className="hover:text-primary transition-colors">
          Cart ({cartCount})
        </button>
      </div>
    </nav>
  );
}
