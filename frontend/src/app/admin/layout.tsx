"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, ClipboardList, Megaphone, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !user.is_admin)) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !user.is_admin) {
    return <div className="min-h-screen flex items-center justify-center font-sans">Loading Secure Dashboard...</div>;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-background border-t border-foreground/5">
      {/* Sidebar */}
      <div className="w-64 border-r border-foreground/10 p-8 flex flex-col gap-8 h-screen sticky top-0 bg-background">
        <h2 className="font-serif text-2xl tracking-widest text-foreground">Luma Admin</h2>
        
        <nav className="flex flex-col gap-4 font-sans uppercase tracking-[0.15em] text-xs flex-1">
          <Link href="/admin" className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors py-2">
            <LayoutDashboard size={16} /> Overview
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors py-2">
            <Package size={16} /> Products
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors py-2">
            <ClipboardList size={16} /> Orders
          </Link>
          <Link href="/admin/marketing" className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors py-2">
            <Megaphone size={16} /> Marketing
          </Link>
        </nav>
        
        <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 hover:text-red-600 transition-colors py-2 font-sans uppercase tracking-[0.15em] text-xs">
          <LogOut size={16} /> Logout
        </button>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 p-12 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
