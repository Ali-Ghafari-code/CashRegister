/**
 * Client-side mock backend.
 *
 * When the real FastAPI backend is unreachable, apiFetch() routes to
 * mockHandle(). This module mimics the same endpoint shapes so pages that
 * use useApi() and typed `api.*` helpers keep working end-to-end without
 * any changes — you can create products, customers, run sales in POS,
 * void invoices, and everything reflects on the dashboard/reports.
 *
 * State persists to localStorage under `cr_mock_state_v2`, seeded with a
 * rich Persian dataset (5 branches, 18 products, 5 customers, 5 suppliers,
 * 6 employees, 5 promotions, some open shifts, plus 14 days of historical
 * sales for a realistic dashboard).
 */

import type {
  ApiBranch, ApiCustomer, ApiEmployee, ApiProduct, ApiRegister,
  ApiSale, ApiSaleItem, ApiPayment, ApiSummary, ApiSupplier,
  Me, Page,
} from "@/lib/api";

// -----------------------------------------------------------------------------
// State shape
// -----------------------------------------------------------------------------

type MockPurchase = {
  id: number; number: string; supplier_id: number; warehouse_id: number;
  status: "draft" | "approved" | "partial" | "received" | "cancelled";
  total: number; notes?: string | null;
  items: { id: number; product_id: number; quantity: number; received: number; unit_cost: number }[];
};

type MockPromotion = {
  id: number; name: string; type: "percent" | "fixed" | "bxgy" | "bundle" | "tiered";
  scope: string; scope_ref?: string | null; value: number; is_active: boolean;
};

type MockShift = {
  id: number; code: string; register_id: number; branch_id: number;
  cashier_id: number; status: "open" | "closed";
  opening_cash: number; expected_cash: number; counted_cash: number; difference: number;
  opened_at: string; closed_at?: string | null;
};

type MockInventoryLevel = {
  product_id: number; warehouse_id: number; on_hand: number; reserved: number;
};

type Warehouse = { id: number; branch_id: number; code: string; name: string; is_active: boolean };

type MockState = {
  seq: {
    product: number; customer: number; sale: number; sale_item: number;
    payment: number; purchase: number; purchase_item: number; barcode: number;
  };
  invoice_counters: Record<string, number>; // "branchId:YYYYMMDD" -> counter

  branches: ApiBranch[];
  registers: ApiRegister[];
  warehouses: Warehouse[];
  employees: ApiEmployee[];
  suppliers: ApiSupplier[];
  customers: ApiCustomer[];
  products: ApiProduct[];
  inventory: MockInventoryLevel[];
  sales: ApiSale[];
  purchases: MockPurchase[];
  promotions: MockPromotion[];
  shifts: MockShift[];

  users: (Me & { password: string; pin: string })[];

  seenClientUids: string[];
};

// -----------------------------------------------------------------------------
// Storage
// -----------------------------------------------------------------------------

const KEY = "cr_mock_state_v2";
let cached: MockState | null = null;

function load(): MockState {
  if (cached) return cached;
  if (typeof window === "undefined") { cached = seed(); return cached; }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) { cached = JSON.parse(raw) as MockState; return cached; }
  } catch { /* ignore */ }
  cached = seed();
  save(cached);
  return cached;
}

function save(next: MockState) {
  cached = next;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
}

export function resetMockBackend() {
  const s = seed();
  save(s);
}

// -----------------------------------------------------------------------------
// Seed data
// -----------------------------------------------------------------------------

