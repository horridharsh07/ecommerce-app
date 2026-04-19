"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

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
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
    }
  }, [token]);

  if (!stats) return <div className="animate-pulse">Loading dashboard...</div>;

  const kpis = [
    { label: "Total Revenue", value: `₹${stats.total_revenue.toLocaleString('en-IN')}` },
    { label: "Orders", value: stats.total_orders },
    { label: "Total Users", value: stats.total_users },
    { label: "Total Products", value: stats.total_products },
    { label: "Pending Orders", value: stats.pending_orders },
    { label: "Low Stock Items", value: stats.low_stock_products },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <h1 className="font-serif text-4xl mb-8 font-light text-foreground">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-secondary/20 border border-foreground/10 p-8 rounded-sm">
            <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-foreground/50 mb-2">{kpi.label}</h3>
            <p className="font-serif text-3xl text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
