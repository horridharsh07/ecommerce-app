"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface DiscountCode {
  id: number;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  times_used: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export default function AdminMarketing() {
  const { token } = useAuth();
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (token) fetchDiscounts();
  }, [token]);

  const fetchDiscounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/discounts/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setDiscounts(await res.json());
    } catch(err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        code: code.toUpperCase(),
        discount_percent: parseFloat(discountPercent),
        max_uses: maxUses ? parseInt(maxUses) : null,
        valid_from: new Date().toISOString(), // Valid immediately
        valid_until: validUntil ? new Date(validUntil).toISOString() : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      };

      const res = await fetch(`${API_BASE}/api/discounts/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create code");

      setIsAdding(false);
      setCode("");
      setDiscountPercent("10");
      setMaxUses("");
      setValidUntil("");
      fetchDiscounts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this discount code forever?")) return;
    try {
      await fetch(`${API_BASE}/api/discounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiscounts(discounts.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center mb-12">
        <h1 className="font-serif text-4xl font-light text-foreground">Marketing Tools</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-foreground text-background px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
        >
          {isAdding ? "Cancel" : "Create Code"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-secondary/20 p-8 border border-foreground/10 mb-12 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300 max-w-2xl">
           <h2 className="font-serif text-2xl mb-4">New Promo Code</h2>
           
           <div className="flex gap-6">
              <div className="flex-1">
                 <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Code Phrase</label>
                 <input type="text" required placeholder="Ex. LUMA20" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground uppercase" />
              </div>
              <div className="flex-1">
                 <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Discount %</label>
                 <input type="number" required placeholder="10" min="1" max="100" value={discountPercent} onChange={e=>setDiscountPercent(e.target.value)} className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground" />
              </div>
           </div>

           <div className="flex gap-6">
              <div className="flex-1">
                 <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Max Uses (Optional)</label>
                 <input type="number" placeholder="Leave empty for unlimited" value={maxUses} onChange={e=>setMaxUses(e.target.value)} className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground placeholder:text-foreground/30" />
              </div>
              <div className="flex-1">
                 <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Expires On (Optional)</label>
                 <input type="date" value={validUntil} onChange={e=>setValidUntil(e.target.value)} className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground" />
              </div>
           </div>

           <button disabled={isSubmitting} type="submit" className="bg-foreground text-background px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] mt-4 hover:bg-foreground/90 transition-colors self-end disabled:opacity-50">
             {isSubmitting ? "CREATING..." : "SAVE DISCOUNT"}
           </button>
        </form>
      )}

      {/* Codes List */}
      <table className="w-full text-left font-sans text-sm border-collapse">
        <thead className="text-xs uppercase tracking-[0.15em] text-foreground/50 border-b border-foreground/10">
          <tr>
            <th className="py-4 font-normal">Code Name</th>
            <th className="py-4 font-normal">Discount</th>
            <th className="py-4 font-normal">Uses</th>
            <th className="py-4 font-normal">Status</th>
            <th className="py-4 font-normal text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map(d => (
            <tr key={d.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02]">
              <td className="py-6 font-serif text-lg tracking-wide uppercase">{d.code}</td>
              <td className="py-6 text-primary">{d.discount_percent}% OFF</td>
              <td className="py-6">
                 {d.times_used} / {d.max_uses ? d.max_uses : '∞'}
              </td>
              <td className="py-6">
                {d.is_active && new Date(d.valid_until) > new Date() && (!d.max_uses || d.times_used < d.max_uses) ? (
                  <span className="px-2 py-1 text-[10px] uppercase tracking-widest bg-green-500/10 text-green-700">Active</span>
                ) : (
                  <span className="px-2 py-1 text-[10px] uppercase tracking-widest bg-red-500/10 text-red-700">Expired</span>
                )}
              </td>
              <td className="py-6 text-right">
                <button onClick={() => handleDelete(d.id)} className="text-xs uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {discounts.length === 0 && !isAdding && (
         <div className="text-center p-12 mt-8 border border-dashed border-foreground/20 text-foreground/50 uppercase tracking-widest text-xs">
            No active discount promotions.
         </div>
      )}
    </div>
  );
}
