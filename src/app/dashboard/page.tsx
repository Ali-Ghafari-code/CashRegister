import { TopBar } from "@/components/admin/top-bar";
import { KpiCard } from "@/components/ui/kpi-card";
import { Sparkline } from "@/components/ui/sparkline";
import { BarChart } from "@/components/ui/bar-chart";
import { DonutChart } from "@/components/ui/donut-chart";
import {
  ShoppingCart,
  Users,
  BadgeDollarSign,
  Receipt,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ScanBarcode,
  Building2,
  RefreshCcw,
} from "lucide-react";
import {
  branches,
  recentSales,
  salesTrend14d,
  paymentMix,
  lowStock,
} from "@/lib/mock-data";
import { formatToman, toFa } from "@/lib/utils";

const hourly = [
  { label: "۹", value: 12 },
  { label: "۱۰", value: 24 },
  { label: "۱۱", value: 38 },
  { label: "۱۲", value: 42 },
  { label: "۱۳", value: 55 },
  { label: "۱۴", value: 47 },
  { label: "۱۵", value: 63 },
  { label: "۱۶", value: 72 },
  { label: "۱۷", value: 88 },
  { label: "۱۸", value: 96 },
  { label: "۱۹", value: 84 },
  { label: "۲۰", value: 62 },
];

export default function DashboardPage() {
  return (
    <>
      <TopBar title="داشبورد اجرایی" description="نمای لحظه‌ای عملیات فروش، صندوق و انبار" />
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard title="فروش امروز" value={formatToman(608_300_000)} hint="۵ شعبه فعال" delta="+۱۲٫۴٪" deltaTone="up" icon={BadgeDollarSign} accent="brand" />
          <KpiCard title="تعداد فاکتور" value={toFa(2_847)} hint="میانگین سبد: ۲۱۳٬۸۰۰ تومان" delta="+۸٫۱٪" deltaTone="up" icon={Receipt} accent="emerald" />
          <KpiCard title="مشتری فعال" value={toFa(1_294)} hint="۱۸۲ مشتری جدید" delta="+۴٫۷٪" deltaTone="up" icon={Users} accent="violet" />
          <KpiCard title="مرجوعی امروز" value={formatToman(4_820_000)} hint="۱۴ فاکتور مرجوعی" delta="-۲٫۳٪" deltaTone="down" icon={RefreshCcw} accent="rose" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-title">روند فروش ۱۴ روز اخیر</div>
                <div className="subtle">میلیون تومان</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip chip-green flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> +۱۸٪ رشد هفتگی</span>
              </div>
            </div>
            <div className="h-56 mt-4">
              <Sparkline data={salesTrend14d} height={220} />
            </div>
          </div>

          <div className="card p-5">
            <div className="section-title">ترکیب روش‌های پرداخت</div>
            <div className="subtle mb-4">امروز</div>
            <DonutChart data={paymentMix} />
          </div>
        </div>

        {/* Hourly + branches */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-title">فروش ساعتی امروز</div>
                <div className="subtle">تعداد تراکنش</div>
              </div>
              <span className="chip chip-blue live-dot">به‌روزرسانی زنده</span>
            </div>
            <div className="mt-4">
              <BarChart data={hourly} />
            </div>
          </div>

          <div className="card p-5">
            <div className="section-title">وضعیت شعب</div>
            <div className="subtle mb-4">همه شعب هم‌اکنون آنلاین هستند.</div>
            <ul className="space-y-3">
              {branches.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{b.name}</div>
                    <div className="text-[11px] text-slate-500 num-fa">
                      {toFa(b.onlineRegisters)}/{toFa(b.registers)} صندوق آنلاین · مدیر: {b.manager}
                    </div>
                  </div>
                  <div className="text-sm font-bold num-fa">{formatToman(b.todaySales, { withUnit: false })}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent sales + low stock */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="section-title">فروش‌های اخیر</div>
                <div className="subtle">۱۰ تراکنش آخر</div>
              </div>
              <button className="btn-secondary text-xs">مشاهده همه</button>
            </div>
            <div className="overflow-auto -mx-5">
              <table className="table-clean w-full min-w-[720px]">
                <thead>
                  <tr>
                    <th>شماره فاکتور</th>
                    <th>ساعت</th>
                    <th>شعبه</th>
                    <th>صندوقدار</th>
                    <th>مشتری</th>
                    <th>پرداخت</th>
                    <th>وضعیت</th>
                    <th className="!text-left">جمع</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((s) => (
                    <tr key={s.id}>
                      <td className="num-fa">{s.invoiceNo}</td>
                      <td className="num-fa">{s.time}</td>
                      <td>{s.branch}</td>
                      <td>{s.cashier}</td>
                      <td>{s.customer}</td>
                      <td>
                        <span className="chip chip-blue">{s.payment}</span>
                      </td>
                      <td>
                        <span className={
                          s.status === "تسویه" ? "chip-green" :
                          s.status === "معلق" ? "chip-amber" : "chip-red"
                        }>{s.status}</span>
                      </td>
                      <td className="!text-left font-bold num-fa">{formatToman(s.total, { withUnit: false })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-5">
            <div className="section-title flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> هشدارها</div>
            <div className="subtle mb-4">مواردی که نیاز به بررسی دارند.</div>
            <ul className="space-y-2">
              {lowStock.map((s) => (
                <li key={s.name} className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                  <ScanBarcode className="w-4 h-4 text-amber-700" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-amber-900">{s.name}</div>
                    <div className="text-[11px] text-amber-700 num-fa">موجودی: {toFa(s.stock)} — نقطه سفارش: {toFa(s.min)}</div>
                  </div>
                  <button className="btn-secondary !py-1 !px-2 text-xs">سفارش خرید</button>
                </li>
              ))}
              <li className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
                <ArrowDownRight className="w-4 h-4 text-rose-700" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-rose-900">مغایرت صندوق شعبه ونک</div>
                  <div className="text-[11px] text-rose-700 num-fa">اختلاف: −۳۸٬۰۰۰ تومان — نیازمند بررسی سرشیفت</div>
                </div>
                <button className="btn-danger !py-1 !px-2 text-xs">بررسی</button>
              </li>
              <li className="p-3 rounded-xl bg-brand-50 border border-brand-200 flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-brand-700" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-brand-900">سفارش آنلاین آماده تحویل</div>
                  <div className="text-[11px] text-brand-700 num-fa">۷ سفارش BOPIS آماده تحویل به مشتری است.</div>
                </div>
                <button className="btn-secondary !py-1 !px-2 text-xs">مشاهده</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
