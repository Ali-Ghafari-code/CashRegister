"use client";

import { TopBar } from "@/components/admin/top-bar";
import { BarChart } from "@/components/ui/bar-chart";
import { Sparkline } from "@/components/ui/sparkline";
import { api, useApi, toNumber } from "@/lib/api";
import { formatToman, toFa } from "@/lib/utils";
import { FileDown, TrendingUp, Package, AlertCircle } from "lucide-react";

export default function ReportsPage() {
  const { data: summary, offline, refetch } = useApi("dashboard", () => api.dashboardSummary());
  const { data: hourly } = useApi("reports", () => api.hourlyReport(), []);
  const { data: top } = useApi("reports", () => api.topProducts(10), []);

  const trend = (summary?.sales_trend ?? []).map((p) => toNumber(p.total) / 1_000_000);
  const hourlyData = (hourly ?? []).map((h) => ({ label: toFa(String(h.hour)), value: Number(h.invoices) }));
  const totalToday = toNumber(summary?.kpi.today_sales ?? 0);
  const invoices = summary?.kpi.today_invoices ?? 0;

  return (
    <>
      <TopBar title="گزارش‌ها" description="گزارش‌های آماده — لحظه‌ای از بک‌اند." />
      <div className="p-6 space-y-4">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1 text-sm">اتصال به بک‌اند برقرار نیست.</div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1" />
          <button className="btn-secondary" disabled><FileDown className="w-4 h-4" /> Excel</button>
          <button className="btn-secondary" disabled><FileDown className="w-4 h-4" /> PDF</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Kpi label="فروش امروز" value={formatToman(totalToday, { withUnit: false })} />
          <Kpi label="تعداد فاکتور" value={toFa(invoices)} />
          <Kpi label="میانگین سبد" value={invoices > 0 ? formatToman(totalToday / invoices, { withUnit: false }) : "—"} />
          <Kpi label="اقلام کم‌موجود" value={toFa(summary?.low_stock?.length ?? 0)} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card p-5 xl:col-span-2">
            <div className="section-title mb-3">فروش ساعتی امروز (تعداد فاکتور)</div>
            {hourlyData.length > 0 ? <BarChart data={hourlyData} /> : <div className="text-sm text-slate-400 text-center py-10">هنوز تراکنشی نیست.</div>}
          </div>
          <div className="card p-5">
            <div className="section-title mb-3">روند ۱۴ روز اخیر (میلیون تومان)</div>
            <div className="h-40">
              {trend.length > 0 ? <Sparkline data={trend} color="#10b981" /> : <div className="h-full grid place-items-center text-slate-400 text-sm">هنوز داده‌ای نیست.</div>}
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-5 flex items-center gap-2">
            <Package className="w-4 h-4" /> <span className="section-title">پرفروش‌ترین کالاها</span>
          </div>
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[600px]">
              <thead><tr><th>کالا</th><th>تعداد فروش</th><th>درآمد</th></tr></thead>
              <tbody>
                {(top ?? []).length === 0 && (
                  <tr><td colSpan={3} className="text-center text-slate-400 py-8">هنوز فروشی برای رتبه‌بندی نیست.</td></tr>
                )}
                {(top ?? []).map((p) => (
                  <tr key={p.product_id}>
                    <td className="font-semibold text-slate-800">{p.name}</td>
                    <td className="num-fa">{toFa(toNumber(p.qty))}</td>
                    <td className="font-bold num-fa">{formatToman(toNumber(p.revenue), { withUnit: false })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="font-bold text-slate-900 num-fa">{value}</div>
        <span className="chip-green flex items-center gap-1 text-[10px]"><TrendingUp className="w-3 h-3" /> زنده</span>
      </div>
    </div>
  );
}
