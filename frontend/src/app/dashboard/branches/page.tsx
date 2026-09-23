"use client";

import { TopBar } from "@/components/admin/top-bar";
import { formatToman, toFa } from "@/lib/utils";
import { Building2, MonitorSmartphone, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { api, useApi, toNumber } from "@/lib/api";

export default function BranchesPage() {
  const { data: branches, offline, loading, refetch } = useApi("branches", () => api.listBranches());
  const { data: summary } = useApi("dashboard", () => api.dashboardSummary());
  const salesByBranch = new Map<number, { total: number; invoices: number }>();
  (summary?.branches ?? []).forEach((b) => salesByBranch.set(b.id, { total: toNumber(b.today_sales), invoices: b.invoices }));

  return (
    <>
      <TopBar title="شعب و صندوق‌ها" description="لیست شعب فعال با فروش امروز." />
      <div className="p-6 space-y-4">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1 text-sm">اتصال به بک‌اند برقرار نیست.</div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}

        {loading && <div className="card p-8 text-center text-slate-400">در حال بارگذاری شعب...</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(branches ?? []).map((b) => {
            const s = salesByBranch.get(b.id);
            return (
              <div key={b.id} className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{b.name}</div>
                    <div className="text-xs text-slate-500">{b.city ?? "—"} · مدیر: {b.manager_name ?? "—"}</div>
                  </div>
                  {b.is_active
                    ? <span className="chip-green flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> فعال</span>
                    : <span className="chip-slate flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" /> غیرفعال</span>}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <Stat label="کد شعبه" value={b.code} />
                  <Stat label="فاکتور امروز" value={toFa(s?.invoices ?? 0)} />
                  <Stat label="فروش امروز" value={formatToman(s?.total ?? 0, { withUnit: false })} small />
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <MonitorSmartphone className="w-3.5 h-3.5" /> اطلاعات از بک‌اند لحظه‌ای است.
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <div className={"font-bold text-slate-900 num-fa " + (small ? "text-sm" : "text-lg")}>{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}
