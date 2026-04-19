const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ───

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface ProductMedia {
  id: number;
  url: string;
  media_type: string;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  discount_percent: number | null;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: number | null;
  category: Category | null;
  top_notes: string | null;
  mid_notes: string | null;
  base_notes: string | null;
  burn_time: string | null;
  wax_type: string | null;
  weight: string | null;
  media: ProductMedia[];
  created_at: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  per_page: number;
}

export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
}

// ─── Fetch helpers ───

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    next: { revalidate: 60 },
  } as any);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "API request failed");
  }

  return res.json();
}

// ─── Public API functions ───

export async function getProducts(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
}): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.per_page) query.set("per_page", String(params.per_page));
  if (params?.category) query.set("category", params.category);
  if (params?.search) query.set("search", params.search);

  const qs = query.toString();
  return apiFetch<ProductListResponse>(`/api/products${qs ? `?${qs}` : ""}`);
}

export async function getProduct(id: number): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/api/products/featured");
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

export async function getProductReviews(productId: number): Promise<Review[]> {
  return apiFetch<Review[]>(`/api/reviews/product/${productId}`);
}

export async function getSiteContent(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_BASE}/api/content/`, { cache: "no-store" });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}
