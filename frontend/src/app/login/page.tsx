"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");

      // Fetch user profile immediately after login
      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const meData = await meRes.json();
      
      login(data.access_token, meData);
      router.push("/shop");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-8 animate-in fade-in duration-700">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-4xl mb-8 text-center font-light text-foreground">Welcome Back</h1>
        {error && <p className="text-red-500 text-xs mb-4 text-center tracking-widest uppercase">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            required
            className="border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors uppercase tracking-widest placeholder:text-foreground/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="PASSWORD"
            required
            className="border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors uppercase tracking-widest placeholder:text-foreground/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-foreground text-background py-4 text-xs font-sans uppercase tracking-[0.2em] mt-4 hover:bg-foreground/90 transition-colors">
            Sign In
          </button>
        </form>
        <p className="font-sans text-xs text-center mt-8 tracking-widest uppercase text-foreground/50">
          Don't have an account? <Link href="/register" className="text-foreground hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
