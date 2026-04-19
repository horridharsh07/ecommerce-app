"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function Checkout() {
  const { items, clearCart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [pincode, setPincode] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const formattedItems = items.map(i => ({ product_id: Number(i.id), quantity: i.quantity }));
      const orderPayload = {
        items: formattedItems,
        discount_code: discountCode || null,
        shipping_address: address,
        shipping_city: city,
        shipping_state: stateCode,
        shipping_pincode: pincode,
      };

      const res = await fetch(`${API_BASE}/api/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.detail || "Failed to create order");

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummykey123", // Sandbox test key
        amount: Math.round(orderData.total_amount * 100), // convert to paise
        currency: "INR",
        name: "Luma Candles",
        description: "Premium Minimalist Candles",
        image: "/logo.jpg",
        order_id: orderData.razorpay_order_id,
        handler: async function (response: any) {
          // Success callback
          // Payment verification goes here usually
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          clearCart();
          router.push("/shop");
        },
        prefill: {
          name: user?.full_name,
          email: user?.email,
        },
        theme: {
          color: "#1c1917" // tailwind stone-900 / foreground
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp1.open();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
        <h1 className="font-serif text-4xl mb-6 text-foreground font-light">Your cart is empty</h1>
        <button onClick={() => router.push("/shop")} className="text-xs uppercase tracking-[0.2em] border-b border-foreground pb-1 hover:text-primary transition-colors">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen px-8 py-12 lg:py-24 animate-in fade-in duration-1000">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16">
          
          {/* Shipping Form */}
          <div className="w-full md:w-1/2">
            <h1 className="font-serif text-4xl mb-8 text-foreground font-light">Secure Checkout</h1>
            {error && <p className="text-red-500 text-xs mb-6 uppercase tracking-widest">{error}</p>}
            
            <form onSubmit={handleCheckout} className="flex flex-col gap-6">
              <h3 className="font-sans uppercase tracking-[0.2em] text-xs font-bold text-foreground">Shipping Details</h3>
              <input
                type="text" required placeholder="STREET ADDRESS"
                value={address} onChange={(e) => setAddress(e.target.value)}
                className="border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors uppercase tracking-widest placeholder:text-foreground/30"
              />
              <div className="flex gap-4">
                <input
                  type="text" required placeholder="CITY"
                  value={city} onChange={(e) => setCity(e.target.value)}
                  className="w-1/2 border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors uppercase tracking-widest placeholder:text-foreground/30"
                />
                <input
                  type="text" required placeholder="STATE"
                  value={stateCode} onChange={(e) => setStateCode(e.target.value)}
                  className="w-1/4 border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors uppercase tracking-widest placeholder:text-foreground/30"
                />
                <input
                  type="text" required placeholder="PINCODE"
                  value={pincode} onChange={(e) => setPincode(e.target.value)}
                  className="w-1/4 border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors uppercase tracking-widest placeholder:text-foreground/30"
                />
              </div>

              <h3 className="font-sans uppercase tracking-[0.2em] text-xs font-bold text-foreground mt-8">Discount</h3>
              <input
                type="text" placeholder="DISCOUNT CODE (OPTIONAL)"
                value={discountCode} onChange={(e) => setDiscountCode(e.target.value)}
                className="border-b border-foreground/20 py-3 bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors uppercase tracking-widest placeholder:text-foreground/30"
              />

              <button 
                type="submit" 
                disabled={isProcessing}
                className="bg-foreground text-background py-5 text-xs font-sans uppercase tracking-[0.2em] mt-8 hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {isProcessing ? "PROCESSING..." : "PROCEED TO PAYMENT"}
              </button>
            </form>
          </div>

          {/* Cart Summary */}
          <div className="w-full md:w-1/2 bg-secondary/30 p-8 border border-foreground/5 h-fit">
            <h3 className="font-sans uppercase tracking-[0.2em] text-xs font-bold text-foreground mb-8">Order Summary</h3>
            <div className="flex flex-col gap-6 mb-8 border-b border-foreground/10 pb-8">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-secondary overflow-hidden shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex flex-col flex-grow py-1">
                    <h4 className="font-serif tracking-wide text-foreground">{item.name}</h4>
                    <p className="text-xs uppercase tracking-widest text-primary/60 mt-1">Qty: {item.quantity}</p>
                    <p className="text-sm tracking-wide text-foreground mt-auto text-right">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-sm uppercase tracking-widest mb-4">
              <span className="text-foreground/60">Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center text-sm uppercase tracking-widest mb-8">
              <span className="text-foreground/60">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between items-center border-t border-foreground/20 pt-8 font-serif text-2xl">
              <span>Total</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
