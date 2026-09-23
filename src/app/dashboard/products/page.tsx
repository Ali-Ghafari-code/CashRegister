"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/admin/top-bar";
import { formatToman, toFa } from "@/lib/utils";
import { Plus, FileUp, FileDown, Filter, Search, Layers, X, AlertCircle, Wand2 } from "lucide-react";
import { api, useApi, invalidate, toNumber, type ApiProduct } from "@/lib/api";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [showNew, setShowNew] = useState(false);
  const { data, offline, loading, refetch } = useApi("products", () => api.listProducts({ q: q || undefined, size: 200 }));

  const items = data?.items ?? [];
  const totalActive = items.filter((p) => p.is_active).length;
  const lowStock = items.filter((p) => toNumber(p.stock ?? 0) <= p.reorder_point).length;

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const like = q.trim().toLowerCase();
    return items.filter((p) =>
      p.name.includes(q) || p.sku.toLowerCase().includes(like) || (p.barcodes ?? []).some((b) => b.code.includes(q)),
    );
  }, [items, q]);

  return (
    <>
      <TopBar title="کالاها و کاتالوگ" description="کالاهای ثبت‌شده مستقیماً در POS برای فروش قابل انتخاب هستند." />
      <div className="p-6 space-y-4">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1 text-sm">اتصال به بک‌اند برقرار نیست. لطفاً backend را اجرا کنید تا لیست واقعی کالاها نمایش داده شود.</div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute right-3 inset-y-0 my-auto w-4 h-4 text-slate-400" />
            <input
              className="input !pr-9"
              placeholder="جست‌وجو با نام، بارکد، SKU..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") refetch(); }}
            />
          </div>
          <button className="btn-secondary" onClick={() => refetch()}><Filter className="w-4 h-4" /> اعمال</button>
          <div className="flex-1" />
          <button className="btn-secondary" disabled><FileUp className="w-4 h-4" /> ورود اکسل</button>
          <button className="btn-secondary" disabled><FileDown className="w-4 h-4" /> خروجی</button>
          <button className="btn-primary" onClick={() => setShowNew(true)}><Plus className="w-4 h-4" /> کالای جدید</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <StatTile label="کل کالاها" value={toFa(items.length)} icon={Layers} />
          <StatTile label="کالاهای فعال" value={toFa(totalActive)} icon={Layers} />
          <StatTile label="کالای کم‌موجود" value={toFa(lowStock)} icon={Layers} />
          <StatTile label="مجموع بارکدها" value={toFa(items.reduce((s, p) => s + (p.barcodes?.length ?? 0), 0))} icon={Layers} />
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[900px]">
              <thead>
                <tr>
                  <th>کالا</th>
                  <th>SKU</th>
                  <th>بارکد</th>
                  <th>واحد</th>
                  <th>موجودی</th>
                  <th>قیمت فروش</th>
                  <th>حاشیه سود</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} className="text-center text-slate-400 py-8">در حال بارگذاری کالاها...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-slate-400 py-8">
                    کالایی یافت نشد — با دکمه بالا اولین کالا را اضافه کنید.
                  </td></tr>
                )}
                {filtered.map((p) => {
                  const price = toNumber(p.price); const cost = toNumber(p.cost);
                  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-muted grid place-items-center text-lg">{p.emoji ?? "📦"}</div>
                          <div>
                            <div className="font-semibold text-slate-800">{p.name}</div>
                            <div className="text-[11px] text-slate-500">{p.is_weighted ? "کالای وزنی" : "کالای عددی"} · {p.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="num-fa">{p.sku}</td>
                      <td className="num-fa">{p.barcodes?.[0]?.code ?? "—"}</td>
                      <td>{p.unit}</td>
                      <td className="num-fa">
                        {toNumber(p.stock ?? 0) <= p.reorder_point
                          ? <span className="chip-red">{toFa(toNumber(p.stock ?? 0))}</span>
                          : <span className="text-slate-700">{toFa(toNumber(p.stock ?? 0))}</span>}
                      </td>
                      <td className="font-bold num-fa">{formatToman(price, { withUnit: false })}</td>
                      <td>
                        <div className="w-28">
                          <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                            <div
                              className={margin > 25 ? "h-full bg-emerald-500" : margin > 15 ? "h-full bg-amber-500" : "h-full bg-rose-500"}
                              style={{ width: `${Math.min(100, Math.max(6, margin * 2))}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 num-fa">{toFa(margin.toFixed(1))}٪</div>
                        </div>
                      </td>
                      <td className="!text-left">
                        <button className="btn-ghost text-xs" disabled>ویرایش</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showNew && <NewProductModal onClose={() => setShowNew(false)} />}
    </>
  );
}

function StatTile({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-bold text-slate-900 num-fa">{value}</div>
      </div>
    </div>
  );
}

function NewProductModal({ onClose }: { onClose: () => void }) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [emoji, setEmoji] = useState("📦");
  const [isWeighted, setIsWeighted] = useState(false);
  const [reorderPoint, setReorderPoint] = useState("10");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function suggestSku() {
    setSku(`SKU-${Math.floor(Math.random() * 90000 + 10000)}`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!sku || !name || !price) {
      setErr("نام، SKU و قیمت فروش الزامی هستند.");
      return;
    }
    setBusy(true);
    try {
      await api.createProduct({
        sku, name, unit, emoji, is_weighted: isWeighted,
        price: price as unknown as number,
        cost: (cost || "0") as unknown as number,
        reorder_point: Number(reorderPoint || 0),
        tax_percent: 9,
        barcodes: barcode ? [barcode] : [],
      });
      // Refresh both back-office and POS listings.
      invalidate("products", "dashboard", "inventory");
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 grid place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="section-title flex items-center gap-2"><Plus className="w-5 h-5 text-brand-600" /> کالای جدید</div>
          <button type="button" className="btn-ghost !p-2" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">نام کالا</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: شیر پرچرب پگاه ۱ لیتری" autoFocus />
          </div>
          <div>
            <label className="label">SKU</label>
            <div className="flex gap-2">
              <input className="input flex-1 num-fa" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU-1001" />
              <button type="button" className="btn-secondary" onClick={suggestSku}><Wand2 className="w-4 h-4" /></button>
            </div>
          </div>
          <div>
            <label className="label">بارکد (اختیاری)</label>
            <input className="input num-fa" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="6260..." />
          </div>
          <div>
            <label className="label">قیمت فروش (تومان)</label>
            <input inputMode="numeric" className="input num-fa" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} />
          </div>
          <div>
            <label className="label">قیمت خرید (تومان)</label>
            <input inputMode="numeric" className="input num-fa" value={cost} onChange={(e) => setCost(e.target.value.replace(/[^\d]/g, ""))} />
          </div>
          <div>
            <label className="label">واحد</label>
            <select className="input" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option>عدد</option>
              <option>کیلوگرم</option>
              <option>گرم</option>
              <option>لیتر</option>
              <option>بسته</option>
              <option>کیسه</option>
              <option>جعبه</option>
            </select>
          </div>
          <div>
            <label className="label">آیکون</label>
            <input className="input text-center text-xl" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} />
          </div>
          <div>
            <label className="label">نقطه سفارش</label>
            <input inputMode="numeric" className="input num-fa" value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value.replace(/[^\d]/g, ""))} />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="isw" type="checkbox" checked={isWeighted} onChange={(e) => setIsWeighted(e.target.checked)} />
            <label htmlFor="isw" className="text-sm text-slate-700">کالای وزنی است</label>
          </div>
          {err && (
            <div className="col-span-2 flex items-center gap-2 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3">
              <AlertCircle className="w-4 h-4" /> {err}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-surface-border flex items-center justify-between">
          <div className="text-xs text-slate-500">پس از ذخیره، کالا فوراً در صفحه POS برای فروش قابل انتخاب می‌شود.</div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>انصراف</button>
            <button className="btn-primary" disabled={busy}>{busy ? "در حال ذخیره..." : "ذخیره کالا"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
