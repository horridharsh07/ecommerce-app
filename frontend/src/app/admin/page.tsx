"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, ShoppingBag, Users, Package, Clock, AlertTriangle } from "lucide-react";

interface Stats {
  total_revenue: number;
  total_orders: number;
  total_users: number;
  total_products: number;
  pending_orders: number;
  low_stock_products: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (token) {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      fetch(`${API_BASE}/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error(err));
    }
  }, [token]);

  if (!stats) {
    return (
      <div className="animate-fade-in">
        <div className="w-48 h-10 skeleton mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-8 border border-foreground/10 rounded-sm">
              <div className="w-24 h-3 skeleton mb-4" />
              <div className="w-32 h-8 skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Earnings", value: `₹${stats.total_revenue.toLocaleString("en-IN")}`, icon: TrendingUp, highlight: true },
    { label: "Orders", value: stats.total_orders, icon: ShoppingBag },
    { label: "Total Users", value: stats.total_users, icon: Users },
    { label: "Total Products", value: stats.total_products, icon: Package },
    { label: "Pending Orders", value: stats.pending_orders, icon: Clock },
    { label: "Low Stock Items", value: stats.low_stock_products, icon: AlertTriangle },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-4xl mb-2 font-light text-foreground animate-slide-up">Overview</h1>
      <p className="text-xs uppercase tracking-widest text-foreground/40 mb-10 animate-fade-in stagger-1">
        Admin Dashboard · Secured Access
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-8 border rounded-sm transition-all duration-300 hover:shadow-md animate-slide-up stagger-${idx + 1} ${
                kpi.highlight
                  ? "bg-foreground text-background border-foreground"
                  : "bg-secondary/20 border-foreground/10 hover:border-foreground/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon size={16} className={kpi.highlight ? "text-background/60" : "text-primary"} />
                <h3 className={`font-sans text-xs uppercase tracking-[0.2em] ${kpi.highlight ? "text-background/60" : "text-foreground/50"}`}>
                  {kpi.label}
                </h3>
              </div>
              <p className="font-serif text-3xl">{kpi.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
