"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Upload } from "lucide-react";

interface AdminProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
  image_url?: string;
}

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("2499");
  const [stock, setStock] = useState("50");
  const [categoryId, setCategoryId] = useState("");
  const [topNotes, setTopNotes] = useState("");
  const [midNotes, setMidNotes] = useState("");
  const [baseNotes, setBaseNotes] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const pRes = await fetch(`${API_BASE}/api/products`);
      const pData = await pRes.json();
      setProducts(pData.products || []);

      const cRes = await fetch(`${API_BASE}/api/categories`);
      if (cRes.ok) setCategories(await cRes.json());
    } catch(err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImageUrl = "";

      // 1. Upload File if selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const upRes = await fetch(`${API_BASE}/api/upload/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!upRes.ok) throw new Error("File upload failed");
        const upData = await upRes.json();
        finalImageUrl = `${API_BASE}${upData.url}`;
      }

      // 2. Create Product
      const payload = {
        name,
        slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id: categoryId ? parseInt(categoryId) : null,
        top_notes: topNotes,
        mid_notes: midNotes,
        base_notes: baseNotes,
        image_url: finalImageUrl || null,
        is_active: true
      };

      const res = await fetch(`${API_BASE}/api/products/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create product");
      
      // Cleanup & Refresh
      setIsAdding(false);
      resetForm();
      fetchData();
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setName(""); setDescription(""); setPrice("2499"); setStock("50"); setFile(null);
    setTopNotes(""); setMidNotes(""); setBaseNotes("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-light text-foreground">Products</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-foreground text-background px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
        >
          {isAdding ? "Cancel" : "Add Product"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-secondary/20 p-8 border border-foreground/10 mb-12 animate-in slide-in-from-top-4 duration-300">
          <h2 className="font-serif text-2xl mb-8">Upload New Collection Item</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Col */}
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Product Name</label>
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground" />
              </div>
              
              <div>
                <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Description</label>
                <textarea required rows={3} value={description} onChange={e=>setDescription(e.target.value)} className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground resize-none" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Price (₹)</label>
                  <input required type="number" value={price} onChange={e=>setPrice(e.target.value)} className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground" />
                </div>
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Stock</label>
                  <input required type="number" value={stock} onChange={e=>setStock(e.target.value)} className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground" />
                </div>
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Category</label>
                  <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="w-full border-b border-foreground/20 pb-2 pt-3 bg-transparent focus:outline-none focus:border-foreground text-sm">
                     <option value="">None</option>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="flex flex-col gap-6">
               <label className="text-xs uppercase tracking-widest text-foreground/50 block">Media Upload</label>
               <div className="border-2 border-dashed border-foreground/20 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-foreground/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={32} className="text-foreground/30 mb-4" />
                  <p className="text-sm font-sans text-foreground/60">{file ? file.name : "Click to select JPG, PNG, or Video"}</p>
                  <input ref={fileInputRef} type="file" accept="image/*,video/mp4" className="hidden" onChange={handleFileChange} />
               </div>

               <div>
                <label className="text-xs uppercase tracking-widest text-foreground/50 mb-3 block">Scent Profile</label>
                <div className="flex gap-4">
                    <input type="text" placeholder="Top Notes" value={topNotes} onChange={e=>setTopNotes(e.target.value)} className="w-1/3 border-b border-foreground/20 py-2 text-sm bg-transparent focus:outline-none focus:border-foreground placeholder:text-foreground/30" />
                    <input type="text" placeholder="Mid Notes" value={midNotes} onChange={e=>setMidNotes(e.target.value)} className="w-1/3 border-b border-foreground/20 py-2 text-sm bg-transparent focus:outline-none focus:border-foreground placeholder:text-foreground/30" />
                    <input type="text" placeholder="Base Notes" value={baseNotes} onChange={e=>setBaseNotes(e.target.value)} className="w-1/3 border-b border-foreground/20 py-2 text-sm bg-transparent focus:outline-none focus:border-foreground placeholder:text-foreground/30" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
             <button disabled={isUploading} type="submit" className="bg-foreground text-background px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors disabled:opacity-50">
               {isUploading ? "UPLOADING & SAVING..." : "SAVE TO STOREFRONT"}
             </button>
          </div>
        </form>
      )}

      {/* Product List */}
      <table className="w-full text-left font-sans text-sm border-collapse">
        <thead className="text-xs uppercase tracking-[0.15em] text-foreground/50 border-b border-foreground/10">
          <tr>
            <th className="py-4 font-normal">Product</th>
            <th className="py-4 font-normal">Price</th>
            <th className="py-4 font-normal">Stock</th>
            <th className="py-4 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02]">
              <td className="py-4 flex items-center gap-4">
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="w-12 h-16 object-cover bg-secondary" />
                ) : (
                  <div className="w-12 h-16 bg-secondary" />
                )}
                <span className="font-serif text-lg tracking-wide">{p.name}</span>
              </td>
              <td className="py-4 text-primary">₹{p.price.toLocaleString("en-IN")}</td>
              <td className="py-4">{p.stock}</td>
              <td className="py-4">
                <span className={`px-2 py-1 text-[10px] uppercase tracking-widest ${p.is_active ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
                  {p.is_active ? "Active" : "Hidden"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
