/**
 * Typed API client for the FastAPI backend + browser hooks.
 * - Reads NEXT_PUBLIC_API_URL (default http://localhost:8000/api/v1)
 * - Persists JWT in localStorage under "cr_token"
 * - Exposes a shared "resource" store so mutations in one page invalidate
 *   the corresponding query in every other page listening to it.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const TOKEN_KEY = "cr_token";

// -----------------------------------------------------------------------------
// Token & fetch
// -----------------------------------------------------------------------------

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
  bus.dispatchEvent(new Event("auth"));
}

export function logout() {
  setToken(null);
}

export class ApiError extends Error {
  status: number;
  detail?: unknown;
  constructor(msg: string, status: number, detail?: unknown) {
    super(msg);
    this.status = status;
    this.detail = detail;
  }
}

type FetchOpts = RequestInit & { skipAuth?: boolean };

export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!headers.has("Content-Type") && opts.body) headers.set("Content-Type", "application/json");
  const token = opts.skipAuth ? null : getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...opts, headers, credentials: "omit" });
  } catch (e) {
    throw new ApiError((e as Error).message || "Network error", 0);
  }
  const ct = res.headers.get("content-type") ?? "";
  const isJson = ct.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const detail = (isJson && (body as { detail?: unknown })?.detail) || body;
    throw new ApiError(`${res.status} ${res.statusText}`, res.status, detail);
  }
  return body as T;
}

export async function tryFetch<T>(path: string, opts: FetchOpts = {}): Promise<T | null> {
  try { return await apiFetch<T>(path, opts); } catch { return null; }
}

// -----------------------------------------------------------------------------
// Types shared with the backend
// -----------------------------------------------------------------------------

export type Page<T> = { items: T[]; total: number; page: number; size: number };

export type Me = {
  id: number; username: string; full_name: string; email?: string | null;
  is_active: boolean; is_superuser: boolean; branch_id?: number | null;
  roles: string[];
};

export type ApiBarcode = { id: number; code: string; label?: string | null };

export type ApiProduct = {
  id: number; sku: string; name: string; description?: string | null;
  category_id?: number | null; brand_id?: number | null;
  unit: string; price: string | number; cost: string | number;
  tax_percent: string | number; is_weighted: boolean;
  reorder_point: number; is_active: boolean;
  emoji?: string | null; image_url?: string | null;
  barcodes: ApiBarcode[];
  stock?: string | number | null;
};

export type ApiCustomer = {
  id: number; code: string; full_name: string; phone?: string | null;
  email?: string | null; address?: string | null; group_id?: number | null;
  credit_limit: string | number; balance: string | number;
  store_credit: string | number; loyalty_points: number; is_active: boolean;
};

export type ApiBranch = {
  id: number; company_id: number; code: string; name: string; city?: string | null;
  address?: string | null; phone?: string | null; manager_name?: string | null;
  is_active: boolean;
};

export type ApiRegister = {
  id: number; branch_id: number; code: string; name: string;
  is_active: boolean; is_online: boolean;
};

export type ApiEmployee = {
  id: number; code: string; full_name: string; role_title: string;
  branch_id?: number | null; phone?: string | null; is_active: boolean;
};

export type ApiSupplier = {
  id: number; code: string; name: string; phone?: string | null;
  email?: string | null; city?: string | null;
  payment_terms_days: number; lead_time_days: number;
  balance: string | number; rating: string | number; is_active: boolean;
};

export type ApiSaleItem = {
  id: number; product_id: number; product_name: string; sku: string;
  quantity: string | number; unit: string;
  unit_price: string | number; discount_percent: string | number;
  discount_amount: string | number; tax_percent: string | number;
  tax_amount: string | number; line_total: string | number;
};

export type ApiPayment = {
  id: number; method: string; amount: string | number;
  reference?: string | null; provider?: string | null; approved: boolean;
  created_at: string;
};

export type ApiSale = {
  id: number; invoice_no: string; branch_id: number;
  register_id?: number | null; shift_id?: number | null;
  cashier_id?: number | null; customer_id?: number | null;
  status: "held" | "completed" | "voided" | "returned";
  type: string;
  subtotal: string | number; discount_total: string | number;
  tax_total: string | number; grand_total: string | number;
  paid_total: string | number; change_due: string | number;
  completed_at?: string | null; created_at: string;
  items: ApiSaleItem[]; payments: ApiPayment[];
};

export type ApiSummary = {
  kpi: { today_sales: string | number; today_invoices: number;
         today_refunds: string | number; active_customers: number };
  branches: { id: number; name: string; today_sales: string | number; invoices: number }[];
  payment_mix: { method: string; total: string | number }[];
  sales_trend: { date: string; total: string | number }[];
  low_stock: { product_id: number; name: string; on_hand: string | number; reorder_point: number }[];
};

// -----------------------------------------------------------------------------
// Typed endpoint helpers
// -----------------------------------------------------------------------------

export const api = {
  // auth
  login: (username: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST", body: JSON.stringify({ username, password }), skipAuth: true,
    }),
  loginPin: (pin: string, register_id?: number) =>
    apiFetch<{ access_token: string; token_type: string }>("/auth/login/pin", {
      method: "POST", body: JSON.stringify({ pin, register_id }), skipAuth: true,
    }),
  me: () => apiFetch<Me>("/auth/me"),

  // products
  listProducts: (params: { q?: string; page?: number; size?: number } = {}) => {
    const s = new URLSearchParams();
    if (params.q) s.set("q", params.q);
    s.set("page", String(params.page ?? 1));
    s.set("size", String(params.size ?? 200));
    return apiFetch<Page<ApiProduct>>(`/products?${s.toString()}`);
  },
  findByBarcode: (code: string) => apiFetch<ApiProduct>(`/products/barcode/${encodeURIComponent(code)}`),
  createProduct: (payload: {
    sku: string; name: string; description?: string; category_id?: number; brand_id?: number;
    unit?: string; price?: number | string; cost?: number | string;
    tax_percent?: number | string; is_weighted?: boolean;
    reorder_point?: number; emoji?: string; barcodes?: string[];
  }) => apiFetch<ApiProduct>("/products", { method: "POST", body: JSON.stringify(payload) }),

  // customers
  listCustomers: (params: { q?: string; page?: number; size?: number } = {}) => {
    const s = new URLSearchParams();
    if (params.q) s.set("q", params.q);
    s.set("page", String(params.page ?? 1));
    s.set("size", String(params.size ?? 200));
    return apiFetch<Page<ApiCustomer>>(`/customers?${s.toString()}`);
  },
  createCustomer: (payload: Partial<ApiCustomer> & { code: string; full_name: string }) =>
    apiFetch<ApiCustomer>("/customers", { method: "POST", body: JSON.stringify(payload) }),

  // sales
  listSales: (params: { branch_id?: number; page?: number; size?: number } = {}) => {
    const s = new URLSearchParams();
    if (params.branch_id) s.set("branch_id", String(params.branch_id));
    s.set("page", String(params.page ?? 1));
    s.set("size", String(params.size ?? 25));
    return apiFetch<Page<ApiSale>>(`/sales?${s.toString()}`);
  },
  createSale: (payload: {
    branch_id: number; items: { product_id: number; quantity: number | string;
      unit_price?: number | string; discount_percent?: number | string }[];
    payments?: { method: string; amount: number | string; reference?: string }[];
    invoice_discount_percent?: number | string; customer_id?: number | null;
    register_id?: number | null; client_uid?: string; is_offline?: boolean;
    status?: "completed" | "held"; notes?: string;
  }) => apiFetch<ApiSale>("/sales", { method: "POST", body: JSON.stringify(payload) }),
  voidSale: (id: number) => apiFetch<ApiSale>(`/sales/${id}/void`, { method: "POST" }),

  // branches / registers / employees
  listBranches: () => apiFetch<ApiBranch[]>("/branches"),
  listRegisters: (branchId: number) => apiFetch<ApiRegister[]>(`/branches/${branchId}/registers`),
  listWarehouses: (branchId: number) =>
    apiFetch<{ id: number; branch_id: number; code: string; name: string; is_active: boolean }[]>(
      `/branches/${branchId}/warehouses`,
    ),
  listEmployees: () => apiFetch<ApiEmployee[]>("/employees"),

  // suppliers / purchases / promotions
  listSuppliers: () => apiFetch<Page<ApiSupplier>>("/suppliers?size=200"),
  listPurchases: () => apiFetch<{
    id: number; number: string; supplier_id: number; warehouse_id: number;
    status: string; total: string | number; notes?: string | null; items: unknown[];
  }[]>("/purchases"),
  listPromotions: () => apiFetch<{
    id: number; name: string; type: string; scope: string; scope_ref?: string | null;
    value: string | number; is_active: boolean;
  }[]>("/promotions"),

  // shifts
  openShifts: () => apiFetch<{
    id: number; code: string; register_id: number; branch_id: number;
    cashier_id: number; status: string; opening_cash: string | number;
    expected_cash: string | number; counted_cash: string | number;
    difference: string | number; opened_at: string; closed_at?: string | null;
  }[]>("/shifts?status_filter=open"),

  // inventory + reports
  inventoryLevels: () => apiFetch<{
    product_id: number; warehouse_id: number; on_hand: string | number; reserved: string | number;
  }[]>("/inventory/levels"),
  dashboardSummary: () => apiFetch<ApiSummary>("/dashboard/summary"),
  hourlyReport: () => apiFetch<{ hour: number; total: string | number; invoices: number }[]>("/reports/hourly"),
  topProducts: (limit = 10) =>
    apiFetch<{ product_id: number; name: string; qty: string | number; revenue: string | number }[]>(
      `/reports/top-products?limit=${limit}`,
    ),

  // health
  health: () => apiFetch<{ status: string }>("/../health", { skipAuth: true }),
};

// -----------------------------------------------------------------------------
// Resource bus — pages invalidate each other's queries by resource key
// -----------------------------------------------------------------------------

export type Resource =
  | "products" | "customers" | "sales" | "branches" | "employees"
  | "suppliers" | "purchases" | "promotions" | "shifts" | "inventory"
  | "dashboard" | "reports";

const bus: EventTarget = typeof window === "undefined" ? new EventTarget() : (window as unknown as EventTarget & { __crBus?: EventTarget }).__crBus ?? (() => {
  const t = new EventTarget();
  (window as unknown as { __crBus: EventTarget }).__crBus = t;
  return t;
})();

export function invalidate(...resources: Resource[]) {
  for (const r of resources) bus.dispatchEvent(new CustomEvent(`inv:${r}`));
}

// -----------------------------------------------------------------------------
// React hooks
// -----------------------------------------------------------------------------

type UseApiState<T> = { data: T | null; loading: boolean; error: string | null; offline: boolean };

/**
 * Fetch once + auto-refetch whenever `invalidate(resource)` is called from anywhere.
 * When the API is unavailable (network error, 502, etc.), `offline` becomes true and
 * `fallback` (if provided) is returned so pages can degrade gracefully.
 */
