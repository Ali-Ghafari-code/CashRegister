"use client";

import { useMemo } from "react";
import { TopBar } from "@/components/admin/top-bar";
import { api, useApi, toNumber } from "@/lib/api";
import { formatToman, toFa } from "@/lib/utils";
import { Warehouse, AlertTriangle, Boxes, ArrowLeftRight, ClipboardCheck, AlertCircle } from "lucide-react";

export default function InventoryPage() {
  const { data: products, offline, loading, refetch } = useApi("products", () => api.listProducts({ size: 500 }));
  const items = products?.items ?? [];

  const stats = useMemo(() => {
    const total = items.length;
    const value = items.reduce((s, p) => s + toNumber(p.cost) * toNumber(p.stock ?? 0), 0);
    const low = items.filter((p) => toNumber(p.stock ?? 0) <= p.reorder_point).length;
    return { total, value, low };
  }, [items]);

  return (
    <>
      <TopBar title="موجودی انبار" description="لیست موجودی همه محصولات از بک‌اند." />
      <div className="p-6 space-y-4">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1 text-sm">اتصال به بک‌اند برقرار نیست.</div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <StatTile icon={Warehouse} label="ارزش موجودی (بهای تمام‌شده)" value={formatToman(stats.value)} />
          <StatTile icon={Boxes} label="تعداد اقلام" value={toFa(stats.total) + " قلم"} />
          <StatTile icon={AlertTriangle} label="اقلام کم‌موجود" value={toFa(stats.low)} tone="amber" />
          <StatTile icon={ClipboardCheck} label="فرآیندهای شمارش" value={toFa(0)} />
        </div>

        <div className="card overflow-hidden">
          <div className="section-title p-5">موجودی به تفکیک کالا</div>
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[800px]">
              <thead>
                <tr>
                  <th>کالا</th>
                  <th>SKU</th>
                  <th>واحد</th>
                  <th>موجودی</th>
                  <th>نقطه سفارش</th>
                  <th>ارزش (بهای تمام‌شده)</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} className="text-center text-slate-400 py-8">در حال بارگذاری...</td></tr>}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-slate-400 py-8">کالایی ثبت نشده.</td></tr>
                )}
                {items.map((p) => {
                  const stock = toNumber(p.stock ?? 0);
                  const low = stock <= p.reorder_point;
                  return (
                    <tr key={p.id}>
                      <td className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="text-lg">{p.emoji ?? "📦"}</span> {p.name}
                      </td>
                      <td className="num-fa">{p.sku}</td>
                      <td>{p.unit}</td>
                      <td className={"num-fa " + (low ? "text-rose-600 font-bold" : "text-slate-700")}>{toFa(stock)}</td>
                      <td className="num-fa">{toFa(p.reorder_point)}</td>
                      <td className="num-fa font-bold">{formatToman(toNumber(p.cost) * stock, { withUnit: false })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-3">
          <ArrowLeftRight className="w-4 h-4 text-brand-600" />
          <div className="flex-1 text-sm text-slate-600">
            انتقال بین شعب و اصلاح موجودی از طریق endpointهای بک‌اند در دسترس است (`/inventory/adjust`, `/inventory/transfer`).
          </div>
        </div>
      </div>
    </>
  );
}

function StatTile({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone?: "amber" }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={tone === "amber"
        ? "w-10 h-10 rounded-xl bg-amber-50 text-amber-700 grid place-items-center"
        : "w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-bold text-slate-900 num-fa">{value}</div>
      </div>
    </div>
  );
}
