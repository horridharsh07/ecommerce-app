import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/checkout/CartDrawer";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Luma Candles | Handcrafted Aesthetic Candles",
  description: "Discover our signature scents, hand-poured for your sanctuary. Premium, aesthetic, and cozy candles.",
  openGraph: {
    title: "Luma Candles",
    description: "Discover our signature scents, hand-poured for your sanctuary.",
    url: "https://lumacandles.in",
    siteName: "Luma Candles",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luma Candles",
    description: "Minimalist, ethically poured cozy candles.",
  }
};

import { getSiteContent } from "@/lib/api";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();

  const customStyle: React.CSSProperties = {};
  if (content.global_bg) customStyle.backgroundColor = content.global_bg;
  if (content.global_text) customStyle.color = content.global_text;

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased font-sans bg-background text-foreground`} style={customStyle}>
        {content.custom_css && <style dangerouslySetInnerHTML={{ __html: content.custom_css }} />}
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <Toaster 
              position="bottom-center"
              toastOptions={{
                style: {
                  borderRadius: '0',
                  background: 'var(--foreground)',
                  color: 'var(--background)',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontFamily: 'var(--font-sans)',
                  padding: '16px 24px',
                },
              }} 
            />
            <main className="min-h-screen pt-24">
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
