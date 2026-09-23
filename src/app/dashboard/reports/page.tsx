import { TopBar } from "@/components/admin/top-bar";
import { BarChart } from "@/components/ui/bar-chart";
import { Sparkline } from "@/components/ui/sparkline";
import { formatToman, toFa } from "@/lib/utils";
import { FileDown, Filter, TrendingUp, TrendingDown, Package, Users } from "lucide-react";

const weekly = [
  { label: "شنبه", value: 82 },
  { label: "یکشنبه", value: 76 },
  { label: "دوشنبه", value: 88 },
  { label: "سه‌شنبه", value: 92 },
  { label: "چهارشنبه", value: 104 },
  { label: "پنج‌شنبه", value: 148 },
  { label: "جمعه", value: 132 },
];

const topProducts = [
  { name: "نان بربری کنجدی", qty: 4820, revenue: 115_680_000, growth: 12 },
  { name: "شیر پرچرب پگاه", qty: 3480, revenue: 146_160_000, growth: 8 },
  { name: "برنج هاشمی ۱۰ کیلویی", qty: 82, revenue: 135_300_000, growth: -3 },
  { name: "پفک نمکی مینو", qty: 6210, revenue: 136_620_000, growth: 22 },
  { name: "چیپس چاکلز پنیری", qty: 3980, revenue: 155_220_000, growth: 17 },
];

export default function ReportsPage() {
  return (
    <>
      <TopBar title="گزارش‌ها" description="گزارش‌های تحلیلی فروش، مشتری، انبار و سودآوری" />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <select className="input max-w-[10rem]">
            <option>هفته جاری</option>
            <option>ماه جاری</option>
            <option>۳۰ روز اخیر</option>
            <option>سال جاری</option>
          </select>
          <select className="input max-w-[10rem]">
            <option>همه شعب</option>
            <option>شعبه مرکزی</option>
            <option>شعبه ونک</option>
          </select>
          <button className="btn-secondary"><Filter className="w-4 h-4" /> فیلتر</button>
          <div className="flex-1" />
          <button className="btn-secondary"><FileDown className="w-4 h-4" /> Excel</button>
          <button className="btn-secondary"><FileDown className="w-4 h-4" /> PDF</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Kpi label="فروش هفتگی" value={formatToman(2_648_000_000, { withUnit: false })} up />
          <Kpi label="سود ناخالص" value={formatToman(742_500_000, { withUnit: false })} up />
          <Kpi label="میانگین سبد" value={formatToman(213_800, { withUnit: false })} up />
          <Kpi label="نرخ برگشتی" value="۰٫۸٪" down />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card p-5 xl:col-span-2">
            <div className="section-title mb-3">فروش هفتگی (میلیون تومان)</div>
            <BarChart data={weekly} />
          </div>
          <div className="card p-5">
            <div className="section-title mb-3">روند تراکنش‌ها</div>
            <div className="h-40">
              <Sparkline data={[42,55,48,62,58,71,66,78,72,88,84,92,98,110,104]} color="#10b981" />
            </div>
            <div className="mt-3 text-xs text-slate-500 leading-6">
              نرخ رشد میانگین روزانه <b className="text-slate-800 num-fa">+۹٫۲٪</b> نسبت به هفته قبل — رشد پایدار.
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div className="section-title flex items-center gap-2"><Package className="w-4 h-4" /> پرفروش‌ترین کالاها</div>
            <span className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> تحلیل خرید مشترک در دسترس است</span>
          </div>
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[720px]">
              <thead>
                <tr>
                  <th>کالا</th>
                  <th>تعداد فروش</th>
                  <th>درآمد</th>
                  <th>رشد ماهانه</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.name}>
                    <td className="font-semibold text-slate-800">{p.name}</td>
                    <td className="num-fa">{toFa(p.qty)}</td>
                    <td className="font-bold num-fa">{formatToman(p.revenue, { withUnit: false })}</td>
                    <td>
                      {p.growth >= 0
                        ? <span className="chip-green flex w-fit items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {toFa(p.growth)}٪</span>
                        : <span className="chip-red flex w-fit items-center gap-1"><TrendingDown className="w-3.5 h-3.5" /> {toFa(Math.abs(p.growth))}٪</span>}
                    </td>
                    <td className="!text-left"><button className="btn-ghost text-xs">جزئیات</button></td>
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

function Kpi({ label, value, up, down }: { label: string; value: string; up?: boolean; down?: boolean }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="font-bold text-slate-900 num-fa">{value}</div>
        {up && <span className="chip-green flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> رشد</span>}
        {down && <span className="chip-red flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5" /> افت</span>}
      </div>
    </div>
  );
}