export function useApi<T>(
  resource: Resource,
  fetcher: () => Promise<T>,
  fallback?: T,
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: fallback ?? null, loading: true, error: null, offline: false,
  });
  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const d = await fetcher();
      if (!mountedRef.current) return;
      setState({ data: d, loading: false, error: null, offline: false });
    } catch (e) {
      if (!mountedRef.current) return;
      const err = e as ApiError;
      const isOffline = err.status === 0 || err.status === 502 || err.status === 503;
      setState({
        data: fallback ?? null,
        loading: false,
        error: typeof err.detail === "string" ? err.detail : err.message,
        offline: isOffline,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  useEffect(() => {
    mountedRef.current = true;
    run();
    const onInv = () => run();
    const onAuth = () => run();
    bus.addEventListener(`inv:${resource}`, onInv);
    bus.addEventListener("auth", onAuth);
    return () => {
      mountedRef.current = false;
      bus.removeEventListener(`inv:${resource}`, onInv);
      bus.removeEventListener("auth", onAuth);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, run]);

  return { ...state, refetch: run };
}

// -----------------------------------------------------------------------------
// Health probe — lightweight app-wide indicator
// -----------------------------------------------------------------------------

export function useApiHealth(): { online: boolean; me: Me | null } {
  const [online, setOnline] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function probe() {
      try {
        const meRes = await tryFetch<Me>("/auth/me");
        if (cancelled) return;
        if (meRes) {
          setOnline(true);
          setMe(meRes);
        } else {
          // no valid token yet — check raw health
          const h = await fetch(`${BASE.replace(/\/api\/v1$/, "")}/health`).catch(() => null);
          if (cancelled) return;
          setOnline(!!h && h.ok);
          setMe(null);
        }
      } catch {
        if (!cancelled) { setOnline(false); setMe(null); }
      }
    }
    probe();
    const onAuth = () => probe();
    bus.addEventListener("auth", onAuth);
    const interval = window.setInterval(probe, 30_000);
    return () => {
      cancelled = true;
      bus.removeEventListener("auth", onAuth);
      window.clearInterval(interval);
    };
  }, []);

  return { online, me };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

export function toNumber(v: string | number | null | undefined, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function newClientUid(prefix = "pos"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
