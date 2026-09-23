"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ScanBarcode, Search, Plus, Minus, Trash2, PauseCircle, UserRound,
  BadgePercent, Banknote, CreditCard, Wallet, Gift, QrCode, Printer,
  RotateCcw, Keyboard, Settings2, ArrowLeft, Boxes, X, Check, LayoutGrid,
  Star, Clock, ShieldAlert, Wifi, CheckCircle2, AlertCircle,
} from "lucide-react";
import { products as mockProducts, CATEGORIES, heldCarts, type Product } from "@/lib/mock-data";
import { cn, formatToman, toFa, jalaliToday } from "@/lib/utils";
import {
  api, useApi, invalidate, toNumber, newClientUid, type ApiProduct,
} from "@/lib/api";

type Line = {
  product: Product;
  qty: number;
  discountPercent: number;
  note?: string;
};

function mapApiProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: p.name,
    sku: p.sku,
    barcode: p.barcodes?.[0]?.code ?? p.sku,
    category: "همه", // simplified — API sends category by id
    brand: "",
    price: toNumber(p.price),
    cost: toNumber(p.cost),
    stock: toNumber(p.stock ?? 0),
    unit: p.unit,
    emoji: p.emoji ?? "📦",
    weighted: !!p.is_weighted,
  };
}

