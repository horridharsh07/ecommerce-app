import Image from "next/image";

export default function Home() {
  return (
    <div className="animate-in fade-in duration-1000">
      
      {/* Hero Welcome Segment */}
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-8 text-center bg-secondary/30">
        <div className="space-y-6 max-w-2xl">
          <h1 className="font-serif text-6xl md:text-8xl font-light tracking-wide text-foreground">
            LUMA
          </h1>
          <p className="font-sans text-lg md:text-xl text-primary font-light mx-auto leading-relaxed">
            Curating minimal spaces with warmth and scent. <br className="hidden md:block"/>
            Ethically poured, undeniably cozy.
          </p>
          
          <div className="pt-8">
            <button className="px-10 py-4 bg-foreground text-background font-sans tracking-[0.2em] text-sm uppercase hover:bg-primary transition-colors duration-300">
              Shop Collection
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Video Showcase Segment */}
      <section className="py-24 px-8 bg-background border-t border-foreground/5">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl font-light text-foreground mb-4">The Ritual</h2>
            <p className="font-sans text-primary mb-12">Experience the pour, the wick, the glow.</p>
            
            <div className="aspect-[9/16] md:aspect-video w-full max-w-2xl mx-auto overflow-hidden bg-secondary shadow-lg relative rounded-md">
              <iframe 
                src="https://www.instagram.com/reel/DU_VuD2klkT/embed" 
                className="w-full h-full border-0 absolute inset-0"
                allowFullScreen
                scrolling="no"
              ></iframe>
            </div>
        </div>
      </section>

    </div>
  );
}
