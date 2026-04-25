"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Upload, Star, Image, Film, Edit, Trash2 } from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";
import toast from "react-hot-toast";

interface MediaItem { id: number; url: string; media_type: string; sort_order: number; }
interface AdminProduct { id: number; name: string; price: number; compare_at_price?: number | null; discount_percent?: number | null; stock: number; is_active: boolean; is_featured: boolean; image_url?: string; media: MediaItem[]; top_notes?: string; mid_notes?: string; base_notes?: string; burn_time?: string; wax_type?: string; weight?: string; description?: string; category_id?: number | null;}

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  
  // UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [topNotes, setTopNotes] = useState("");
  const [midNotes, setMidNotes] = useState("");
  const [baseNotes, setBaseNotes] = useState("");
  const [burnTime, setBurnTime] = useState("");
  const [waxType, setWaxType] = useState("");
  const [weight, setWeight] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([]); // For edits
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => { if (token) fetchData(); }, [token]);

  const fetchData = async () => {
    try {
      const pRes = await fetch(`${API_BASE}/api/products`);
      const pData = await pRes.json();
      setProducts(pData.products || []);
      const cRes = await fetch(`${API_BASE}/api/categories`);
      if (cRes.ok) setCategories(await cRes.json());
    } catch (err) { console.error(err); }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setFilePreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
    }
  };

  const removeNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => { URL.revokeObjectURL(prev[index]); return prev.filter((_, i) => i !== index); });
  };

  const deleteExistingMedia = async (mediaId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/upload/media/${mediaId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete media");
      setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
      toast.success("Media deleted");
      fetchData(); // refresh product media under the hood
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Upload all NEW files
      const uploadedMedia: { url: string; media_type: string }[] = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const upRes = await fetch(`${API_BASE}/api/upload/`, {
          method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
        });
        if (!upRes.ok) throw new Error(`Failed to upload ${file.name}`);
        const upData = await upRes.json();
        uploadedMedia.push({ url: upData.url, media_type: upData.media_type });
      }

      // 2. Prepare payload
      const payload: any = {
        name, description, 
        price: parseFloat(price), 
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        discount_percent: discountPercent ? parseFloat(discountPercent) : null,
        stock: parseInt(stock),
        category_id: categoryId ? parseInt(categoryId) : null,
        top_notes: topNotes || null, mid_notes: midNotes || null, base_notes: baseNotes || null,
        burn_time: burnTime || null, wax_type: waxType || null, weight: weight || null,
        is_featured: isFeatured,
      };

      if (!editingId) {
        // Creating NEW product - include media items for one-shot creation
        payload.image_url = uploadedMedia.length > 0 ? uploadedMedia[0].url : null;
        payload.media_items = uploadedMedia;
        
        const res = await fetch(`${API_BASE}/api/products/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Failed to create product"); }
        toast.success("PRODUCT CREATED");
        
      } else {
        // UPDATING EXISTING product
        // If there's new media and the product had no primary image, set it
        if (uploadedMedia.length > 0 && existingMedia.length === 0) {
           payload.image_url = uploadedMedia[0].url;
        }

        const res = await fetch(`${API_BASE}/api/products/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Failed to update product"); }
        
        toast.success("PRODUCT UPDATED");
      }

      setIsFormOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) { toast.error(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete product");
      toast.success("PRODUCT DELETED");
      fetchData();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleEdit = async (product: AdminProduct) => {
    // Fetch full product details to get description
    try {
      const res = await fetch(`${API_BASE}/api/products/${product.id}`);
      const fullProduct = await res.json();
      
      setName(fullProduct.name || "");
      setDescription(fullProduct.description || "");
      setPrice(fullProduct.price?.toString() || "");
      setCompareAtPrice(fullProduct.compare_at_price?.toString() || "");
      setDiscountPercent(fullProduct.discount_percent?.toString() || "");
      setStock(fullProduct.stock?.toString() || "");
      setCategoryId(fullProduct.category_id?.toString() || "");
      setTopNotes(fullProduct.top_notes || "");
      setMidNotes(fullProduct.mid_notes || "");
      setBaseNotes(fullProduct.base_notes || "");
      setBurnTime(fullProduct.burn_time || "");
      setWaxType(fullProduct.wax_type || "");
      setWeight(fullProduct.weight || "");
      setIsFeatured(fullProduct.is_featured || false);
      setExistingMedia(fullProduct.media || []);
      
      setEditingId(fullProduct.id);
      setIsFormOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error("Failed to fetch product details for editing");
    }
  };

  const toggleFeatured = async (productId: number, current: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_featured: !current }),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, is_featured: !current } : p)));
        toast.success(!current ? "FEATURED ON HOME" : "REMOVED FROM HOME");
      }
    } catch (err) { console.error(err); }
  };

  const toggleStatus = async (productId: number, current: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !current }),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, is_active: !current } : p)));
        toast.success(!current ? "PRODUCT ACTIVATED" : "PRODUCT HIDDEN");
      }
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setName(""); setDescription(""); setPrice(""); setCompareAtPrice(""); setDiscountPercent("");
    setStock(""); setCategoryId(""); setTopNotes(""); setMidNotes(""); setBaseNotes("");
    setBurnTime(""); setWaxType(""); setWeight("");
    setIsFeatured(false); setSelectedFiles([]); setExistingMedia([]);
    filePreviews.forEach((p) => URL.revokeObjectURL(p));
    setFilePreviews([]); setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-light text-foreground animate-slide-up">Products</h1>
        <button onClick={() => { setIsFormOpen(!isFormOpen); if (isFormOpen) resetForm(); }}
          className="bg-foreground text-background px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors btn-press">
          {isFormOpen ? "Cancel" : "Add Product"}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-secondary/20 p-8 border border-foreground/10 mb-12 animate-slide-down shadow-lg">
          <h2 className="font-serif text-2xl mb-8 flex items-center gap-3">
             {editingId ? <><Edit size={24}/> Edit Product</> : <><Upload size={24}/> Upload New Collection Item</>}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Product Name *</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground transition-colors" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Description *</label>
                <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground resize-none transition-colors" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Price (₹) *</label>
                  <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                    className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground transition-colors" />
                </div>
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-primary/80 mb-2 block">Original Price (₹)</label>
                  <input type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="Sale compare at"
                    className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground transition-colors" />
                </div>
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-primary/80 mb-2 block">% Discount</label>
                  <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="E.g., 20"
                    className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground transition-colors" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Stock *</label>
                  <input required type="number" value={stock} onChange={(e) => setStock(e.target.value)}
                    className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground transition-colors" />
                </div>
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Category</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border-b border-foreground/20 pb-2 pt-3 bg-transparent focus:outline-none focus:border-foreground text-sm">
                    <option value="">None</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1"><label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Burn Time</label>
                  <input type="text" value={burnTime} onChange={(e) => setBurnTime(e.target.value)} className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground text-sm transition-colors" /></div>
                <div className="flex-1"><label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Wax Type</label>
                  <input type="text" value={waxType} onChange={(e) => setWaxType(e.target.value)} className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground text-sm transition-colors" /></div>
                <div className="flex-1"><label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">Weight</label>
                  <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground text-sm transition-colors" /></div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-foreground/50 block mb-2">Photos & Videos</label>
                {!editingId && (
                   <div className="border-2 border-dashed border-foreground/20 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-foreground/50 transition-colors"
                     onClick={() => fileInputRef.current?.click()}>
                     <Upload size={32} className="text-foreground/30 mb-4" />
                     <p className="text-sm font-sans text-foreground/60">Click to select images or videos</p>
                     <p className="text-xs font-sans text-foreground/30 mt-1">JPG, PNG, WEBP, MP4, MOV</p>
                     <input ref={fileInputRef} type="file" accept="image/*,video/mp4,video/quicktime" multiple className="hidden" onChange={handleFilesSelected} />
                   </div>
                )}
                {editingId && existingMedia.length > 0 && (
                   <div className="text-xs text-foreground/50 mb-2">Note: To add more images to an existing product, delete the product and recreate it for now. Existing media:</div>
                )}
                
                <div className="flex gap-3 overflow-x-auto scrollbar-hide mt-4 py-2">
                  {/* Existing media rendering (on edit) */}
                  {existingMedia.map((m) => (
                    <div key={`exist-${m.id}`} className="relative shrink-0 w-24 h-28 group">
                      {m.media_type.startsWith("video") ? (
                         <div className="w-full h-full bg-secondary flex items-center justify-center border border-foreground/10"><Film size={20} className="text-primary" /></div>
                       ) : (
                         <img src={resolveMediaUrl(m.url) || ""} alt="" className="w-full h-full object-cover border border-foreground/10" />
                       )}
                       <button type="button" onClick={() => deleteExistingMedia(m.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}

                  {/* New media previews */}
                  {filePreviews.map((preview, i) => (
                    <div key={i} className="relative shrink-0 w-24 h-28 group">
                      {selectedFiles[i]?.type.startsWith("video") ? (
                        <div className="w-full h-full bg-secondary flex items-center justify-center border border-foreground/10"><Film size={20} className="text-primary" /></div>
                      ) : (
                        <img src={preview} alt="" className="w-full h-full object-cover border border-foreground/10 border-blue-400" />
                      )}
                      <button type="button" onClick={() => removeNewFile(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-foreground/50 mb-3 block">Scent Profile</label>
                <div className="flex gap-4">
                  <input type="text" placeholder="Top Notes" value={topNotes} onChange={(e) => setTopNotes(e.target.value)} className="w-1/3 border-b border-foreground/20 py-2 text-sm bg-transparent focus:outline-none focus:border-foreground placeholder:text-foreground/30 transition-colors" />
                  <input type="text" placeholder="Mid Notes" value={midNotes} onChange={(e) => setMidNotes(e.target.value)} className="w-1/3 border-b border-foreground/20 py-2 text-sm bg-transparent focus:outline-none focus:border-foreground placeholder:text-foreground/30 transition-colors" />
                  <input type="text" placeholder="Base Notes" value={baseNotes} onChange={(e) => setBaseNotes(e.target.value)} className="w-1/3 border-b border-foreground/20 py-2 text-sm bg-transparent focus:outline-none focus:border-foreground placeholder:text-foreground/30 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-foreground/50 mb-3 block">Display on Pages</label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 text-sm font-sans text-foreground/80 cursor-pointer">
                    <input type="checkbox" checked disabled className="accent-foreground" /> Shop Page <span className="text-xs text-foreground/40">(always)</span>
                  </label>
                  <label className="flex items-center gap-3 text-sm font-sans text-foreground/80 cursor-pointer">
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-foreground" />
                    Home Page <span className="text-xs text-foreground/40">(featured section)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button disabled={isSubmitting} type="submit"
              className="bg-foreground text-background px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors btn-press disabled:opacity-50">
              {isSubmitting ? "SAVING..." : (editingId ? "SAVE CHANGES" : "SAVE TO STOREFRONT")}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-sm border-collapse min-w-[700px]">
          <thead className="text-xs uppercase tracking-[0.15em] text-foreground/50 border-b border-foreground/10 bg-secondary/5">
            <tr>
              <th className="py-4 pl-4 font-normal">Product</th>
              <th className="py-4 font-normal">Pricing</th>
              <th className="py-4 font-normal">Stock</th>
              <th className="py-4 font-normal">Visibility</th>
              <th className="py-4 font-normal text-center">Featured</th>
              <th className="py-4 pr-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors">
                <td className="py-4 pl-4 flex items-center gap-4">
                  {p.image_url ? (
                    <img src={resolveMediaUrl(p.image_url) || ""} alt="" className="w-12 h-16 object-cover bg-secondary rounded-sm" />
                  ) : (
                    <div className="w-12 h-16 bg-secondary flex items-center justify-center text-xs text-primary/40 rounded-sm"><Image size={16} /></div>
                  )}
                  <div>
                    <span className="font-serif text-lg tracking-wide">{p.name}</span>
                    <span className="text-[10px] uppercase tracking-widest text-primary/50 block mt-0.5">
                      {p.media && p.media.length > 0 ? `${p.media.length} media` : "No media"}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                   <div className="text-primary font-medium">₹{p.price.toLocaleString("en-IN")}</div>
                   {p.compare_at_price && <div className="text-xs text-primary/50 line-through">₹{p.compare_at_price.toLocaleString("en-IN")}</div>}
                   {p.discount_percent && <div className="text-[9px] uppercase tracking-widest text-green-600 bg-green-50 w-fit px-1.5 py-0.5 mt-1 rounded-sm">{p.discount_percent}% OFF</div>}
                </td>
                <td className="py-4">
                   <span className={p.stock <= 5 ? "text-red-500 font-bold" : "text-foreground"}>{p.stock}</span>
                </td>
                <td className="py-4">
                  <button onClick={() => toggleStatus(p.id, p.is_active)} className="btn-press">
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-widest rounded-sm ${p.is_active ? "bg-green-500/10 text-green-700 hover:bg-green-500/20" : "bg-red-500/10 text-red-700 hover:bg-red-500/20"}`}>
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </button>
                </td>
                <td className="py-4 text-center">
                  <button onClick={() => toggleFeatured(p.id, p.is_featured)} className="transition-colors btn-press"
                    title={p.is_featured ? "Remove from Home Page" : "Feature on Home Page"}>
                    <Star size={18} className={p.is_featured ? "fill-yellow-500 text-yellow-500" : "text-foreground/20 hover:text-yellow-400"} />
                  </button>
                </td>
                <td className="py-4 pr-4">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleEdit(p)} className="text-foreground/40 hover:text-blue-500 transition-colors btn-press" title="Edit Product">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-foreground/40 hover:text-red-500 transition-colors btn-press" title="Delete Product">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="text-center p-12 mt-4 border border-dashed border-foreground/20 text-foreground/50 uppercase tracking-widest text-xs animate-fade-in">No products created yet.</div>
      )}
    </div>
  );
}
