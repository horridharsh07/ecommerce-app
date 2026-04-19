"use client";

import { useState } from "react";
import { resolveMediaUrl } from "@/lib/utils";

interface MediaItem {
  id: number;
  url: string;
  media_type: string;
  sort_order: number;
}

interface Props {
  primaryImage: string | null;
  media: MediaItem[];
  productName: string;
}

export default function MediaGallery({ primaryImage, media, productName }: Props) {
  const allMedia: MediaItem[] = [];

  // Add primary image first (if not already in media list)
  if (primaryImage) {
    const inMedia = media.some((m) => m.url === primaryImage);
    if (!inMedia) {
      allMedia.push({ id: 0, url: primaryImage, media_type: "image", sort_order: -1 });
    }
  }
  allMedia.push(...[...media].sort((a, b) => a.sort_order - b.sort_order));

  const [activeIndex, setActiveIndex] = useState(0);

  if (allMedia.length === 0) {
    return (
      <div className="aspect-[4/5] bg-secondary flex items-center justify-center animate-fade-in">
        <span className="text-3xl font-serif text-primary/40 tracking-widest">LUMA</span>
      </div>
    );
  }

  const current = allMedia[activeIndex];
  const resolvedUrl = resolveMediaUrl(current.url);

  return (
    <div className="flex flex-col gap-3 animate-slide-up">
      {/* Main Display */}
      <div className="aspect-[4/5] bg-secondary overflow-hidden relative group">
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
        {current.media_type === "video" ? (
          <video
            key={current.id}
            src={resolvedUrl || ""}
            controls
            playsInline
            className="w-full h-full object-cover animate-fade-in"
          />
        ) : (
          <img
            key={current.id}
            src={resolvedUrl || ""}
            alt={productName}
            className="w-full h-full object-cover animate-fade-in"
          />
        )}
      </div>

      {/* Thumbnail Strip (scrollable) */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 animate-fade-in stagger-3">
          {allMedia.map((m, i) => {
            const thumbUrl = resolveMediaUrl(m.url);
            return (
              <button
                key={m.id}
                onClick={() => setActiveIndex(i)}
                className={`w-20 h-24 shrink-0 overflow-hidden transition-all duration-300 border-2 btn-press ${
                  i === activeIndex
                    ? "border-foreground opacity-100"
                    : "border-transparent opacity-40 hover:opacity-75"
                }`}
              >
                {m.media_type === "video" ? (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <span className="text-xl text-primary">▶</span>
                  </div>
                ) : (
                  <img src={thumbUrl || ""} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