function seed(): MockState {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();

  const branches: ApiBranch[] = [
    { id: 1, company_id: 1, code: "BR-001", name: "شعبه مرکزی تهران", city: "تهران", manager_name: "سعید تهرانی", is_active: true, address: null, phone: null },
    { id: 2, company_id: 1, code: "BR-002", name: "شعبه ونک", city: "تهران", manager_name: "مریم شاهی", is_active: true, address: null, phone: null },
    { id: 3, company_id: 1, code: "BR-003", name: "شعبه اصفهان چهارباغ", city: "اصفهان", manager_name: "امیر نجفی", is_active: true, address: null, phone: null },
    { id: 4, company_id: 1, code: "BR-004", name: "شعبه مشهد رضا", city: "مشهد", manager_name: "فاطمه رضوی", is_active: true, address: null, phone: null },
    { id: 5, company_id: 1, code: "BR-005", name: "شعبه شیراز زند", city: "شیراز", manager_name: "بهرام کاووسی", is_active: true, address: null, phone: null },
  ];

  const registers: ApiRegister[] = [];
  const warehouses: Warehouse[] = [];
  for (const b of branches) {
    warehouses.push({ id: b.id, branch_id: b.id, code: `WH-${b.code}`, name: `انبار ${b.name}`, is_active: true });
    for (let r = 1; r <= 3; r++) {
      registers.push({ id: (b.id - 1) * 3 + r, branch_id: b.id, code: `R${r}`, name: `صندوق ${r}`, is_active: true, is_online: r !== 3 || b.id !== 2 });
    }
  }

  const employees: ApiEmployee[] = [
    { id: 1, code: "E-0001", full_name: "رضا مرادی", role_title: "صندوقدار", branch_id: 1, phone: "09121110001", is_active: true },
    { id: 2, code: "E-0002", full_name: "سمیرا حسینی", role_title: "صندوقدار ارشد", branch_id: 1, phone: "09121110002", is_active: true },
    { id: 3, code: "E-0003", full_name: "کوروش امینی", role_title: "سرشیفت", branch_id: 2, phone: "09121110003", is_active: true },
    { id: 4, code: "E-0004", full_name: "مریم شاهی", role_title: "مدیر شعبه", branch_id: 2, phone: "09121110004", is_active: true },
    { id: 5, code: "E-0005", full_name: "بهنام قربانی", role_title: "انبار", branch_id: 3, phone: "09121110005", is_active: true },
    { id: 6, code: "E-0006", full_name: "لیلا کاظمی", role_title: "حسابدار", branch_id: 1, phone: "09121110006", is_active: true },
  ];

  const suppliers: ApiSupplier[] = [
    { id: 1, code: "SUP-001", name: "شرکت پگاه شمال", phone: "01133445566", city: "آمل", payment_terms_days: 30, lead_time_days: 3, balance: 128_400_000, rating: 4.6, is_active: true, email: null },
    { id: 2, code: "SUP-002", name: "کاله آمل", phone: "01144556677", city: "آمل", payment_terms_days: 30, lead_time_days: 4, balance: 82_500_000, rating: 4.4, is_active: true, email: null },
    { id: 3, code: "SUP-003", name: "چی‌توز البرز", phone: "02633221100", city: "کرج", payment_terms_days: 45, lead_time_days: 5, balance: 42_100_000, rating: 4.2, is_active: true, email: null },
    { id: 4, code: "SUP-004", name: "کوکاکولا ایران", phone: "02188889900", city: "تهران", payment_terms_days: 15, lead_time_days: 2, balance: 320_000_000, rating: 4.8, is_active: true, email: null },
    { id: 5, code: "SUP-005", name: "لادن گلستان", phone: "01733221199", city: "گرگان", payment_terms_days: 60, lead_time_days: 7, balance: 18_200_000, rating: 4.1, is_active: true, email: null },
  ];

  const customers: ApiCustomer[] = [
    { id: 1, code: "CU-0001", full_name: "علی رضایی", phone: "09121234567", group_id: 3, credit_limit: 2_000_000, balance: 0, store_credit: 0, loyalty_points: 12500, is_active: true, email: null, address: null },
    { id: 2, code: "CU-0002", full_name: "زهرا محمدی", phone: "09354443322", group_id: 2, credit_limit: 2_000_000, balance: 250_000, store_credit: 0, loyalty_points: 4800, is_active: true, email: null, address: null },
    { id: 3, code: "CU-0003", full_name: "شرکت پارس‌گستر", phone: "02188887766", group_id: 4, credit_limit: 10_000_000, balance: 5_400_000, store_credit: 0, loyalty_points: 0, is_active: true, email: null, address: null },
    { id: 4, code: "CU-0004", full_name: "محمد کریمی", phone: "09129988776", group_id: null, credit_limit: 500_000, balance: 0, store_credit: 0, loyalty_points: 900, is_active: true, email: null, address: null },
    { id: 5, code: "CU-0005", full_name: "نگار احمدی", phone: "09391112233", group_id: 3, credit_limit: 3_000_000, balance: 0, store_credit: 120_000, loyalty_points: 21400, is_active: true, email: null, address: null },
    { id: 6, code: "CU-0006", full_name: "حسین صادقی", phone: "09122223344", group_id: 1, credit_limit: 0, balance: 0, store_credit: 0, loyalty_points: 250, is_active: true, email: null, address: null },
  ];

  const productSeeds: [string, string, string, string, number, number, string, string, boolean, number][] = [
    ["SKU-1001", "شیر پرچرب پگاه ۱ لیتری", "لبنیات", "پگاه", 42000, 33000, "عدد", "🥛", false, 30],
    ["SKU-1002", "ماست موسیر کاله ۵۰۰ گرمی", "لبنیات", "کاله", 68500, 51000, "عدد", "🥣", false, 20],
    ["SKU-1003", "پنیر لیقوان تازه", "لبنیات", "محلی", 320000, 260000, "کیلوگرم", "🧀", true, 15],
    ["SKU-2001", "نوشابه کوکاکولا ۱.۵ لیتری", "نوشیدنی", "کوکاکولا", 55000, 42000, "عدد", "🥤", false, 50],
    ["SKU-2002", "آب معدنی دماوند ۱.۵ لیتری", "نوشیدنی", "دماوند", 18000, 13500, "عدد", "💧", false, 80],
    ["SKU-3001", "چیپس چاکلز پنیری", "تنقلات", "چی‌توز", 39000, 29500, "عدد", "🍟", false, 40],
    ["SKU-3002", "پفک نمکی مینو", "تنقلات", "مینو", 22000, 15500, "عدد", "🌽", false, 60],
    ["SKU-4001", "برنج ایرانی هاشمی ۱۰ کیلویی", "خواروبار", "طلای شمال", 1650000, 1380000, "کیسه", "🍚", false, 25],
    ["SKU-4002", "روغن سرخ‌کردنی لادن ۱.۸ لیتری", "خواروبار", "لادن", 245000, 205000, "عدد", "🛢️", false, 20],
    ["SKU-5001", "مایع ظرفشویی اکتیو ۳.۷۵ لیتری", "شوینده", "اکتیو", 175000, 138000, "عدد", "🧴", false, 25],
    ["SKU-6001", "شامپو حجم‌دهنده کلیر ۴۰۰ml", "بهداشتی", "کلیر", 235000, 178000, "عدد", "🧴", false, 20],
    ["SKU-6002", "خمیر دندان سیگنال ضد پوسیدگی", "بهداشتی", "سیگنال", 68000, 52000, "عدد", "🪥", false, 40],
    ["SKU-7001", "مرغ تازه", "پروتئینی", "کشتارگاه ۹۱۰", 195000, 172000, "کیلوگرم", "🍗", true, 15],
    ["SKU-7002", "ران گوسفندی", "پروتئینی", "محلی", 890000, 780000, "کیلوگرم", "🥩", true, 15],
    ["SKU-8001", "پرتقال تامسون درجه یک", "میوه و سبزی", "شمال", 78000, 58000, "کیلوگرم", "🍊", true, 30],
    ["SKU-8002", "سیب زرد لبنانی", "میوه و سبزی", "ارومیه", 92000, 71000, "کیلوگرم", "🍎", true, 30],
    ["SKU-9001", "نان بربری کنجدی", "نانوایی", "محلی", 24000, 15000, "عدد", "🥖", false, 50],
    ["SKU-9002", "نان لواش ماشینی", "نانوایی", "محلی", 14000, 9000, "بسته", "🥙", false, 100],
  ];

  const products: ApiProduct[] = productSeeds.map(([sku, name, _cat, _brand, price, cost, unit, emoji, weighted, rp], i) => ({
    id: i + 1,
    sku,
    name,
    description: null,
    category_id: null,
    brand_id: null,
    unit,
    price,
    cost,
    tax_percent: 9,
    is_weighted: weighted,
    reorder_point: rp,
    is_active: true,
    emoji,
    image_url: null,
    barcodes: [{ id: i + 1, code: `626010000${String(i + 1).padStart(4, "0")}`, label: "EAN" }],
    stock: 0, // will be computed later
  }));

  // Opening stock per warehouse
  const inventory: MockInventoryLevel[] = [];
  for (const b of branches) {
    for (const p of products) {
      const base = p.is_weighted ? 25 : 60;
      const noise = ((p.id * 7 + b.id * 3) % 30);
      inventory.push({
        product_id: p.id,
        warehouse_id: b.id,
        on_hand: Math.max(5, base - noise),
        reserved: 0,
      });
    }
  }

  // aggregate stock into products for quick display
  for (const p of products) {
    p.stock = inventory.filter((l) => l.product_id === p.id).reduce((s, l) => s + Number(l.on_hand), 0);
  }

  const promotions: MockPromotion[] = [
    { id: 1, name: "خرید ۲ ببر ۱ رایگان — چیپس چاکلز", type: "bxgy", scope: "product", scope_ref: "6", value: 33, is_active: true },
    { id: 2, name: "تخفیف ۱۵٪ لبنیات — پنج‌شنبه‌ها", type: "percent", scope: "category", scope_ref: "لبنیات", value: 15, is_active: true },
    { id: 3, name: "هدیه تولد اعضای طلایی", type: "fixed", scope: "customer_group", scope_ref: "طلایی", value: 100000, is_active: true },
    { id: 4, name: "کوپن ۵۰٬۰۰۰ تومانی خرید بالای ۵۰۰ هزار", type: "fixed", scope: "coupon", scope_ref: "WELCOME50", value: 50000, is_active: false },
    { id: 5, name: "کمپین پایان هفته — نوشیدنی‌ها", type: "percent", scope: "category", scope_ref: "نوشیدنی", value: 10, is_active: true },
  ];

  const purchases: MockPurchase[] = [
    { id: 1, number: `PO-${now.getFullYear().toString().slice(2)}0001`, supplier_id: 1, warehouse_id: 1, status: "received", total: 128_500_000, notes: null,
      items: [{ id: 1, product_id: 1, quantity: 200, received: 200, unit_cost: 33000 }, { id: 2, product_id: 2, quantity: 100, received: 100, unit_cost: 51000 }] },
    { id: 2, number: `PO-${now.getFullYear().toString().slice(2)}0002`, supplier_id: 2, warehouse_id: 1, status: "partial", total: 74_200_000, notes: null,
      items: [{ id: 3, product_id: 3, quantity: 40, received: 20, unit_cost: 260000 }] },
    { id: 3, number: `PO-${now.getFullYear().toString().slice(2)}0003`, supplier_id: 3, warehouse_id: 2, status: "approved", total: 92_000_000, notes: null,
      items: [{ id: 4, product_id: 6, quantity: 200, received: 0, unit_cost: 29500 }, { id: 5, product_id: 7, quantity: 300, received: 0, unit_cost: 15500 }] },
    { id: 4, number: `PO-${now.getFullYear().toString().slice(2)}0004`, supplier_id: 4, warehouse_id: 1, status: "approved", total: 210_000_000, notes: null,
      items: [{ id: 6, product_id: 4, quantity: 1000, received: 0, unit_cost: 42000 }] },
  ];

  const shifts: MockShift[] = [
    { id: 1, code: `SH-001-${dayKey(now)}-001`, register_id: 1, branch_id: 1, cashier_id: 1, status: "open", opening_cash: 5_000_000, expected_cash: 12_400_000, counted_cash: 0, difference: 0, opened_at: iso(new Date(now.getTime() - 6 * 3600_000)) },
    { id: 2, code: `SH-002-${dayKey(now)}-001`, register_id: 2, branch_id: 1, cashier_id: 2, status: "open", opening_cash: 5_000_000, expected_cash: 9_800_000, counted_cash: 0, difference: 0, opened_at: iso(new Date(now.getTime() - 5 * 3600_000)) },
    { id: 3, code: `SH-004-${dayKey(now)}-001`, register_id: 4, branch_id: 2, cashier_id: 3, status: "open", opening_cash: 4_000_000, expected_cash: 6_100_000, counted_cash: 0, difference: 0, opened_at: iso(new Date(now.getTime() - 4 * 3600_000)) },
  ];

  const users: (Me & { password: string; pin: string })[] = [
    { id: 1, username: "admin", full_name: "مدیر سیستم", email: "admin@cashregister.local", is_active: true, is_superuser: true, branch_id: 1, roles: ["admin"], password: "admin123", pin: "0000" },
    { id: 2, username: "cashier1", full_name: "رضا مرادی", email: null, is_active: true, is_superuser: false, branch_id: 1, roles: ["cashier"], password: "cashier123", pin: "1234" },
    { id: 3, username: "cashier2", full_name: "سمیرا حسینی", email: null, is_active: true, is_superuser: false, branch_id: 1, roles: ["cashier"], password: "cashier123", pin: "5678" },
    { id: 4, username: "manager", full_name: "مریم شاهی", email: null, is_active: true, is_superuser: false, branch_id: 2, roles: ["manager"], password: "manager123", pin: "9999" },
  ];

  const state: MockState = {
    seq: { product: products.length, customer: customers.length, sale: 0, sale_item: 0, payment: 0, purchase: purchases.length, purchase_item: 10, barcode: products.length },
    invoice_counters: {},
    branches, registers, warehouses,
    employees, suppliers, customers, products,
    inventory, sales: [], purchases, promotions, shifts,
    users, seenClientUids: [],
  };

  // Backfill 14 days of history for a realistic dashboard
  const cashiers = [1, 2, 3];
  const paymentDistribution: [ApiPayment["method"] extends string ? string : never, number][] = [
    ["cash", 0.35], ["card", 0.45], ["wallet", 0.1], ["qr", 0.05], ["gift_card", 0.03], ["credit", 0.02],
  ] as any;

  for (let d = 13; d >= 0; d--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
    const invoiceCount = d === 0 ? 12 : 18 + Math.floor(Math.random() * 10);
    for (let i = 0; i < invoiceCount; i++) {
      const branch = branches[i % branches.length];
      const cashierId = cashiers[i % cashiers.length];
      const itemCount = 1 + (i % 4);
      const itemPicks: number[] = [];
      for (let k = 0; k < itemCount; k++) itemPicks.push(1 + ((i * 7 + k * 13 + d * 3) % products.length));
      const items = itemPicks.map((pid) => ({ product_id: pid, quantity: 1 + (pid % 3), discount_percent: 0 }));
      const at = new Date(day.getTime() + (9 + Math.floor(Math.random() * 12)) * 3600_000 + Math.floor(Math.random() * 3600_000));

      const [method] = paymentDistribution[Math.floor(Math.random() * paymentDistribution.length)];
      simulateSale(state, {
        branch_id: branch.id,
        cashier_id: cashierId,
        register_id: (branch.id - 1) * 3 + 1,
        items,
        payments: [{ method: method as any, amount: 999_999_999 }], // will be trimmed to grand_total inside
        at,
      });
    }
  }

  return state;
}

