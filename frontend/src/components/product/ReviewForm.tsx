"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Star } from "lucide-react";

export default function ReviewForm({ productId }: { productId: number }) {
  const { user, token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!user) {
    return (
      <div className="bg-secondary/40 p-8 text-center mb-12 border border-foreground/5">
        <p className="font-sans text-sm tracking-widest uppercase text-foreground/60 mb-4">
          Share your experience
        </p>
        <a href="/login" className="text-xs uppercase tracking-[0.2em] border-b border-foreground pb-1 hover:text-primary transition-colors">
          Log in to leave a review
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return setErrorMsg("Please select a rating");
    
    setStatus("loading");
    setErrorMsg("");
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, rating, comment }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to submit review");
      
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  if (status === "success") {
    return (
      <div className="bg-secondary/40 p-8 text-center mb-12 border border-foreground/5">
        <h4 className="font-serif tracking-widest text-lg mb-2">Thank You</h4>
        <p className="font-sans text-xs uppercase tracking-[0.1em] text-foreground/60">
          Your review has been submitted and is pending approval.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-12 border border-foreground/10 p-8 bg-background">
      <h4 className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-foreground mb-6">
        Write a Review
      </h4>
      
      {errorMsg && <p className="text-red-500 text-xs mb-4 uppercase tracking-widest">{errorMsg}</p>}
      
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(rating)}
            className="focus:outline-none"
          >
            <Star
              size={20}
              className={`transition-colors ${(hover || rating) >= star ? "fill-foreground text-foreground" : "text-foreground/20"}`}
            />
          </button>
        ))}
      </div>
      
      <textarea
        placeholder="TELL US WHAT YOU THINK..."
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full bg-transparent border border-foreground/20 p-4 text-sm focus:outline-none focus:border-foreground transition-colors mb-6 uppercase tracking-widest resize-none placeholder:text-foreground/30"
      />
      
      <button 
        type="submit" 
        disabled={status === "loading"}
        className="bg-foreground text-background px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "SUBMITTING..." : "SUBMIT REVIEW"}
      </button>
    </form>
  );
}
