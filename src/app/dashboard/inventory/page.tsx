import { TopBar } from "@/components/admin/top-bar";
import { products, branches } from "@/lib/mock-data";
import { formatToman, toFa } from "@/lib/utils";
import { Warehouse, AlertTriangle, Boxes, ArrowLeftRight, ClipboardCheck } from "lucide-react";

export default function InventoryPage() {
  const totalValue = products.reduce((s, p) => s + p.cost * p.stock, 0);
  const lowCount = products.filter((p) => p.stock <= 15).length;

  return (
    <>
      <TopBar title="موجودی انبار" description="نمای لحظه‌ای موجودی در همه انبارها و شعب" />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <StatTile icon={Warehouse} label="ارزش کل موجودی (بهای تمام‌شده)" value={formatToman(totalValue)} />
          <StatTile icon={Boxes} label="تعداد اقلام" value={toFa(products.length) + " قلم"} />
          <StatTile icon={AlertTriangle} label="اقلام کم‌موجود" value={toFa(lowCount)} tone="amber" />
          <StatTile icon={ClipboardCheck} label="در حال شمارش" value={toFa(2) + " فرآیند"} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card p-5 xl:col-span-2 overflow-hidden">
            <div className="section-title mb-3">تفکیک موجودی به شعب</div>
            <div className="overflow-auto">
              <table className="table-clean w-full min-w-[700px]">
                <thead>
                  <tr>
                    <th>کالا</th>
                    {branches.map((b) => <th key={b.id} className="!text-center">{b.name.replace("شعبه ", "")}</th>)}
                    <th className="!text-left">جمع</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 10).map((p) => {
                    let sum = 0;
                    const perBranch = branches.map((b, i) => {
                      const val = Math.max(0, Math.round(p.stock * (0.15 + ((i * 7) % 30) / 100)));
                      sum += val;
                      return { id: b.id, val };
                    });
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{p.emoji}</span>
                            <span className="font-semibold text-slate-800">{p.name}</span>
                          </div>
                        </td>
                        {perBranch.map((b) => (
                          <td key={b.id} className="!text-center num-fa">
                            {b.val < 5 ? <span className="chip-red">{toFa(b.val)}</span> : toFa(b.val)}
                          </td>
                        ))}
                        <td className="!text-left font-bold num-fa">{toFa(sum)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-5">
            <div className="section-title mb-3">وضعیت انواع موجودی</div>
            <ul className="space-y-2 text-sm">
              <LegendRow color="#10b981" label="موجودی قابل فروش" value="۸۴٪" />
              <LegendRow color="#3390ff" label="رزرو مشتری/سفارش" value="۶٪" />
              <LegendRow color="#f59e0b" label="در انتقال" value="۵٪" />
              <LegendRow color="#a855f7" label="امانی" value="۳٪" />
              <LegendRow color="#ef4444" label="آسیب‌دیده / برگشتی" value="۲٪" />
            </ul>

            <div className="mt-6 space-y-2">
              <button className="btn-secondary w-full"><ArrowLeftRight className="w-4 h-4" /> ایجاد انتقال بین شعب</button>
              <button className="btn-secondary w-full"><ClipboardCheck className="w-4 h-4" /> شروع شمارش انبار</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatTile({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone?: "amber" }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={
        tone === "amber"
          ? "w-10 h-10 rounded-xl bg-amber-50 text-amber-700 grid place-items-center"
          : "w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"
      }>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-bold text-slate-900 num-fa">{value}</div>
      </div>
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
      <span className="flex-1 text-slate-700">{label}</span>
      <span className="font-bold text-slate-800 num-fa">{value}</span>
    </li>
  );
}
