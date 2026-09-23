"use client";

import { TopBar } from "@/components/admin/top-bar";
import { api, useApi, toNumber } from "@/lib/api";
import { formatToman, toFa, jalaliDateTime } from "@/lib/utils";
import { Banknote, LogIn, LogOut, PiggyBank, AlertTriangle, AlertCircle } from "lucide-react";

export default function CashPage() {
  const { data: shifts, offline, loading, refetch } = useApi("shifts", () => api.openShifts(), []);
  const list = shifts ?? [];

  return (
    <>
      <TopBar title="مدیریت صندوق و شیفت" description="شیفت‌های باز و اختلاف مورد انتظار — از بک‌اند." />
      <div className="p-6 space-y-4">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1 text-sm">اتصال به بک‌اند برقرار نیست.</div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card title="شیفت‌های باز" value={toFa(list.length)} />
          <Card title="جمع مانده نقدی مورد انتظار" value={formatToman(list.reduce((s, x) => s + toNumber(x.expected_cash), 0), { withUnit: false })} />
          <Card title="جمع افتتاحیه صندوق‌ها" value={formatToman(list.reduce((s, x) => s + toNumber(x.opening_cash), 0), { withUnit: false })} />
          <Card title="اختلاف تجمعی" value={formatToman(list.reduce((s, x) => s + toNumber(x.difference), 0), { withUnit: false })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Action icon={LogIn} label="افتتاح شیفت" />
          <Action icon={PiggyBank} label="ثبت واریز به صندوق" />
          <Action icon={Banknote} label="برداشت / پرداخت هزینه" />
          <Action icon={LogOut} label="بستن شیفت" />
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[900px]">
              <thead>
                <tr>
                  <th>شیفت</th>
                  <th>صندوق</th>
                  <th>شعبه</th>
                  <th>افتتاحیه</th>
                  <th>مورد انتظار</th>
                  <th>شمارش‌شده</th>
                  <th>اختلاف</th>
                  <th>باز‌شده</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={8} className="text-center text-slate-400 py-8">در حال بارگذاری...</td></tr>}
                {!loading && list.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-slate-400 py-8">در حال حاضر شیفت بازی وجود ندارد.</td></tr>
                )}
                {list.map((s) => (
                  <tr key={s.id}>
                    <td className="num-fa font-semibold">{s.code}</td>
                    <td className="num-fa">#{toFa(s.register_id)}</td>
                    <td className="num-fa">#{toFa(s.branch_id)}</td>
                    <td className="num-fa">{formatToman(toNumber(s.opening_cash), { withUnit: false })}</td>
                    <td className="num-fa">{formatToman(toNumber(s.expected_cash), { withUnit: false })}</td>
                    <td className="num-fa font-bold">{formatToman(toNumber(s.counted_cash), { withUnit: false })}</td>
                    <td className={toNumber(s.difference) < 0 ? "num-fa text-rose-600 font-semibold" : "num-fa text-slate-600"}>
                      {formatToman(toNumber(s.difference), { withUnit: false })}
                      {toNumber(s.difference) < 0 && <AlertTriangle className="w-3.5 h-3.5 inline ms-1" />}
                    </td>
                    <td className="num-fa">{jalaliDateTime(new Date(s.opened_at))}</td>
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

function Action({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button className="card p-4 flex items-center gap-3 hover:border-brand-300 text-right">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-4 h-4" /></div>
      <div className="text-sm font-semibold text-slate-800">{label}</div>
    </button>
  );
}
