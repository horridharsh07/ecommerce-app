// Utility functions

export function getProxyImageUrl(originalUrl: string | null): string | null {
  if (!originalUrl) return null;
  if (originalUrl.startsWith("http://") || originalUrl.startsWith("https://")) {
    if (originalUrl.includes("instagram.") || originalUrl.includes("fbcdn.net")) {
      // Route instagram CDN URLs through our backend proxy to bypass CORS
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      return `${API_BASE}/api/proxy/image?url=${encodeURIComponent(originalUrl)}`;
    }
  }
  return originalUrl;
}