// -----------------------------------------------------------------------------
// Sale helpers (shared with POS create/void)
// -----------------------------------------------------------------------------

function dayKey(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function nextInvoiceNo(state: MockState, branchId: number, at = new Date()): string {
  const key = `${branchId}:${dayKey(at)}`;
  const n = (state.invoice_counters[key] ?? 0) + 1;
  state.invoice_counters[key] = n;
  return `INV-${String(branchId).padStart(3, "0")}-${dayKey(at)}-${String(n).padStart(5, "0")}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function toNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function simulateSale(
  state: MockState,
  opts: {
    branch_id: number;
    cashier_id?: number | null;
    register_id?: number | null;
    customer_id?: number | null;
    items: { product_id: number; quantity: number | string; unit_price?: number | string; discount_percent?: number | string }[];
    payments: { method: string; amount: number | string; reference?: string; provider?: string }[];
    invoice_discount_percent?: number | string;
    client_uid?: string;
    at?: Date;
    status?: "completed" | "held";
  },
): ApiSale {
  if (opts.client_uid && state.seenClientUids.includes(opts.client_uid)) {
    const existing = state.sales.find((s) => s.invoice_no.endsWith(opts.client_uid!));
    if (existing) return existing;
  }
  const at = opts.at ?? new Date();
  const invoice = nextInvoiceNo(state, opts.branch_id, at);
  const warehouse = state.warehouses.find((w) => w.branch_id === opts.branch_id)!;

  let subtotal = 0, lineDiscount = 0;
  const items: ApiSaleItem[] = [];
  for (const it of opts.items) {
    const product = state.products.find((p) => p.id === it.product_id);
    if (!product) continue;
    const qty = toNum(it.quantity);
    const unitPrice = it.unit_price !== undefined ? toNum(it.unit_price) : toNum(product.price);
    const dp = toNum(it.discount_percent);
    const gross = round2(qty * unitPrice);
    const disc = round2((gross * dp) / 100);
    subtotal += gross;
    lineDiscount += disc;
    items.push({
      id: ++state.seq.sale_item,
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      quantity: qty,
      unit: product.unit,
      unit_price: unitPrice,
      discount_percent: dp,
      discount_amount: disc,
      tax_percent: toNum(product.tax_percent),
      tax_amount: 0,
      line_total: round2(gross - disc),
    });
    // decrement stock
    const lvl = state.inventory.find((l) => l.product_id === product.id && l.warehouse_id === warehouse.id);
    if (lvl) lvl.on_hand = Math.max(0, lvl.on_hand - qty);
    // aggregate stock on product
    product.stock = state.inventory.filter((l) => l.product_id === product.id).reduce((s, l) => s + l.on_hand, 0);
  }

  const afterLines = subtotal - lineDiscount;
  const invPct = toNum(opts.invoice_discount_percent ?? 0);
  const invDisc = round2((afterLines * invPct) / 100);
  const discountTotal = lineDiscount + invDisc;

  let taxTotal = 0;
  for (const it of items) {
    if (invDisc > 0 && afterLines > 0) {
      const share = round2((it.line_total as number) * invDisc / afterLines);
      it.line_total = round2((it.line_total as number) - share);
      it.discount_amount = round2((it.discount_amount as number) + share);
    }
    it.tax_amount = round2((it.line_total as number) * toNum(it.tax_percent) / 100);
    taxTotal += toNum(it.tax_amount);
  }
  const grand = round2(subtotal - discountTotal + taxTotal);

  // Trim/pad payment to grand total (mock is forgiving)
  const paymentSum = opts.payments.reduce((s, p) => s + Math.min(toNum(p.amount), grand), 0);
  const paid = round2(Math.max(paymentSum, grand));
  const paymentsOut: ApiPayment[] = [];
  let acc = 0;
  for (const p of opts.payments) {
    const amount = round2(Math.min(toNum(p.amount), grand - acc));
    if (amount <= 0) break;
    acc += amount;
    paymentsOut.push({
      id: ++state.seq.payment,
      method: p.method,
      amount,
      reference: p.reference ?? null,
      provider: p.provider ?? null,
      approved: true,
      created_at: at.toISOString(),
    });
    if (acc >= grand) break;
  }
  if (paymentsOut.length === 0 && grand > 0) {
    // guarantee at least one payment
    paymentsOut.push({
      id: ++state.seq.payment, method: opts.payments[0]?.method ?? "cash", amount: grand,
      reference: null, provider: null, approved: true, created_at: at.toISOString(),
    });
  }

  const sale: ApiSale = {
    id: ++state.seq.sale,
    invoice_no: opts.client_uid ? `${invoice}#${opts.client_uid}` : invoice,
    branch_id: opts.branch_id,
    register_id: opts.register_id ?? null,
    shift_id: null,
    cashier_id: opts.cashier_id ?? 1,
    customer_id: opts.customer_id ?? null,
    status: opts.status ?? "completed",
    type: "retail",
    subtotal,
    discount_total: discountTotal,
    tax_total: taxTotal,
    grand_total: grand,
    paid_total: paid,
    change_due: round2(Math.max(0, paid - grand)),
    completed_at: opts.status === "held" ? null : at.toISOString(),
    created_at: at.toISOString(),
    items,
    payments: paymentsOut,
  };
  state.sales.unshift(sale);
  if (opts.client_uid) state.seenClientUids.push(opts.client_uid);

  // If this shift is open, credit the register expected_cash
  const cashPaid = paymentsOut.filter((p) => p.method === "cash").reduce((s, p) => s + toNum(p.amount), 0);
  const shift = state.shifts.find((s) => s.status === "open" && s.register_id === (opts.register_id ?? -1));
  if (shift) {
    shift.expected_cash = round2(shift.expected_cash + cashPaid - toNum(sale.change_due));
  }
  return sale;
}

