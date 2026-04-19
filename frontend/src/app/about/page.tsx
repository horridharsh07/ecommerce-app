import { Metadata } from "next";
import Image from "next/image";
import { getSiteContent } from "@/lib/api";

export const metadata: Metadata = {
  title: "Our Story - Luma Candles",
  description: "Learn more about Luma Candles, our ethical sourcing, and our contact details. Reach out to us on Instagram @_lumacandles.",
  openGraph: {
    title: "About Luma Candles",
    description: "Ethically sourced, hand-poured aesthetic candles.",
    url: "https://lumacandles.vercel.app/about",
    siteName: "Luma Candles",
    images: [{ url: "/logo.jpg", width: 800, height: 800, alt: "Luma Candles Logo" }],
    locale: "en_IN",
    type: "website",
  },
};

export default async function About() {
  const content = await getSiteContent();

  return (
    <div className="animate-fade-in min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 md:px-8 text-center bg-secondary/20">
        <div className="max-w-3xl mx-auto flex flex-col items-center animate-slide-up">
          <div className="w-24 h-24 mb-6 rounded-full overflow-hidden border border-foreground/10 shadow-sm relative">
            <img src="/logo.jpg" alt="Luma Candles Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-foreground mb-6">
            Our Story
          </h1>
          <p className="font-sans text-primary leading-relaxed text-sm md:text-base px-2 whitespace-pre-wrap">
            {content["about_story"] || "Born from a love for minimal living and warm evenings, Luma Candles is a celebration of intentional spaces. Every candle we pour is a small act of care — for your home, for your rituals, for the planet."}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 px-4 md:px-8 border-t border-foreground/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: "Ethically Sourced",
              desc: "We use 100% coconut soy wax — sustainable, clean-burning, and vegan. No paraffin, no compromises.",
            },
            {
              title: "Hand-Poured",
              desc: "Each candle is poured by hand in small batches, ensuring quality and attention to every detail.",
            },
            {
              title: "Minimal by Design",
              desc: "Our aesthetic is intentional. Clean lines, soft palettes, and scents that don't overwhelm — just enhance.",
            },
          ].map((item, i) => (
            <div key={i} className={`text-center md:text-left animate-slide-up stagger-${i + 1}`}>
              <h3 className="font-serif text-2xl text-foreground mb-4">{item.title}</h3>
              <p className="font-sans text-sm text-primary leading-relaxed px-4 md:px-0">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Links */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-secondary/20 border-t border-foreground/5">
        <div className="max-w-2xl mx-auto text-center animate-slide-up">
          <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8">
            Connect With Us
          </h2>
          <div className="flex flex-col gap-6 font-sans text-sm tracking-wide text-primary">
            <p className="flex items-center justify-center gap-3">
              <span className="uppercase tracking-[0.2em] font-bold text-xs text-foreground/50">Instagram:</span>
              <a href="https://instagram.com/_lumacandles" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline transition-colors">
                @_lumacandles
              </a>
            </p>
            <p className="flex items-center justify-center gap-3">
              <span className="uppercase tracking-[0.2em] font-bold text-xs text-foreground/50">Email:</span>
              <a href={`mailto:${content["contact_email"] || "hello@lumacandles.in"}`} className="hover:text-foreground hover:underline transition-colors">
                {content["contact_email"] || "hello@lumacandles.in"}
              </a>
            </p>
          </div>
          <p className="font-sans text-foreground/40 text-[10px] uppercase tracking-[0.2em] mt-12">
            Made with love, lit with intention.
          </p>
        </div>
      </section>
    </div>
  );
}
