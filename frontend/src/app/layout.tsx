import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/checkout/CartDrawer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Luma Candles",
  description: "Minimalist, ethically poured cozy candles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased font-sans bg-background text-foreground`}>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="min-h-screen pt-24">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
