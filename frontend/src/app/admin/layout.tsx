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
    <div className="flex flex-col md:flex-row min-h-screen bg-background border-t border-foreground/5">
      {/* Sidebar */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-foreground/10 p-4 md:p-8 flex flex-col gap-4 md:gap-8 md:h-screen md:sticky md:top-0 bg-background z-10">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-xl md:text-2xl tracking-widest text-foreground">Luma Admin</h2>
          <button onClick={handleLogout} className="md:hidden flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors py-2 font-sans uppercase tracking-[0.15em] text-[10px]">
            <LogOut size={14} /> Logout
          </button>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-6 md:gap-4 font-sans uppercase tracking-[0.15em] text-xs flex-1 overflow-x-auto no-scrollbar py-2 md:py-0">
          <Link href="/admin" className="flex items-center gap-2 md:gap-3 text-foreground/70 hover:text-primary transition-colors py-2 whitespace-nowrap">
            <LayoutDashboard size={16} /> Overview
          </Link>
          <Link href="/admin/products" className="flex items-center gap-2 md:gap-3 text-foreground/70 hover:text-primary transition-colors py-2 whitespace-nowrap">
            <Package size={16} /> Products
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-2 md:gap-3 text-foreground/70 hover:text-primary transition-colors py-2 whitespace-nowrap">
            <ClipboardList size={16} /> Orders
          </Link>
          <Link href="/admin/marketing" className="flex items-center gap-2 md:gap-3 text-foreground/70 hover:text-primary transition-colors py-2 whitespace-nowrap">
            <Megaphone size={16} /> Marketing
          </Link>
          <Link href="/admin/content" className="flex items-center gap-2 md:gap-3 text-foreground/70 hover:text-primary transition-colors py-2 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-app-window"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/></svg> Content
          </Link>
        </nav>
        
        <button onClick={handleLogout} className="hidden md:flex items-center gap-3 text-red-500 hover:text-red-600 transition-colors py-2 font-sans uppercase tracking-[0.15em] text-xs mt-auto">
          <LogOut size={16} /> Logout
        </button>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-8 md:p-12 overflow-y-auto w-full max-w-[100vw]">
        {children}
      </div>
    </div>
  );
}
