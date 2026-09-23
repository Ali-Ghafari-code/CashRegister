"use client";

import { TopBar } from "@/components/admin/top-bar";
import { KpiCard } from "@/components/ui/kpi-card";
import { Sparkline } from "@/components/ui/sparkline";
import { BarChart } from "@/components/ui/bar-chart";
import { DonutChart } from "@/components/ui/donut-chart";
import {
  Users, BadgeDollarSign, Receipt, AlertTriangle, ArrowUpRight,
  ScanBarcode, Building2, RefreshCcw, ShoppingCart,
} from "lucide-react";
import { api, useApi, toNumber, type ApiSale } from "@/lib/api";
import { formatToman, toFa, jalaliDate } from "@/lib/utils";
import Link from "next/link";

const PAYMENT_COLORS: Record<string, string> = {
  cash: "#10b981",
  card: "#3390ff",
  wallet: "#f59e0b",
  gift_card: "#8b5cf6",
  qr: "#06b6d4",
  credit: "#ef4444",
  bank_transfer: "#64748b",
  check: "#a855f7",
};
const PAYMENT_LABEL: Record<string, string> = {
  cash: "نقدی", card: "کارت‌خوان", wallet: "کیف پول",
  gift_card: "کارت هدیه", qr: "QR / موبایل", credit: "اعتباری",
  bank_transfer: "حواله بانکی", check: "چک",
};
const PAY_LABEL_FROM_STATUS: Record<string, string> = {
  completed: "تسویه", held: "معلق", voided: "باطل", returned: "برگشتی",
};

