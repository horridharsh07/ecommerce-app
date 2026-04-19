"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { items, setIsOpen } = useCart();
  const { user, logout } = useAuth();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`w-full py-5 px-8 flex justify-between items-center fixed top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl shadow-sm border-b border-foreground/5"
          : "bg-transparent"
      }`}
    >
      <Link
        href="/"
        className="font-serif text-3xl tracking-widest text-foreground flex items-center gap-4 group"
      >
        <img
          src="/logo.jpg"
          alt="Luma Logo"
          className="w-10 h-10 rounded-full border border-foreground/10 group-hover:scale-105 transition-transform duration-300"
        />
        <span className="group-hover:text-primary transition-colors duration-300">LUMA</span>
      </Link>

      <div className="flex gap-8 text-xs font-sans uppercase tracking-[0.15em] text-foreground/80 items-center">
        <Link
          href="/shop"
          className="hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
        >
          Shop
        </Link>
        <Link
          href="/about"
          className="hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
        >
          Our Story
        </Link>

        {user ? (
          <div className="group relative">
            <button className="hover:text-primary transition-colors duration-300 py-4">ACCOUNT</button>
            <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 w-48">
              <div className="bg-background border border-foreground/10 p-6 flex flex-col gap-4 shadow-xl relative shadow-black/5 rounded-sm">
                <div className="absolute -top-3 left-0 w-full h-4 bg-transparent" /> {/* Invisible bridge */}
                {user.is_admin && (
                  <Link href="/admin" className="hover:text-primary transition-colors duration-300">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="hover:text-primary transition-colors duration-300 text-left"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link href="/login" className="hover:text-primary transition-colors duration-300">
            Log In
          </Link>
        )}

        <button
          onClick={() => setIsOpen(true)}
          className="hover:text-primary transition-colors duration-300 btn-press relative"
        >
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-4 bg-foreground text-background text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
