"use client";

import { useState, useRef } from "react";

interface RitualMediaProps {
  mediaUrl: string;
}

export default function RitualMedia({ mediaUrl }: RitualMediaProps) {
  const [aspectRatio, setAspectRatio] = useState<string>("16/9");
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = mediaUrl.match(/\.(mp4|webm|ogg|mov)(\?|$)/i);
  const isImage = mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?|$)/i);
  const youtubeMatch = mediaUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  const vimeoMatch = mediaUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const isInstagram = mediaUrl.match(/instagram\.com\/(reel|p)\//i);
  const instaEmbedUrl = isInstagram
    ? (mediaUrl.includes("/embed") ? mediaUrl : mediaUrl.replace(/\/?(\?.*)?$/, "/embed"))
    : null;

  const handleVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.videoWidth && video.videoHeight) {
      setAspectRatio(`${video.videoWidth}/${video.videoHeight}`);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setAspectRatio(`${img.naturalWidth}/${img.naturalHeight}`);
    }
  };

  // Determine if it's a portrait source (Instagram, portrait video)
  const isPortrait = !!instaEmbedUrl;

  return (
    <div
      className={`mx-auto overflow-hidden bg-secondary shadow-lg rounded-md transition-all duration-500 ${
        isPortrait ? "max-w-xs" : "max-w-lg"
      }`}
      style={{
        aspectRatio: isVideo || isImage ? aspectRatio : instaEmbedUrl ? "9/16" : "16/9",
        maxHeight: "520px",
      }}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          controls
          onLoadedMetadata={handleVideoMetadata}
          className="w-full h-full object-contain"
        />
      ) : isImage ? (
        <img
          src={mediaUrl}
          alt="Luma Ritual"
          onLoad={handleImageLoad}
          className="w-full h-full object-contain"
        />
      ) : youtubeMatch ? (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1&loop=1`}
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : vimeoMatch ? (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1`}
          className="w-full h-full border-0"
          allow="autoplay"
          allowFullScreen
        />
      ) : instaEmbedUrl ? (
        <iframe
          src={instaEmbedUrl}
          className="w-full h-full border-0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          scrolling="no"
          style={{ overflow: "hidden" }}
        />
      ) : (
        <video
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          controls
          onLoadedMetadata={handleVideoMetadata}
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
}
