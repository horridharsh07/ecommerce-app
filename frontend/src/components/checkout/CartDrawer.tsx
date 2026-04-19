"use client";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
    const { isOpen, setIsOpen, items, removeFromCart, total } = useCart();
    
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[60]" onClick={() => setIsOpen(false)} />
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-background border-l border-foreground/10 z-[70] flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
                <div className="p-8 border-b border-foreground/10 flex justify-between items-center">
                    <h2 className="font-serif text-3xl font-light text-foreground">Your Cart</h2>
                    <button onClick={() => setIsOpen(false)} className="text-xs font-sans uppercase tracking-widest text-primary hover:text-foreground transition-colors">
                        Close
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10">
                    {items.length === 0 ? (
                        <p className="text-primary text-center font-sans mt-12 italic">Your cart is beautifully empty.</p>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-6 items-center">
                                <img src={item.image} alt={item.name} className="w-24 h-32 object-cover bg-secondary" />
                                <div className="flex-1">
                                    <h3 className="font-sans text-sm uppercase tracking-[0.15em]">{item.name}</h3>
                                    <p className="text-primary text-sm mt-2">₹{item.price.toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-foreground/50 mt-1 uppercase tracking-widest">Qty. {item.quantity}</p>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-foreground/40 hover:text-foreground text-xs uppercase tracking-widest transition-colors">
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-8 border-t border-foreground/10 bg-secondary/30">
                        <div className="flex justify-between items-center mb-8">
                            <span className="font-sans uppercase tracking-[0.15em] text-sm text-foreground/70">Subtotal</span>
                            <span className="font-serif text-2xl text-foreground">₹{total.toLocaleString('en-IN')}</span>
                        </div>
                        <button className="w-full bg-foreground text-background py-5 font-sans uppercase tracking-[0.2em] text-xs hover:bg-primary transition-colors">
                            Checkout Securely
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
