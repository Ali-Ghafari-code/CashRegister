"use client";

import { TopBar } from "@/components/admin/top-bar";
import { api, useApi, toNumber } from "@/lib/api";
import { formatToman, toFa } from "@/lib/utils";
import { BadgePercent, Plus, AlertCircle } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  percent: "درصدی", fixed: "مبلغ ثابت", bxgy: "X بخر Y هدیه",
  bundle: "باندل", tiered: "پلکانی",
};

export default function PromotionsPage() {
  const { data: promos, offline, loading, refetch } = useApi("promotions", () => api.listPromotions(), []);
  const items = promos ?? [];

  return (
    <>
      <TopBar title="پروموشن و تخفیف" description="لیست کمپین‌های تعریف‌شده در بک‌اند." />
      <div className="p-6 space-y-4">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1 text-sm">اتصال به بک‌اند برقرار نیست.</div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card title="کمپین‌های فعال" value={toFa(items.filter((p) => p.is_active).length)} />
          <Card title="کل کمپین‌ها" value={toFa(items.length)} />
          <Card title="ارزش تخفیف پایه" value={formatToman(items.reduce((s, p) => s + toNumber(p.value), 0), { withUnit: false })} />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1" />
          <button className="btn-primary" disabled><Plus className="w-4 h-4" /> کمپین جدید</button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[800px]">
              <thead>
                <tr>
                  <th>نام کمپین</th>
                  <th>نوع</th>
                  <th>مقدار</th>
                  <th>دامنه</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} className="text-center text-slate-400 py-8">در حال بارگذاری...</td></tr>}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-slate-400 py-8">کمپینی تعریف نشده.</td></tr>
                )}
                {items.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold text-slate-800 flex items-center gap-2"><BadgePercent className="w-4 h-4 text-brand-600" /> {p.name}</td>
                    <td><span className="chip-blue">{TYPE_LABEL[p.type] ?? p.type}</span></td>
                    <td className="num-fa">{toFa(toNumber(p.value))}</td>
                    <td>{p.scope}</td>
                    <td>{p.is_active ? <span className="chip-green">فعال</span> : <span className="chip-slate">غیرفعال</span>}</td>
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

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-1 font-bold text-slate-900 num-fa">{value}</div>
    </div>
  );
}
