"use client";

import { TopBar } from "@/components/admin/top-bar";
import { api, useApi, toNumber } from "@/lib/api";
import { formatToman, toFa } from "@/lib/utils";
import { Truck, Phone, MapPin, Plus, AlertCircle } from "lucide-react";

export default function SuppliersPage() {
  const { data, offline, loading, refetch } = useApi("suppliers", () => api.listSuppliers());
  const items = data?.items ?? [];

  return (
    <>
      <TopBar title="تأمین‌کنندگان" description="لیست تأمین‌کنندگان از بک‌اند" />
      <div className="p-6 space-y-4">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1 text-sm">اتصال به بک‌اند برقرار نیست.</div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1" />
          <button className="btn-primary" disabled><Plus className="w-4 h-4" /> تأمین‌کننده جدید</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card title="تعداد تأمین‌کنندگان" value={toFa(items.length)} />
          <Card title="بدهی جاری" value={formatToman(items.reduce((s, x) => s + toNumber(x.balance), 0), { withUnit: false })} />
          <Card title="میانگین لید تایم" value={items.length ? toFa(Math.round(items.reduce((s, x) => s + x.lead_time_days, 0) / items.length)) + " روز" : "—"} />
          <Card title="فعال" value={toFa(items.filter((s) => s.is_active).length)} />
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[800px]">
              <thead>
                <tr>
                  <th>تأمین‌کننده</th>
                  <th>تلفن</th>
                  <th>شهر</th>
                  <th>لید تایم</th>
                  <th>مانده حساب</th>
                  <th>امتیاز</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} className="text-center text-slate-400 py-8">در حال بارگذاری...</td></tr>}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-slate-400 py-8">تأمین‌کننده‌ای ثبت نشده.</td></tr>
                )}
                {items.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold flex items-center gap-2 text-slate-800"><Truck className="w-4 h-4 text-slate-400" /> {s.name}</td>
                    <td className="num-fa flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {s.phone ?? "—"}</td>
                    <td className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {s.city ?? "—"}</td>
                    <td className="num-fa">{toFa(s.lead_time_days)} روز</td>
                    <td className="num-fa font-bold">{formatToman(toNumber(s.balance), { withUnit: false })}</td>
                    <td className="num-fa"><span className="chip-amber">★ {toFa(toNumber(s.rating))}</span></td>
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
      <div className="font-bold text-slate-900 mt-1 num-fa">{value}</div>
    </div>
  );
}
