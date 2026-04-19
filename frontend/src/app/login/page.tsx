"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const payload: any = { email, password };
      if (showAdminKey && adminKey) {
        payload.admin_key = adminKey;
      }

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");

      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const meData = await meRes.json();

      login(data.access_token, meData);
      toast.success("WELCOME BACK");
      router.push("/shop");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-8">
      <div className="w-full max-w-md animate-slide-up">
        <h1 className="font-serif text-4xl mb-8 text-center font-light text-foreground">Welcome Back</h1>
        {error && (
          <p className="text-red-500 text-xs mb-4 text-center tracking-widest uppercase animate-slide-down">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="email" placeholder="EMAIL ADDRESS" required
            className="border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors uppercase tracking-widest placeholder:text-foreground/30"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password" placeholder="PASSWORD" required
            className="border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors uppercase tracking-widest placeholder:text-foreground/30"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          {showAdminKey && (
            <input
              type="password" placeholder="ADMIN KEY (OPTIONAL)"
              className="border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors uppercase tracking-widest placeholder:text-foreground/30 animate-slide-down"
              value={adminKey} onChange={(e) => setAdminKey(e.target.value)}
            />
          )}

          <button
            type="submit" disabled={isLoading}
            className="bg-foreground text-background py-4 text-xs font-sans uppercase tracking-[0.2em] mt-4 hover:bg-foreground/90 transition-colors btn-press disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="flex justify-between items-center text-xs tracking-widest uppercase text-foreground/50 mt-8">
          <p className="font-sans">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-foreground hover:underline">Register</Link>
          </p>
          <button type="button" onClick={() => setShowAdminKey(!showAdminKey)} className="hover:text-foreground transition-colors">
            {showAdminKey ? "Hide Admin Login" : "Admin Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
