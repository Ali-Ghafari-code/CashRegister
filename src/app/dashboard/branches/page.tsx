import { TopBar } from "@/components/admin/top-bar";
import { branches } from "@/lib/mock-data";
import { formatToman, toFa } from "@/lib/utils";
import { Building2, MonitorSmartphone, Wifi, WifiOff } from "lucide-react";

export default function BranchesPage() {
  return (
    <>
      <TopBar title="شعب و صندوق‌ها" description="نمای شبکه شعب، وضعیت صندوق‌ها و همگام‌سازی لحظه‌ای" />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map((b) => {
            const offline = b.registers - b.onlineRegisters;
            return (
              <div key={b.id} className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{b.name}</div>
                    <div className="text-xs text-slate-500">{b.city} · مدیر: {b.manager}</div>
                  </div>
                  {offline === 0
                    ? <span className="chip-green flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> پایدار</span>
                    : <span className="chip-amber flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" /> {toFa(offline)} آفلاین</span>}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <Stat label="صندوق" value={toFa(b.registers)} />
                  <Stat label="آنلاین" value={toFa(b.onlineRegisters)} />
                  <Stat label="فروش امروز" value={formatToman(b.todaySales, { withUnit: false })} small />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(b.onlineRegisters / b.registers) * 100}%` }} />
                  </div>
                  <div className="text-xs text-slate-500 num-fa flex items-center gap-1">
                    <MonitorSmartphone className="w-3.5 h-3.5" /> سلامت
                  </div>
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
