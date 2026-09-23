"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/admin/top-bar";
import { formatToman, toFa, jalaliDateTime } from "@/lib/utils";
import { FileDown, Search, RotateCcw, Printer, AlertCircle, Eye, X } from "lucide-react";
import { api, useApi, invalidate, toNumber, type ApiSale } from "@/lib/api";

const STATUS_LABEL: Record<ApiSale["status"], string> = {
  completed: "تسویه", held: "معلق", voided: "باطل", returned: "برگشتی",
};
const PAY_LABEL: Record<string, string> = {
  cash: "نقدی", card: "کارت", wallet: "کیف پول", gift_card: "کارت هدیه",
  qr: "QR", credit: "اعتباری", bank_transfer: "حواله", check: "چک",
};

export default function SalesPage() {
  const [selected, setSelected] = useState<ApiSale | null>(null);
  const [q, setQ] = useState("");
  const { data: branches } = useApi("branches", () => api.listBranches(), []);
  const { data, offline, loading, refetch } = useApi("sales", () => api.listSales({ size: 100 }));

  const sales: ApiSale[] = data?.items ?? [];
  const filtered = useMemo(() => {
    if (!q.trim()) return sales;
    const like = q.trim();
    return sales.filter((s) => s.invoice_no.includes(like) || String(s.grand_total).includes(like));
  }, [sales, q]);

  const totals = useMemo(() => {
    const grand = sales.filter((s) => s.status === "completed").reduce((sum, s) => sum + toNumber(s.grand_total), 0);
    const count = sales.filter((s) => s.status === "completed").length;
    const returned = sales.filter((s) => s.status === "returned" || s.status === "voided").length;
    return { grand, count, returned };
  }, [sales]);

  async function voidSale(id: number) {
    if (!confirm("این فاکتور باطل شود؟ موجودی به انبار بازگردانده می‌شود.")) return;
    try {
      await api.voidSale(id);
      invalidate("sales", "dashboard", "products", "inventory", "reports");
    } catch (e) {
      alert("خطا در ابطال: " + (e as Error).message);
    }
  }

  return (
    <>
      <TopBar title="فروش‌ها" description="لیست کامل فروش‌های ثبت‌شده در POS؛ به‌روزرسانی خودکار پس از هر فاکتور جدید." />
      <div className="p-6 space-y-4">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1 text-sm">بک‌اند در دسترس نیست. لطفاً backend را اجرا کنید تا فروش‌های واقعی نمایش داده شود.</div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Stat title="فروش کل (تسویه‌شده)" value={formatToman(totals.grand, { withUnit: false })} />
          <Stat title="تعداد فاکتور موفق" value={toFa(totals.count)} />
          <Stat title="فاکتورهای برگشتی/باطل" value={toFa(totals.returned)} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute right-3 inset-y-0 my-auto w-4 h-4 text-slate-400" />
            <input className="input !pr-9" placeholder="جست‌وجو در شماره فاکتور یا مبلغ..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex-1" />
          <button className="btn-secondary" onClick={() => refetch()}>بارگذاری مجدد</button>
          <button className="btn-secondary" disabled><FileDown className="w-4 h-4" /> خروجی</button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[900px]">
              <thead>
                <tr>
                  <th>فاکتور</th>
                  <th>تاریخ/ساعت</th>
                  <th>شعبه</th>
                  <th>مشتری</th>
                  <th>اقلام</th>
                  <th>روش پرداخت</th>
                  <th>وضعیت</th>
                  <th>مبلغ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={9} className="text-center text-slate-400 py-8">در حال بارگذاری...</td></tr>)}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-slate-400 py-8">
                    هنوز فروشی ثبت نشده — از صفحه <a className="text-brand-700 hover:underline" href="/pos">POS</a> اولین فاکتور را ثبت کنید.
                  </td></tr>
                )}
                {filtered.map((s) => {
                  const methods = Array.from(new Set(s.payments.map((p) => PAY_LABEL[p.method] ?? p.method))).join(" + ");
                  return (
                    <tr key={s.id}>
                      <td className="num-fa font-semibold">{s.invoice_no}</td>
                      <td className="num-fa">{jalaliDateTime(new Date(s.created_at))}</td>
                      <td>{branches?.find((b) => b.id === s.branch_id)?.name ?? "—"}</td>
                      <td>{s.customer_id ? `#${toFa(s.customer_id)}` : "مهمان"}</td>
                      <td className="num-fa">{toFa(s.items.length)}</td>
                      <td><span className="chip-blue">{methods || "—"}</span></td>
                      <td>
                        <span className={
                          s.status === "completed" ? "chip-green" :
                          s.status === "held" ? "chip-amber" : "chip-red"
                        }>{STATUS_LABEL[s.status]}</span>
                      </td>
                      <td className="font-bold num-fa">{formatToman(toNumber(s.grand_total), { withUnit: false })}</td>
                      <td className="!text-left">
                        <div className="flex items-center gap-1 justify-end">
                          <button className="btn-ghost !p-1.5" title="جزئیات" onClick={() => setSelected(s)}><Eye className="w-4 h-4" /></button>
                          <button className="btn-ghost !p-1.5" title="چاپ مجدد" disabled><Printer className="w-4 h-4" /></button>
                          <button className="btn-ghost !p-1.5 text-rose-600" title="ابطال" disabled={s.status !== "completed"} onClick={() => voidSale(s.id)}><RotateCcw className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && <SaleDetailsModal sale={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-1 font-bold text-slate-900 num-fa text-lg">{value}</div>
    </div>
  );
}

function SaleDetailsModal({ sale, onClose }: { sale: ApiSale; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 grid place-items-center p-4">
      <div className="card w-full max-w-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div>
            <div className="section-title num-fa">{sale.invoice_no}</div>
            <div className="text-xs text-slate-500 num-fa">{jalaliDateTime(new Date(sale.created_at))}</div>
          </div>
          <button className="btn-ghost !p-2" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="card p-3">
            <div className="section-title text-sm">اقلام</div>
            <ul className="divide-y divide-surface-border/70 mt-2">
              {sale.items.map((it) => (
                <li key={it.id} className="py-2 flex items-center gap-3 text-sm">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">{it.product_name}</div>
                    <div className="text-[11px] text-slate-500 num-fa">
                      {it.sku} · {toFa(toNumber(it.quantity))} × {formatToman(toNumber(it.unit_price), { withUnit: false })}
                      {toNumber(it.discount_percent) > 0 && <> — تخفیف {toFa(toNumber(it.discount_percent))}٪</>}
                    </div>
                  </div>
                  <div className="num-fa font-bold">{formatToman(toNumber(it.line_total))}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Row label="جمع اقلام" value={formatToman(toNumber(sale.subtotal))} />
            <Row label="تخفیف" value={"-" + formatToman(toNumber(sale.discount_total))} />
            <Row label="مالیات" value={formatToman(toNumber(sale.tax_total))} />
            <Row label="مبلغ نهایی" value={formatToman(toNumber(sale.grand_total))} bold />
            <Row label="پرداخت شده" value={formatToman(toNumber(sale.paid_total))} />
            <Row label="بازگشتی" value={formatToman(toNumber(sale.change_due))} />
          </div>
          <div className="card p-3">
            <div className="section-title text-sm">پرداخت‌ها</div>
            <ul className="divide-y divide-surface-border/70 mt-2">
              {sale.payments.map((p) => (
                <li key={p.id} className="py-2 flex items-center gap-3 text-sm">
                  <span className="flex-1">{PAY_LABEL[p.method] ?? p.method}</span>
                  {p.reference && <span className="text-[11px] text-slate-500 num-fa">{p.reference}</span>}
                  <span className="num-fa font-semibold">{formatToman(toNumber(p.amount))}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={"num-fa " + (bold ? "font-black text-slate-900" : "font-semibold text-slate-800")}>{value}</span>
    </div>
  );
}
