"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function AdminContent() {
  const { token } = useAuth();
  const [content, setContent] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => { if (token) fetchData(); }, [token]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/content/`);
      const data = await res.json();
      // Initialize default keys if not present
      const initial = { ...data };
      if (!initial["home_hero_title"]) initial["home_hero_title"] = "LUMA";
      if (!initial["home_hero_subtitle"]) initial["home_hero_subtitle"] = "Curating minimal spaces with warmth and scent.\nEthically poured, undeniably cozy.";
      if (!initial["about_story"]) initial["about_story"] = "Born from a love for minimal living and warm evenings, Luma Candles is a celebration of intentional spaces.";
      if (!initial["contact_email"]) initial["contact_email"] = "hello@lumacandles.in";
      
      // Defaults for dynamic style layout
      if (initial["show_video"] === undefined) initial["show_video"] = "true";
      if (!initial["ritual_embed_url"]) initial["ritual_embed_url"] = "https://www.instagram.com/reel/DU_VuD2klkT/embed";
      if (!initial["global_bg"]) initial["global_bg"] = "";
      if (!initial["global_text"]) initial["global_text"] = "";
      if (!initial["custom_css"]) initial["custom_css"] = "";
      
      setContent(initial);
    } catch (err) { console.error(err); }
  };

  const handleChange = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const items = Object.entries(content).map(([key, value]) => ({ key, value }));
      const res = await fetch(`${API_BASE}/api/content/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Failed to save content");
      toast.success("CONTENT UPDATED");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in pb-20 max-w-4xl">
      <h1 className="font-serif text-4xl font-light text-foreground mb-8 animate-slide-up">Site Content (CMS)</h1>
      <p className="font-sans text-sm text-primary mb-8 tracking-wide">
        Update the text, titles, and details displayed across the public pages.
      </p>

      <form onSubmit={handleSubmit} className="bg-secondary/20 p-8 border border-foreground/10 animate-slide-down">
        
        {/* Home Page Content */}
        <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-foreground/50 mb-6 border-b border-foreground/10 pb-2">Home Page</h2>
        <div className="flex flex-col gap-6 mb-12">
          <div>
            <label className="text-xs tracking-widest text-foreground/80 mb-2 block">Hero Title</label>
            <input type="text" value={content["home_hero_title"] || ""} onChange={(e) => handleChange("home_hero_title", e.target.value)}
              className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground transition-colors font-serif text-2xl" />
          </div>
          <div>
            <label className="text-xs tracking-widest text-foreground/80 mb-2 block">Hero Subtitle</label>
            <textarea rows={3} value={content["home_hero_subtitle"] || ""} onChange={(e) => handleChange("home_hero_subtitle", e.target.value)}
              className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground resize-none transition-colors" />
          </div>
        </div>

        {/* About Page Content */}
        <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-foreground/50 mb-6 border-b border-foreground/10 pb-2">About Us Page</h2>
        <div className="flex flex-col gap-6 mb-12">
          <div>
            <label className="text-xs tracking-widest text-foreground/80 mb-2 block">Our Story Paragraph</label>
            <textarea rows={4} value={content["about_story"] || ""} onChange={(e) => handleChange("about_story", e.target.value)}
              className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground resize-none transition-colors" />
          </div>
        </div>

        {/* Contact Info */}
        <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-foreground/50 mb-6 border-b border-foreground/10 pb-2">Global Contact Details</h2>
        <div className="flex flex-col gap-6 mb-12">
          <div>
            <label className="text-xs tracking-widest text-foreground/80 mb-2 block">Support/Contact Email</label>
            <input type="text" value={content["contact_email"] || ""} onChange={(e) => handleChange("contact_email", e.target.value)}
              className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground transition-colors" />
          </div>
        </div>

        {/* Global Appearance & Layout */}
        <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-foreground/50 mb-6 border-b border-foreground/10 pb-2 mt-8">Global Appearance & CSS</h2>
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <input type="checkbox" id="show_video" checked={content["show_video"] !== "false"} 
                     onChange={(e) => handleChange("show_video", e.target.checked ? "true" : "false")} />
              <label htmlFor="show_video" className="text-xs tracking-widest text-foreground/80">Show "The Ritual" Media Section on Landing Page</label>
            </div>
            {content["show_video"] !== "false" && (
              <div>
                <label className="text-xs tracking-widest text-foreground/80 mb-2 block">Ritual Media URL (Instagram Embed URL, Direct .mp4, or Image Link)</label>
                <input type="text" placeholder="https://www.instagram.com/reel/.../embed" value={content["ritual_embed_url"] || ""} onChange={(e) => handleChange("ritual_embed_url", e.target.value)}
                  className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground transition-colors" />
                <p className="text-[10px] text-primary/60 mt-2">Supports Instagram Embeds, direct video links (.mp4), and direct image links (.jpg, .png).</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs tracking-widest text-foreground/80 mb-2 block">Global Background Color (Hex, rgba, etc.)</label>
              <input type="text" placeholder="#FAF9F6" value={content["global_bg"] || ""} onChange={(e) => handleChange("global_bg", e.target.value)}
                className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground transition-colors" />
            </div>
            <div>
              <label className="text-xs tracking-widest text-foreground/80 mb-2 block">Global Text / Primary Color</label>
              <input type="text" placeholder="#1A1A1A" value={content["global_text"] || ""} onChange={(e) => handleChange("global_text", e.target.value)}
                className="w-full border-b border-foreground/20 py-2 bg-transparent focus:outline-none focus:border-foreground transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs tracking-widest text-foreground/80 mb-2 block">Custom CSS (Injected globally)</label>
            <textarea rows={6} placeholder=".btn-press { transform: scale(0.95); }" value={content["custom_css"] || ""} onChange={(e) => handleChange("custom_css", e.target.value)}
              className="w-full border-b border-foreground/20 py-2 bg-transparent font-mono text-sm focus:outline-none focus:border-foreground resize-vertical transition-colors" />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button disabled={isSubmitting} type="submit"
            className="bg-foreground text-background px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] hover:bg-primary transition-colors btn-press disabled:opacity-50">
            {isSubmitting ? "SAVING..." : "SAVE SITE SETTINGS"}
          </button>
        </div>
      </form>
    </div>
  );
}