// -----------------------------------------------------------------------------
// URL parsing helpers
// -----------------------------------------------------------------------------

function parsePath(fullPath: string): { path: string; query: URLSearchParams } {
  const idx = fullPath.indexOf("?");
  if (idx < 0) return { path: fullPath, query: new URLSearchParams() };
  return { path: fullPath.slice(0, idx), query: new URLSearchParams(fullPath.slice(idx + 1)) };
}

function readBody<T = unknown>(opts: RequestInit): T | undefined {
  if (opts.body === undefined || opts.body === null) return undefined;
  try {
    const raw = typeof opts.body === "string" ? opts.body : String(opts.body);
    return JSON.parse(raw) as T;
  } catch { return undefined; }
}

function page<T>(items: T[], q: URLSearchParams): Page<T> {
  const p = Math.max(1, Number(q.get("page") ?? 1));
  const size = Math.max(1, Number(q.get("size") ?? 25));
  const total = items.length;
  const slice = items.slice((p - 1) * size, (p - 1) * size + size);
  return { items: slice, total, page: p, size };
}

// -----------------------------------------------------------------------------
// Main handler
// -----------------------------------------------------------------------------

export function isMockPath(path: string): boolean {
  // Everything under our API surface is mockable
  return true;
}

export async function mockHandle<T>(fullPath: string, opts: RequestInit): Promise<T> {
  const s = load();
  const { path, query } = parsePath(fullPath);
  const method = (opts.method ?? "GET").toUpperCase();

  // -------- auth --------
  if (path === "/auth/login" && method === "POST") {
    const body = readBody<{ username: string; password: string }>(opts) ?? { username: "", password: "" };
    const user = s.users.find((u) => u.username === body.username);
    if (!user) throw mockErr(401, "Wrong username or password");
    // Demo mode: accept correct or default admin
    if (user.password !== body.password && body.username !== "admin") {
      throw mockErr(401, "Wrong username or password");
    }
    save(s);
    return { access_token: `demo-token-${user.id}-${Date.now()}`, token_type: "bearer" } as T;
  }
  if (path === "/auth/login/pin" && method === "POST") {
    const body = readBody<{ pin: string }>(opts) ?? { pin: "" };
    const user = s.users.find((u) => u.pin === body.pin);
    if (!user) throw mockErr(401, "Invalid PIN");
    return { access_token: `demo-token-${user.id}-${Date.now()}`, token_type: "bearer" } as T;
  }
  if (path === "/auth/me" && method === "GET") {
    // In demo mode, always return admin (no real JWT verification)
    const me = s.users[0];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, pin, ...safe } = me;
    return safe as unknown as T;
  }

  // -------- branches --------
  if (path === "/branches" && method === "GET") return s.branches as T;
  if (/^\/branches\/\d+\/registers$/.test(path) && method === "GET") {
    const id = Number(path.split("/")[2]);
    return s.registers.filter((r) => r.branch_id === id) as T;
  }
  if (/^\/branches\/\d+\/warehouses$/.test(path) && method === "GET") {
    const id = Number(path.split("/")[2]);
    return s.warehouses.filter((w) => w.branch_id === id) as T;
  }

  // -------- employees --------
  if (path === "/employees" && method === "GET") return s.employees as T;

  // -------- suppliers --------
  if (path === "/suppliers" && method === "GET") return page(s.suppliers, query) as T;

  // -------- promotions --------
  if (path === "/promotions" && method === "GET") return s.promotions as T;

  // -------- shifts --------
  if (path === "/shifts" && method === "GET") {
    const filter = query.get("status_filter");
    let list = s.shifts;
    if (filter === "open") list = list.filter((x) => x.status === "open");
    else if (filter === "closed") list = list.filter((x) => x.status === "closed");
    return list as T;
  }

  // -------- products --------
  if (path === "/products" && method === "GET") {
    const q = (query.get("q") ?? "").trim();
    let items = s.products;
    if (q) {
      items = items.filter((p) =>
        p.name.includes(q) ||
        p.sku.toLowerCase().includes(q.toLowerCase()) ||
        p.barcodes.some((b) => b.code.includes(q)),
      );
    }
    return page(items, query) as T;
  }
  if (/^\/products\/barcode\/.+$/.test(path) && method === "GET") {
    const code = decodeURIComponent(path.slice("/products/barcode/".length));
    const p = s.products.find((x) => x.sku === code || x.barcodes.some((b) => b.code === code));
    if (!p) throw mockErr(404, "Product not found");
    return p as T;
  }
  if (/^\/products\/\d+$/.test(path) && method === "GET") {
    const id = Number(path.split("/")[2]);
    const p = s.products.find((x) => x.id === id);
    if (!p) throw mockErr(404, "Not found");
    return p as T;
  }
  if (path === "/products" && method === "POST") {
    const body = readBody<{
      sku: string; name: string; description?: string | null;
      category_id?: number | null; brand_id?: number | null;
      unit?: string; price?: number | string; cost?: number | string;
      tax_percent?: number | string; is_weighted?: boolean;
      reorder_point?: number; is_active?: boolean; emoji?: string;
      image_url?: string | null; barcodes?: string[];
    }>(opts);
    if (!body?.sku || !body?.name) throw mockErr(400, "SKU and name required");
    if (s.products.some((p) => p.sku === body.sku)) throw mockErr(400, "SKU already exists");
    const newP: ApiProduct = {
      id: ++s.seq.product,
      sku: body.sku, name: body.name,
      description: body.description ?? null,
      category_id: body.category_id ?? null, brand_id: body.brand_id ?? null,
      unit: body.unit ?? "عدد",
      price: toNum(body.price), cost: toNum(body.cost),
      tax_percent: toNum(body.tax_percent ?? 9),
      is_weighted: !!body.is_weighted,
      reorder_point: Number(body.reorder_point ?? 0),
      is_active: body.is_active ?? true,
      emoji: body.emoji ?? "📦",
      image_url: body.image_url ?? null,
      barcodes: (body.barcodes ?? []).filter(Boolean).map((bc) => ({ id: ++s.seq.barcode, code: bc, label: "EAN" })),
      stock: 0,
    };
    s.products.push(newP);
    // Give each warehouse a small opening stock so the product is usable at once
    for (const w of s.warehouses) {
      s.inventory.push({ product_id: newP.id, warehouse_id: w.id, on_hand: 20, reserved: 0 });
    }
    newP.stock = s.inventory.filter((l) => l.product_id === newP.id).reduce((sum, l) => sum + l.on_hand, 0);
    save(s);
    return newP as T;
  }

  // -------- customers --------
  if (path === "/customers" && method === "GET") {
    const q = (query.get("q") ?? "").trim();
    let items = s.customers;
    if (q) {
      items = items.filter((c) =>
        c.full_name.includes(q) ||
        (c.phone ?? "").includes(q) ||
        c.code.includes(q),
      );
    }
    return page(items, query) as T;
  }
  if (path === "/customers" && method === "POST") {
    const body = readBody<Partial<ApiCustomer> & { code: string; full_name: string }>(opts);
    if (!body?.full_name) throw mockErr(400, "Name required");
    const code = body.code ?? `CU-${String(1000 + s.customers.length).padStart(4, "0")}`;
    if (s.customers.some((c) => c.code === code)) throw mockErr(400, "Customer code exists");
    const c: ApiCustomer = {
      id: ++s.seq.customer,
      code,
      full_name: body.full_name,
      phone: body.phone ?? null, email: body.email ?? null, address: body.address ?? null,
      group_id: body.group_id ?? null,
      credit_limit: toNum(body.credit_limit ?? 0),
      balance: 0, store_credit: 0, loyalty_points: 0,
      is_active: body.is_active ?? true,
    };
    s.customers.push(c);
    save(s);
    return c as T;
  }
  if (/^\/customers\/\d+$/.test(path) && method === "GET") {
    const id = Number(path.split("/")[2]);
    const c = s.customers.find((x) => x.id === id);
    if (!c) throw mockErr(404, "Not found");
    return c as T;
  }

  // -------- sales --------
  if (path === "/sales" && method === "GET") {
    let items = s.sales;
    const branchId = query.get("branch_id");
    if (branchId) items = items.filter((x) => x.branch_id === Number(branchId));
    return page(items, query) as T;
  }
  if (path === "/sales" && method === "POST") {
    const body = readBody<{
      branch_id: number;
      items: any[]; payments?: any[]; invoice_discount_percent?: number;
      customer_id?: number | null; register_id?: number | null;
      client_uid?: string; status?: "completed" | "held";
    }>(opts);
    if (!body || !body.items?.length) throw mockErr(400, "Sale must contain at least one item");
    const sale = simulateSale(s, {
      branch_id: body.branch_id,
      cashier_id: 1,
      register_id: body.register_id ?? null,
      customer_id: body.customer_id ?? null,
      items: body.items,
      payments: (body.payments ?? []).map((p) => ({ method: p.method, amount: p.amount, reference: p.reference, provider: p.provider })),
      invoice_discount_percent: body.invoice_discount_percent,
      client_uid: body.client_uid,
      status: body.status ?? "completed",
    });
    // give customer loyalty points if provided
    if (body.customer_id) {
      const cust = s.customers.find((c) => c.id === body.customer_id);
      if (cust) cust.loyalty_points += Math.floor(toNum(sale.grand_total) / 10000);
    }
    save(s);
    return sale as T;
  }
  if (/^\/sales\/\d+$/.test(path) && method === "GET") {
    const id = Number(path.split("/")[2]);
    const sale = s.sales.find((x) => x.id === id);
    if (!sale) throw mockErr(404, "Not found");
    return sale as T;
  }
  if (/^\/sales\/\d+\/void$/.test(path) && method === "POST") {
    const id = Number(path.split("/")[2]);
    const sale = s.sales.find((x) => x.id === id);
    if (!sale) throw mockErr(404, "Not found");
    if (sale.status !== "voided") {
      sale.status = "voided";
      const warehouseId = s.warehouses.find((w) => w.branch_id === sale.branch_id)?.id;
      if (warehouseId !== undefined) {
        for (const it of sale.items) {
          const lvl = s.inventory.find((l) => l.product_id === it.product_id && l.warehouse_id === warehouseId);
          if (lvl) lvl.on_hand += toNum(it.quantity);
          const p = s.products.find((pp) => pp.id === it.product_id);
          if (p) p.stock = s.inventory.filter((l) => l.product_id === p.id).reduce((sum, l) => sum + l.on_hand, 0);
        }
      }
    }
    save(s);
    return sale as T;
  }

  // -------- purchases --------
  if (path === "/purchases" && method === "GET") return s.purchases as T;

  // -------- inventory --------
  if (path === "/inventory/levels" && method === "GET") return s.inventory as T;

  // -------- dashboard / reports --------
  if (path === "/dashboard/summary" && method === "GET") {
    const now = new Date();
    const todayKey = dayKey(now);
    const todaySales = s.sales.filter((x) => x.status === "completed" && dayKey(new Date(x.created_at)) === todayKey);
    const kpi = {
      today_sales: todaySales.reduce((sum, x) => sum + toNum(x.grand_total), 0),
      today_invoices: todaySales.length,
      today_refunds: s.sales.filter((x) => x.status === "returned" && dayKey(new Date(x.created_at)) === todayKey)
        .reduce((sum, x) => sum + toNum(x.grand_total), 0),
      active_customers: s.customers.filter((c) => c.is_active).length,
    };
    const branchesOut = s.branches.map((b) => {
      const list = todaySales.filter((x) => x.branch_id === b.id);
      return { id: b.id, name: b.name, today_sales: list.reduce((sum, x) => sum + toNum(x.grand_total), 0), invoices: list.length };
    });
    // Payment mix (today only)
    const paymentMap = new Map<string, number>();
    for (const sale of todaySales) {
      for (const p of sale.payments) {
        paymentMap.set(p.method, (paymentMap.get(p.method) ?? 0) + toNum(p.amount));
      }
    }
    const payment_mix = Array.from(paymentMap.entries()).map(([method, total]) => ({ method, total }));
    // 14-day trend
    const sales_trend: { date: string; total: number }[] = [];
    for (let d = 13; d >= 0; d--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
      const key = dayKey(day);
      const total = s.sales.filter((x) => x.status === "completed" && dayKey(new Date(x.created_at)) === key)
        .reduce((sum, x) => sum + toNum(x.grand_total), 0);
      sales_trend.push({ date: day.toISOString().slice(0, 10), total });
    }
    // Low stock
    const low_stock = s.products
      .map((p) => ({ product_id: p.id, name: p.name, on_hand: toNum(p.stock ?? 0), reorder_point: p.reorder_point }))
      .filter((x) => x.on_hand <= x.reorder_point)
      .slice(0, 12);

    const summary: ApiSummary = { kpi, branches: branchesOut, payment_mix, sales_trend, low_stock };
    return summary as T;
  }

  if (path === "/reports/hourly" && method === "GET") {
    const now = new Date();
    const key = dayKey(now);
    const hours: Record<number, { total: number; invoices: number }> = {};
    for (let h = 8; h <= 22; h++) hours[h] = { total: 0, invoices: 0 };
    for (const sale of s.sales) {
      if (sale.status !== "completed") continue;
      const d = new Date(sale.created_at);
      if (dayKey(d) !== key) continue;
      const h = d.getHours();
      if (!hours[h]) hours[h] = { total: 0, invoices: 0 };
      hours[h].total += toNum(sale.grand_total);
      hours[h].invoices += 1;
    }
    return Object.entries(hours)
      .map(([h, v]) => ({ hour: Number(h), total: v.total, invoices: v.invoices }))
      .filter((x) => x.total > 0 || x.invoices > 0) as T;
  }

  if (path === "/reports/top-products" && method === "GET") {
    const limit = Number(query.get("limit") ?? 10);
    const map = new Map<number, { name: string; qty: number; revenue: number }>();
    for (const sale of s.sales) {
      if (sale.status !== "completed") continue;
      for (const it of sale.items) {
        const entry = map.get(it.product_id) ?? { name: it.product_name, qty: 0, revenue: 0 };
        entry.qty += toNum(it.quantity);
        entry.revenue += toNum(it.line_total);
        map.set(it.product_id, entry);
      }
    }
    const arr = Array.from(map.entries())
      .map(([product_id, v]) => ({ product_id, name: v.name, qty: v.qty, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
    return arr as T;
  }

  // Health probe path
  if (path === "/../health") return { status: "ok" } as T;

  throw mockErr(404, `Mock backend: no handler for ${method} ${path}`);
}

function mockErr(status: number, detail: string): Error & { status: number; detail: string } {
  const e = new Error(`${status} ${detail}`) as Error & { status: number; detail: string };
  e.status = status;
  e.detail = detail;
  return e;
}
