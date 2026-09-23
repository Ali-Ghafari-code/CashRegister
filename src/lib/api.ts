/**
 * Thin API client for the FastAPI backend.
 * Reads the base URL from NEXT_PUBLIC_API_URL (default: http://localhost:8000/api/v1).
 * Falls back to `null` if the backend is unreachable so pages can degrade to mock data.
 */

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

const TOKEN_KEY = "cr_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

type FetchOpts = RequestInit & { skipAuth?: boolean };

export class ApiError extends Error {
  status: number;
  detail?: unknown;
  constructor(msg: string, status: number, detail?: unknown) {
    super(msg);
    this.status = status;
    this.detail = detail;
  }
}

export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!headers.has("Content-Type") && opts.body) headers.set("Content-Type", "application/json");
  const token = opts.skipAuth ? null : getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    credentials: "omit",
  });
  const ct = res.headers.get("content-type") ?? "";
  const isJson = ct.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const detail = (isJson && (body as { detail?: unknown })?.detail) || body;
    throw new ApiError(`${res.status} ${res.statusText}`, res.status, detail);
  }
  return body as T;
}

/**
 * Try a request; if it fails (network error or non-2xx) return null so callers
 * can fall back to mock data without breaking the page render.
 */
export async function tryFetch<T>(path: string, opts: FetchOpts = {}): Promise<T | null> {
  try {
    return await apiFetch<T>(path, opts);
  } catch {
    return null;
  }
}

// ----- Typed helpers -----

export const api = {
  login: (username: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    }),
  loginPin: (pin: string, register_id?: number) =>
    apiFetch<{ access_token: string; token_type: string }>("/auth/login/pin", {
      method: "POST",
      body: JSON.stringify({ pin, register_id }),
      skipAuth: true,
    }),
  me: () => apiFetch<{
    id: number; username: string; full_name: string; roles: string[]; branch_id?: number;
  }>("/auth/me"),

  listProducts: (q?: string, page = 1, size = 25) =>
    apiFetch<{ items: any[]; total: number; page: number; size: number }>(
      `/products?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page), size: String(size) })}`,
    ),
  findByBarcode: (code: string) => apiFetch<any>(`/products/barcode/${encodeURIComponent(code)}`),

  createSale: (payload: unknown) =>
    apiFetch<any>("/sales", { method: "POST", body: JSON.stringify(payload) }),
  listSales: () => apiFetch<{ items: any[]; total: number }>("/sales"),

  dashboardSummary: () => apiFetch<any>("/dashboard/summary"),
  hourlySales: () => apiFetch<any[]>("/reports/hourly"),
  topProducts: () => apiFetch<any[]>("/reports/top-products?limit=10"),

  listCustomers: (q?: string) => apiFetch<{ items: any[] }>(`/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  listBranches: () => apiFetch<any[]>("/branches"),
  listSuppliers: () => apiFetch<{ items: any[] }>("/suppliers"),
  listEmployees: () => apiFetch<any[]>("/employees"),
  listPromotions: () => apiFetch<any[]>("/promotions"),
  listPurchases: () => apiFetch<any[]>("/purchases"),
  openShifts: () => apiFetch<any[]>("/shifts?status_filter=open"),
};