export default function DashboardPage() {
  const { data: summary, offline, loading, refetch } = useApi(
    "dashboard",
    () => api.dashboardSummary(),
  );
  const { data: hourly } = useApi(
    "reports",
    () => api.hourlyReport(),
    [],
  );
  const { data: recentSales } = useApi(
    "sales",
    () => api.listSales({ size: 8 }),
  );

  const kpi = summary?.kpi;
  const branches = summary?.branches ?? [];
  const paymentMix = (summary?.payment_mix ?? []).map((p) => ({
    name: PAYMENT_LABEL[p.method] ?? p.method,
    value: Math.round((toNumber(p.total) / Math.max(1, (summary?.payment_mix ?? []).reduce((s, x) => s + toNumber(x.total), 0))) * 100),
    color: PAYMENT_COLORS[p.method] ?? "#64748b",
  }));

  const trend = (summary?.sales_trend ?? []).map((p) => toNumber(p.total) / 1_000_000);
  const hourlyData = (hourly ?? []).map((h) => ({
    label: toFa(String(h.hour)),
    value: Number(h.invoices),
  }));

  const lowStock = summary?.low_stock ?? [];
  const sales: ApiSale[] = recentSales?.items ?? [];

  return (
    <>
      <TopBar
        title="داشبورد اجرایی"
        description={offline
          ? "بک‌اند در دسترس نیست — لطفاً backend را اجرا کنید (docker compose up)"
          : "نمای لحظه‌ای عملیات فروش، صندوق و انبار"}
      />
      <div className="p-6 space-y-6">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            <div className="flex-1 text-sm">
              اتصال به بک‌اند برقرار نیست. صفحه به‌محض بازگشت اتصال، به‌طور خودکار به‌روزرسانی می‌شود.
            </div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            title="فروش امروز"
            value={loading ? "..." : formatToman(toNumber(kpi?.today_sales))}
            hint={`${toFa(branches.length)} شعبه فعال`}
            icon={BadgeDollarSign} accent="brand"
          />
          <KpiCard
            title="تعداد فاکتور"
            value={loading ? "..." : toFa(kpi?.today_invoices ?? 0)}
            hint={
              kpi?.today_invoices
                ? `میانگین سبد: ${formatToman(toNumber(kpi.today_sales) / kpi.today_invoices)}`
                : "بدون فروش"
            }
            icon={Receipt} accent="emerald"
          />
          <KpiCard
            title="مشتری فعال"
            value={loading ? "..." : toFa(kpi?.active_customers ?? 0)}
            hint="کل مشتریان ثبت‌شده در سامانه"
            icon={Users} accent="violet"
          />
          <KpiCard
            title="مرجوعی امروز"
            value={loading ? "..." : formatToman(toNumber(kpi?.today_refunds))}
            hint="جمع فاکتورهای برگشتی"
            icon={RefreshCcw} accent="rose"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-title">روند فروش ۱۴ روز اخیر</div>
                <div className="subtle">میلیون تومان</div>
              </div>
              <span className="chip chip-blue live-dot">داده لحظه‌ای</span>
            </div>
            <div className="h-56 mt-4">
              {trend.length > 0
                ? <Sparkline data={trend} height={220} />
                : <div className="h-full grid place-items-center text-slate-400 text-sm">هنوز فروشی ثبت نشده است.</div>}
            </div>
          </div>

          <div className="card p-5">
            <div className="section-title">ترکیب روش‌های پرداخت</div>
            <div className="subtle mb-4">امروز</div>
            {paymentMix.length > 0
              ? <DonutChart data={paymentMix} />
              : <div className="text-sm text-slate-400 py-10 text-center">هیچ پرداختی برای امروز ثبت نشده.</div>}
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
              <span className="chip chip-blue live-dot">به‌روزرسانی خودکار</span>
            </div>
            <div className="mt-4">
              {hourlyData.length > 0
                ? <BarChart data={hourlyData} />
                : <div className="text-sm text-slate-400 py-10 text-center">هنوز تراکنشی ثبت نشده.</div>}
            </div>
          </div>

          <div className="card p-5">
            <div className="section-title">وضعیت شعب</div>
            <div className="subtle mb-4">فروش امروز به تفکیک شعبه.</div>
            {branches.length === 0 ? (
              <div className="text-sm text-slate-400">شعبه‌ای ثبت نشده.</div>
            ) : (
              <ul className="space-y-3">
                {branches.map((b) => (
                  <li key={b.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{b.name}</div>
                      <div className="text-[11px] text-slate-500 num-fa">
                        {toFa(b.invoices)} فاکتور امروز
                      </div>
                    </div>
                    <div className="text-sm font-bold num-fa">{formatToman(toNumber(b.today_sales), { withUnit: false })}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent sales + low stock */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="section-title">فروش‌های اخیر</div>
                <div className="subtle">همان فروش‌های ثبت‌شده در POS</div>
              </div>
              <Link href="/dashboard/sales" className="btn-secondary text-xs">مشاهده همه</Link>
            </div>
            <div className="overflow-auto -mx-5">
              <table className="table-clean w-full min-w-[720px]">
                <thead>
                  <tr>
                    <th>شماره فاکتور</th>
                    <th>تاریخ</th>
                    <th>شعبه</th>
                    <th>مشتری</th>
                    <th>اقلام</th>
                    <th>وضعیت</th>
                    <th className="!text-left">جمع</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-slate-400 py-8">هنوز فروشی ثبت نشده — از صفحه POS ثبت کنید.</td></tr>
                  )}
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="num-fa">{s.invoice_no}</td>
                      <td className="num-fa">{jalaliDate(new Date(s.created_at))}</td>
                      <td>{branches.find((b) => b.id === s.branch_id)?.name ?? "—"}</td>
                      <td>{s.customer_id ? `#${toFa(s.customer_id)}` : "مهمان"}</td>
                      <td className="num-fa">{toFa(s.items.length)}</td>
                      <td>
                        <span className={
                          s.status === "completed" ? "chip-green" :
                          s.status === "held" ? "chip-amber" : "chip-red"
                        }>{PAY_LABEL_FROM_STATUS[s.status] ?? s.status}</span>
                      </td>
                      <td className="!text-left font-bold num-fa">{formatToman(toNumber(s.grand_total), { withUnit: false })}</td>
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
              {lowStock.length === 0 && (
                <li className="text-sm text-slate-400 py-4">در حال حاضر کالای کم‌موجودی نیست.</li>
              )}
              {lowStock.slice(0, 6).map((s) => (
                <li key={s.product_id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                  <ScanBarcode className="w-4 h-4 text-amber-700" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-amber-900 truncate">{s.name}</div>
                    <div className="text-[11px] text-amber-700 num-fa">موجودی: {toFa(toNumber(s.on_hand))} — نقطه سفارش: {toFa(s.reorder_point)}</div>
                  </div>
                  <Link href="/dashboard/purchases" className="btn-secondary !py-1 !px-2 text-xs">سفارش خرید</Link>
                </li>
              ))}
              <li className="p-3 rounded-xl bg-brand-50 border border-brand-200 flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-brand-700" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-brand-900">شروع فروش در POS</div>
                  <div className="text-[11px] text-brand-700">فاکتورهای POS بلافاصله در همین صفحه ظاهر می‌شوند.</div>
                </div>
                <Link href="/pos" className="btn-primary !py-1 !px-3 text-xs">ورود به POS</Link>
              </li>
              <li className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <ArrowUpRight className="w-4 h-4 text-emerald-700" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-emerald-900">همه چیز به هم متصل است</div>
                  <div className="text-[11px] text-emerald-700">
                    محصولات، مشتریان، صندوق، انبار و گزارش‌ها همگی از یک بک‌اند مشترک تغذیه می‌شوند.
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
