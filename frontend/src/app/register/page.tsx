"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        let msg = "Registration failed";
        if (typeof data.detail === "string") msg = data.detail;
        else if (Array.isArray(data.detail)) msg = data.detail[0].msg;
        throw new Error(msg);
      }

      toast.success("ACCOUNT CREATED");
      router.push("/login");
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
        <h1 className="font-serif text-4xl mb-8 text-center font-light text-foreground">Create Account</h1>
        {error && (
          <p className="text-red-500 text-xs mb-4 text-center tracking-widest uppercase animate-slide-down">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input type="text" placeholder="FULL NAME" required
            className="border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors uppercase tracking-widest placeholder:text-foreground/30"
            value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input type="email" placeholder="EMAIL ADDRESS" required
            className="border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors tracking-widest placeholder:text-foreground/30 placeholder:uppercase"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="PASSWORD" required minLength={8}
            className="border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors tracking-widest placeholder:text-foreground/30 placeholder:uppercase"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" disabled={isLoading}
            className="bg-foreground text-background py-4 text-xs font-sans uppercase tracking-[0.2em] mt-4 hover:bg-foreground/90 transition-colors btn-press disabled:opacity-50">
            {isLoading ? "Creating..." : "Register"}
          </button>
        </form>
        <p className="font-sans text-xs text-center mt-8 tracking-widest uppercase text-foreground/50">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
