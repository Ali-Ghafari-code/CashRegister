"use client";

import { TopBar } from "@/components/admin/top-bar";
import { api, useApi, toNumber } from "@/lib/api";
import { formatToman, toFa } from "@/lib/utils";
import { FileText, PackageCheck, Plus, AlertCircle } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  draft: "پیش‌نویس", approved: "تأیید شده", partial: "دریافت جزئی",
  received: "تحویل کامل", cancelled: "لغو شده",
};

export default function PurchasesPage() {
  const { data: orders, offline, loading, refetch } = useApi("purchases", () => api.listPurchases(), []);
  const items = orders ?? [];

  return (
    <>
      <TopBar title="خرید و فاکتور تأمین" description="سفارش‌های خرید ثبت‌شده در بک‌اند." />
      <div className="p-6 space-y-4">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1 text-sm">اتصال به بک‌اند برقرار نیست.</div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card title="سفارش خرید" value={toFa(items.length)} />
          <Card title="ارزش در گردش" value={formatToman(items.reduce((s, o) => s + toNumber(o.total), 0), { withUnit: false })} />
          <Card title="در انتظار" value={toFa(items.filter((o) => o.status === "approved").length)} />
          <Card title="تحویل کامل" value={toFa(items.filter((o) => o.status === "received").length)} />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1" />
          <button className="btn-secondary" disabled><PackageCheck className="w-4 h-4" /> ثبت رسید</button>
          <button className="btn-primary" disabled><Plus className="w-4 h-4" /> سفارش خرید جدید</button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[700px]">
              <thead>
                <tr>
                  <th>شماره</th>
                  <th>تأمین‌کننده</th>
                  <th>اقلام</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} className="text-center text-slate-400 py-8">در حال بارگذاری...</td></tr>}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-slate-400 py-8">هنوز سفارش خریدی ثبت نشده.</td></tr>
                )}
                {items.map((o) => (
                  <tr key={o.id}>
                    <td className="num-fa font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> {o.number}</td>
                    <td className="num-fa">#{toFa(o.supplier_id)}</td>
                    <td className="num-fa">{toFa(o.items.length)}</td>
                    <td className="num-fa font-bold">{formatToman(toNumber(o.total), { withUnit: false })}</td>
                    <td>
                      <span className={
                        o.status === "received" ? "chip-green" :
                        o.status === "partial" ? "chip-amber" : "chip-blue"
                      }>{STATUS_LABEL[o.status] ?? o.status}</span>
                    </td>
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
