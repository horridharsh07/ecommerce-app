// Utility functions

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Resolves a media URL to a displayable form.
 * - Local uploads (/static/...) → prepend API_BASE
 * - Instagram/fbcdn URLs → route through backend proxy
 * - Everything else → return as-is
 */
export function resolveMediaUrl(originalUrl: string | null): string | null {
  if (!originalUrl) return null;

  // Local upload path from backend
  if (originalUrl.startsWith("/static/")) {
    return `${API_BASE}${originalUrl}`;
  }

  // External URLs — proxy Instagram CDN to bypass CORS
  if (originalUrl.startsWith("http://") || originalUrl.startsWith("https://")) {
    if (originalUrl.includes("instagram.") || originalUrl.includes("fbcdn.net")) {
      return `${API_BASE}/api/proxy/image?url=${encodeURIComponent(originalUrl)}`;
    }
  }

  return originalUrl;
}

// Backward-compatible alias
export const getProxyImageUrl = resolveMediaUrl;
