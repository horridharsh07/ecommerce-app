"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  product: { name: string; image_url: string };
}

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  razorpay_order_id: string;
  shipping_address: string;
  shipping_city: string;
  created_at: string;
  items: OrderItem[];
}

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    setIsUpdating(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch(err) {
      alert("Error updating status");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <h1 className="font-serif text-4xl mb-12 font-light text-foreground">Order Monitoring</h1>
      
      <div className="flex flex-col gap-6">
        {orders.map(order => (
          <div key={order.id} className="border border-foreground/10 bg-background p-6 flex flex-col md:flex-row gap-8 justify-between hover:border-foreground/30 transition-colors shadow-sm">
            
            {/* Info */}
            <div className="flex flex-col gap-2">
               <h3 className="font-sans uppercase tracking-[0.1em] text-xs font-bold text-foreground">
                  Order #{order.id}
               </h3>
               <p className="text-xs uppercase tracking-widest text-foreground/50">
                  {new Date(order.created_at).toLocaleDateString()}
               </p>
               <p className="text-sm font-serif text-foreground mt-2">
                 {order.items.length} items • ₹{order.total_amount.toLocaleString("en-IN")}
               </p>
               {order.razorpay_order_id && (
                 <p className="text-[10px] uppercase tracking-widest text-primary/70 mt-1">
                    RZP: {order.razorpay_order_id}
                 </p>
               )}
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1 w-full md:w-1/3">
              <h4 className="font-sans text-[10px] uppercase tracking-widest text-foreground/40">Destination</h4>
              <p className="text-xs tracking-widest uppercase text-foreground/90">{order.shipping_address}, {order.shipping_city}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 min-w-32 items-end">
               <h4 className="font-sans text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Status</h4>
               <select 
                 value={order.status} 
                 onChange={e => updateStatus(order.id, e.target.value)}
                 disabled={isUpdating === order.id}
                 className={`border-b border-foreground/20 bg-transparent text-xs uppercase tracking-widest pb-1 focus:outline-none focus:border-foreground cursor-pointer disabled:opacity-50
                    ${order.status === 'pending' ? 'text-yellow-600' : 
                      order.status === 'processing' ? 'text-blue-600' : 
                      order.status === 'shipped' ? 'text-primary' : 
                      order.status === 'delivered' ? 'text-green-600' : 'text-red-600'
                    }`}
               >
                 <option value="pending">PENDING</option>
                 <option value="processing">PROCESSING</option>
                 <option value="shipped">SHIPPED</option>
                 <option value="delivered">DELIVERED</option>
                 <option value="cancelled">CANCELLED</option>
               </select>
            </div>

          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center p-12 border border-dashed border-foreground/20 text-foreground/50 uppercase tracking-widest text-xs">
             No orders placed yet.
          </div>
        )}
      </div>
    </div>
  );
}