export default function PosPage() {
  // --- fetch products from backend, fall back to mock -----------------------
  const { data: productsPage, offline, loading } = useApi(
    "products",
    () => api.listProducts({ size: 200 }),
  );

  const products: Product[] = useMemo(() => {
    if (productsPage?.items?.length) return productsPage.items.map(mapApiProduct);
    return mockProducts;
  }, [productsPage]);

  // --- fetch branches to know which branch id to POST -----------------------
  const { data: branches } = useApi("branches", () => api.listBranches(), []);
  const branchId = branches?.[0]?.id ?? 1;

  // --- state ----------------------------------------------------------------
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("همه");
  const [lines, setLines] = useState<Line[]>([]);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [customer, setCustomer] = useState<string>("مهمان");
  const [payOpen, setPayOpen] = useState(false);
  const [holdOpen, setHoldOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [nowStr, setNowStr] = useState<string>("");
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      setNowStr(`${toFa(hh)}:${toFa(mm)}`);
    };
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return products.filter((p) => {
      const inCat = category === "همه" || p.category === category;
      if (!inCat) return false;
      if (!q) return true;
      return (
        p.name.includes(q) ||
        p.sku.toLowerCase().includes(q.toLowerCase()) ||
        p.barcode.includes(q) ||
        (p.brand ?? "").includes(q)
      );
    });
  }, [query, category, products]);

  const addProduct = useCallback((p: Product) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.product.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { product: p, qty: 1, discountPercent: 0 }];
    });
  }, []);

  const totals = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    for (const l of lines) {
      const lineGross = l.qty * l.product.price;
      const lineDiscount = (lineGross * l.discountPercent) / 100;
      subtotal += lineGross;
      discount += lineDiscount;
    }
    const invDiscount = Math.round(((subtotal - discount) * invoiceDiscount) / 100);
    const afterDiscount = subtotal - discount - invDiscount;
    const tax = Math.round(afterDiscount * 0.09);
    const total = afterDiscount + tax;
    return { subtotal, discount: discount + invDiscount, tax, total, items: lines.reduce((s, l) => s + l.qty, 0) };
  }, [lines, invoiceDiscount]);

  // --- submit sale ---------------------------------------------------------
  const finalizeSale = useCallback(async (tenders: { method: string; amount: number }[]) => {
    if (offline || !branches?.length) {
      setToast({ kind: "err", text: "بک‌اند در دسترس نیست — فروش فقط در حالت آنلاین ثبت می‌شود." });
      return false;
    }
    try {
      const uid = newClientUid("pos");
      const sale = await api.createSale({
        branch_id: branchId,
        items: lines.map((l) => ({
          product_id: Number(l.product.id),
          quantity: l.qty,
          discount_percent: l.discountPercent,
        })),
        payments: tenders.map((t) => ({ method: t.method, amount: t.amount })),
        invoice_discount_percent: invoiceDiscount,
        status: "completed",
        client_uid: uid,
      });
      setToast({ kind: "ok", text: `فاکتور ${sale.invoice_no} ثبت شد.` });
      setLines([]);
      setInvoiceDiscount(0);
      // Trigger every listener in the app to refresh.
      invalidate("sales", "products", "dashboard", "reports", "inventory");
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطای ناشناخته";
      setToast({ kind: "err", text: "خطا در ثبت فروش: " + msg });
      return false;
    }
  }, [offline, branches, branchId, lines, invoiceDiscount]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F2") { e.preventDefault(); (document.getElementById("pos-search") as HTMLInputElement | null)?.focus(); }
      else if (e.key === "F4") { e.preventDefault(); if (lines.length) setPayOpen(true); }
      else if (e.key === "F6") { e.preventDefault(); setHoldOpen(true); }
      else if (e.key === "F1") { e.preventDefault(); setShortcutsOpen(true); }
      else if (e.key === "Escape") { setPayOpen(false); setHoldOpen(false); setShortcutsOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lines.length]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Top bar */}
      <header className="h-14 shrink-0 border-b border-surface-border bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="btn-ghost !px-2 !py-1.5" title="بازگشت">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white">
            <ScanBarcode className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-900">
              صندوق ۱ — {branches?.[0]?.name ?? "شعبه مرکزی"}
            </div>
            <div className="text-[11px] text-slate-500 num-fa">
              {loading ? "در حال بارگذاری کالاها..." : `${toFa(products.length)} کالای فعال`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {offline
            ? <span className="chip chip-amber">حالت نمونه (آفلاین)</span>
            : <span className="chip chip-green live-dot">متصل به سرور</span>}
          <span className="chip chip-slate flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> {branches?.length ? `${toFa(branches.length)} شعبه` : "—"}</span>
          <span className="chip chip-slate num-fa"><Clock className="w-3.5 h-3.5 ms-1" /> {nowStr}</span>
          <span className="chip chip-blue num-fa">{jalaliToday()}</span>
          <button className="btn-ghost !px-2 !py-1.5" title="میانبرها (F1)" onClick={() => setShortcutsOpen(true)}>
            <Keyboard className="w-4 h-4" />
          </button>
          <Link href="/dashboard" className="btn-ghost !px-2 !py-1.5" title="پنل مدیریت">
            <Settings2 className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main split */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Cart */}
        <aside className="col-span-5 xl:col-span-4 border-l border-surface-border bg-white flex flex-col">
          <div className="p-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-surface-muted rounded-xl px-3 py-2">
                <UserRound className="w-4 h-4 text-slate-500" />
                <div className="text-sm">
                  <div className="font-semibold text-slate-800">{customer}</div>
                  <div className="text-[11px] text-slate-500">فروش نقدی / پیش‌فرض</div>
                </div>
                <button className="ms-auto btn-ghost !px-2 !py-1 text-xs" onClick={() => setCustomer(customer === "مهمان" ? "علی رضایی" : "مهمان")}>
                  تغییر
                </button>
              </div>
              <button className="btn-secondary !px-2.5 !py-2" title="نگه‌داشتن سبد (F6)" onClick={() => setHoldOpen(true)}>
                <PauseCircle className="w-4 h-4" />
              </button>
              <button className="btn-secondary !px-2.5 !py-2" title="مرجوعی">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {lines.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2 p-6 text-center">
                <ScanBarcode className="w-10 h-10" />
                برای شروع بارکد کالا را اسکن کنید یا از پنل سمت چپ انتخاب کنید.
              </div>
            )}
            <ul>
              {lines.map((l) => {
                const lineTotal = l.qty * l.product.price * (1 - l.discountPercent / 100);
                return (
                  <li key={l.product.id} className="px-3 py-2.5 border-b border-surface-border/70 hover:bg-brand-50/30">
                    <div className="flex items-center gap-2">
                      <div className="w-11 h-11 rounded-xl bg-surface-muted grid place-items-center text-xl">
                        {l.product.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{l.product.name}</div>
                        <div className="text-[11px] text-slate-500 num-fa flex items-center gap-2">
                          <span>{l.product.sku}</span>
                          <span className="opacity-30">·</span>
                          <span>{formatToman(l.product.price, { withUnit: false })} × {toFa(l.qty)} {l.product.unit}</span>
                          {l.discountPercent > 0 && (
                            <span className="chip chip-amber !py-0 !px-1.5 !text-[10px]">
                              تخفیف {toFa(l.discountPercent)}٪
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-900 num-fa whitespace-nowrap">
                        {formatToman(lineTotal, { withUnit: false })}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="inline-flex items-center bg-surface-muted rounded-lg">
                        <button
                          className="w-7 h-7 grid place-items-center hover:bg-surface-border/50 rounded-lg"
                          onClick={() =>
                            setLines((prev) =>
                              prev.flatMap((x) =>
                                x.product.id === l.product.id
                                  ? x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []
                                  : [x],
                              ),
                            )
                          }
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold num-fa">{toFa(l.qty)}</span>
                        <button
                          className="w-7 h-7 grid place-items-center hover:bg-surface-border/50 rounded-lg"
                          onClick={() =>
                            setLines((prev) =>
                              prev.map((x) =>
                                x.product.id === l.product.id ? { ...x, qty: x.qty + 1 } : x,
                              ),
                            )
                          }
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        className="btn-ghost !px-2 !py-1 text-xs"
                        onClick={() =>
                          setLines((prev) =>
                            prev.map((x) =>
                              x.product.id === l.product.id
                                ? { ...x, discountPercent: (x.discountPercent + 5) % 55 }
                                : x,
                            ),
                          )
                        }
                      >
                        <BadgePercent className="w-3.5 h-3.5" /> تخفیف
                      </button>
                      <button className="btn-ghost !px-2 !py-1 text-xs text-rose-600" onClick={() => setLines((prev) => prev.filter((x) => x.product.id !== l.product.id))}>
                        <Trash2 className="w-3.5 h-3.5" /> حذف
                      </button>
                      <span className="ms-auto text-[11px] text-slate-500 num-fa">
                        موجودی: {toFa(l.product.stock)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t border-surface-border p-3 space-y-2">
            <Row label="جمع اقلام" value={formatToman(totals.subtotal)} />
            <Row label="تخفیف کل" value={"-" + formatToman(totals.discount)} tone="rose" />
            <Row label="مالیات ارزش افزوده (۹٪)" value={formatToman(totals.tax)} tone="muted" />
            <div className="flex items-end justify-between pt-2 border-t border-dashed border-surface-border">
              <div>
                <div className="text-xs text-slate-500">مبلغ قابل پرداخت</div>
                <div className="text-2xl font-black text-slate-900 num-fa">{formatToman(totals.total)}</div>
              </div>
              <div className="text-xs text-slate-500 num-fa">{toFa(totals.items)} قلم</div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setLines([])} disabled={!lines.length}>
                <X className="w-4 h-4" /> پاک کردن
              </button>
              <button className="btn-secondary" title="پرینت پیش‌فاکتور">
                <Printer className="w-4 h-4" /> پیش‌فاکتور
              </button>
              <button className="btn-primary" onClick={() => setPayOpen(true)} disabled={!lines.length}>
                <Banknote className="w-4 h-4" /> پرداخت
              </button>
            </div>
          </div>
        </aside>

        <section className="col-span-7 xl:col-span-8 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-surface-border bg-surface-card">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 my-auto right-3" />
                <input
                  id="pos-search"
                  autoFocus
                  className="input !pr-9"
                  placeholder="اسکن بارکد یا جست‌وجو با نام، کد کالا، برند... (F2)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key !== "Enter") return;
                    const q = query.trim();
                    if (!q) return;
                    // If we're online, try barcode-lookup first for exact matches.
                    if (!offline) {
                      try {
                        const p = await api.findByBarcode(q);
                        addProduct(mapApiProduct(p));
                        setQuery("");
                        return;
                      } catch { /* fall through to local */ }
                    }
                    if (filtered[0]) { addProduct(filtered[0]); setQuery(""); }
                  }}
                />
              </div>
              <button className="btn-secondary">
                <Boxes className="w-4 h-4" /> کالای دستی
              </button>
              <button className="btn-secondary">
                <QrCode className="w-4 h-4" /> اسکن QR
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                    c === category
                      ? "bg-brand-600 border-brand-600 text-white shadow-pop"
                      : "bg-white border-surface-border text-slate-700 hover:border-brand-300",
                  )}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
              <div className="ms-auto flex items-center gap-2 text-xs text-slate-500">
                <LayoutGrid className="w-4 h-4" /> {toFa(filtered.length)} کالا
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="text-center text-slate-500 py-10">در حال بارگذاری کالاها...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {filtered.map((p) => (
                  <button key={p.id} className="pos-grid-btn" onClick={() => addProduct(p)}>
                    <div className="flex items-start justify-between w-full">
                      <span className="text-2xl">{p.emoji}</span>
                      {p.stock <= 15 ? (
                        <span className="chip chip-red !py-0 !px-1.5 !text-[10px]">موجودی کم</span>
                      ) : (
                        <span className="chip chip-slate !py-0 !px-1.5 !text-[10px] num-fa">
                          {toFa(p.stock)} {p.unit}
                        </span>
                      )}
                    </div>
                    <div className="w-full">
                      <div className="text-[13px] font-semibold text-slate-800 line-clamp-2 leading-5">
                        {p.name}
                      </div>
                      <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-500 num-fa">
                        <span>{p.sku}</span>
                        <span className="text-brand-700 font-bold">{formatToman(p.price, { withUnit: false })}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickTile icon={Star} label="محبوب‌ها" />
              <QuickTile icon={Clock} label="اخیراً فروخته‌شده" />
              <QuickTile icon={BadgePercent} label="کالای تخفیف‌دار" />
              <QuickTile icon={ShieldAlert} label="نیازمند تأیید مدیر" />
            </div>
          </div>
        </section>
      </div>

      {payOpen && (
        <PaymentModal
          total={totals.total}
          onClose={() => setPayOpen(false)}
          onFinalize={async (tenders) => {
            const ok = await finalizeSale(tenders);
            if (ok) setPayOpen(false);
          }}
        />
      )}
      {holdOpen && <HeldCartsModal onClose={() => setHoldOpen(false)} />}
      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}

      {toast && (
        <div className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl shadow-pop px-5 py-3 flex items-center gap-3 text-sm",
          toast.kind === "ok" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white",
        )}>
          {toast.kind === "ok" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.text}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "rose" | "muted" }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={cn("num-fa font-semibold",
        tone === "rose" && "text-rose-600",
        tone === "muted" && "text-slate-600",
        !tone && "text-slate-800",
      )}>
        {value}
      </span>
    </div>
  );
}

function QuickTile({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button className="card p-3 flex items-center gap-3 hover:border-brand-300">
      <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-sm font-semibold text-slate-800">{label}</div>
    </button>
  );
}

type Tender = { method: string; amount: number; label: string; icon: React.ComponentType<{ className?: string }> };

function PaymentModal({
  total, onClose, onFinalize,
}: {
  total: number;
  onClose: () => void;
  onFinalize: (tenders: { method: string; amount: number }[]) => Promise<void> | void;
}) {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [busy, setBusy] = useState(false);
  const paid = tenders.reduce((s, t) => s + t.amount, 0);
  const remaining = Math.max(0, total - paid);
  const change = Math.max(0, paid - total);

  const methods: { method: string; label: string; icon: React.ComponentType<{ className?: string }>; hint?: string }[] = [
    { method: "cash", label: "نقدی", icon: Banknote },
    { method: "card", label: "کارت‌خوان", icon: CreditCard, hint: "PC-POS متصل" },
    { method: "wallet", label: "کیف پول", icon: Wallet },
    { method: "gift_card", label: "کارت هدیه", icon: Gift },
    { method: "qr", label: "QR / پرداخت موبایل", icon: QrCode },
    { method: "credit", label: "اعتباری مشتری", icon: UserRound },
  ];

  const add = (m: typeof methods[number], portion = 1) => {
    const amount = Math.round(remaining * portion);
    if (amount <= 0) return;
    setTenders((prev) => [...prev, { method: m.method, label: m.label, amount, icon: m.icon }]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 grid place-items-center p-4">
      <div className="card w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div>
            <div className="text-sm text-slate-500">مبلغ قابل پرداخت</div>
            <div className="text-2xl font-black text-slate-900 num-fa">{formatToman(total)}</div>
          </div>
          <button className="btn-ghost !p-2" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 p-5">
          <div>
            <div className="label">روش‌های پرداخت (پرداخت ترکیبی مجاز است)</div>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button key={m.method} className="card p-3 text-right hover:border-brand-300 flex items-center gap-3" onClick={() => add(m, 1)}>
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
                    <m.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{m.label}</div>
                    {m.hint && <div className="text-[11px] text-slate-500">{m.hint}</div>}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[0.25, 0.5, 1].map((f) => (
                <button key={f} className="btn-secondary" onClick={() => add(methods[0], f)}>
                  {toFa(Math.round(f * 100))}٪ نقدی
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label">پرداخت‌های ثبت‌شده</div>
            <div className="card p-3 min-h-[10rem]">
              {tenders.length === 0 && <div className="text-sm text-slate-400 text-center py-8">هنوز پرداختی ثبت نشده است.</div>}
              <ul className="divide-y divide-surface-border/70">
                {tenders.map((t, i) => (
                  <li key={i} className="flex items-center gap-2 py-2 text-sm">
                    <t.icon className="w-4 h-4 text-slate-500" />
                    <span className="flex-1">{t.label}</span>
                    <span className="num-fa font-semibold">{formatToman(t.amount)}</span>
                    <button className="text-rose-500 hover:text-rose-600" onClick={() => setTenders((prev) => prev.filter((_, ix) => ix !== i))}>
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 space-y-1.5">
              <Row label="پرداخت شده" value={formatToman(paid)} />
              <Row label="باقیمانده" value={formatToman(remaining)} tone={remaining > 0 ? "rose" : undefined} />
              {change > 0 && <Row label="مابه‌التفاوت (بازگشتی)" value={formatToman(change)} tone="muted" />}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-surface-border flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            پس از تأیید، فاکتور در سرور ثبت و از موجودی کسر می‌شود.
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={onClose}>انصراف</button>
            <button
              className="btn-primary"
              disabled={remaining > 0 || busy}
              onClick={async () => {
                setBusy(true);
                await onFinalize(tenders.map((t) => ({ method: t.method, amount: t.amount })));
                setBusy(false);
              }}
            >
              <Check className="w-4 h-4" /> {busy ? "در حال ثبت..." : "نهایی‌سازی فروش"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeldCartsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 grid place-items-center p-4">
      <div className="card w-full max-w-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="section-title flex items-center gap-2"><PauseCircle className="w-5 h-5 text-brand-600" /> سبدهای نگه‌داشته‌شده</div>
          <button className="btn-ghost !p-2" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            {heldCarts.map((h) => (
              <li key={h.id} className="card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center">
                  <PauseCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">{h.cashier} — {h.register}</div>
                  <div className="text-[12px] text-slate-500 num-fa">{h.time} · {toFa(h.items)} قلم · {h.customer}</div>
                </div>
                <div className="text-sm font-bold num-fa">{formatToman(h.total)}</div>
                <button className="btn-primary" onClick={onClose}>ادامه</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const items = [
    ["F1", "نمایش این راهنما"],
    ["F2", "کادر جست‌وجو / اسکن"],
    ["F4", "پرداخت"],
    ["F6", "نگه‌داشتن / بازیابی سبد"],
    ["Enter", "افزودن کالای منطبق با بارکد/کوئری"],
    ["+ / -", "افزایش/کاهش تعداد"],
    ["Esc", "بستن پنجره"],
  ];
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 grid place-items-center p-4">
      <div className="card w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="section-title flex items-center gap-2"><Keyboard className="w-5 h-5" /> میانبرهای صفحه‌کلید</div>
          <button className="btn-ghost !p-2" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <ul className="divide-y divide-surface-border">
            {items.map(([k, v]) => (
              <li key={k} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-slate-700">{v}</span>
                <kbd className="px-2 py-1 text-xs rounded-md bg-slate-100 border border-slate-300 text-slate-700 num-fa">{k}</kbd>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
