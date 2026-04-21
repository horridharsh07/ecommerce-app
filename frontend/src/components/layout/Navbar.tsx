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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <nav
        className={`w-full py-4 md:py-5 px-4 md:px-8 flex justify-between items-center fixed top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl shadow-sm border-b border-foreground/5"
            : "bg-transparent"
        }`}
      >
        {/* LOGO */}
        <Link
          href="/"
          className="font-serif text-xl md:text-3xl tracking-widest text-foreground flex items-center gap-2 md:gap-4"
        >
          <img
            src="/logo.jpg"
            alt="Luma Logo"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-foreground/10"
          />
          LUMA
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex gap-8 text-xs font-sans uppercase tracking-[0.15em] text-foreground/80 items-center">
          <Link href="/shop" className="hover:text-primary">Shop</Link>
          <Link href="/about" className="hover:text-primary">Our Story</Link>

          {user ? (
            <button onClick={logout} className="hover:text-primary">
              Logout
            </button>
          ) : (
            <Link href="/login" className="hover:text-primary">
              Log In
            </Link>
          )}

          <button onClick={() => setIsOpen(true)} className="relative">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-foreground text-background text-[9px] w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* MOBILE RIGHT SIDE */}
        <div className="flex md:hidden items-center gap-4">
          {/* CART */}
          <button onClick={() => setIsOpen(true)} className="relative">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-foreground text-background text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* HAMBURGER */}
          <button onClick={() => setMenuOpen(true)} className="text-xl">
            ☰
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 bg-background z-50 transform transition-transform duration-500 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-foreground/10">
          <span className="font-serif text-xl">Menu</span>
          <button onClick={() => setMenuOpen(false)}>✕</button>
        </div>

        <div className="flex flex-col gap-6 p-8 text-lg uppercase tracking-wide">
          <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>Our Story</Link>

          {user ? (
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="text-left"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              Log In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}