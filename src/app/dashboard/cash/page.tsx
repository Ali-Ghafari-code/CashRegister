import { ModulePage } from "@/components/admin/module-page";
import { formatToman, toFa } from "@/lib/utils";
import { Banknote, LogIn, LogOut, PiggyBank, AlertTriangle } from "lucide-react";

const shifts = [
  { id: "SH-۹۸۲۱", cashier: "رضا مرادی", register: "صندوق ۱ — مرکزی", open: "۰۸:۰۰", close: "-", opening: 5_000_000, expected: 42_800_000, actual: 42_800_000, diff: 0, status: "باز" },
  { id: "SH-۹۸۲۲", cashier: "سمیرا حسینی", register: "صندوق ۲ — مرکزی", open: "۰۸:۱۵", close: "-", opening: 5_000_000, expected: 31_400_000, actual: 31_362_000, diff: -38_000, status: "باز" },
  { id: "SH-۹۸۲۳", cashier: "کوروش امینی", register: "صندوق ۱ — ونک", open: "۰۷:۵۰", close: "۱۶:۰۵", opening: 4_000_000, expected: 28_600_000, actual: 28_650_000, diff: 50_000, status: "بسته" },
  { id: "SH-۹۸۲۴", cashier: "بهنام قربانی", register: "صندوق ۳ — اصفهان", open: "۰۸:۰۵", close: "-", opening: 5_000_000, expected: 22_100_000, actual: 22_100_000, diff: 0, status: "باز" },
];

export default function CashPage() {
  return (
    <ModulePage
      title="مدیریت صندوق و شیفت"
      description="مانده، برداشت، واریز، تسویه شیفت و مغایرت‌گیری"
      metrics={[
        { label: "شیفت‌های باز" , value: toFa(shifts.filter(s => s.status === "باز").length) },
        { label: "مانده نقدی صندوق‌ها" , value: formatToman(125_000_000, { withUnit: false }) },
        { label: "برداشت‌های امروز" , value: formatToman(38_000_000, { withUnit: false }) },
        { label: "مجموع مغایرت" , value: formatToman(12_000, { withUnit: false }) },
      ]}
    >
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
                <th>صندوقدار</th>
                <th>صندوق</th>
                <th>ساعات</th>
                <th>افتتاحیه</th>
                <th>مورد انتظار</th>
                <th>موجودی واقعی</th>
                <th>مغایرت</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id}>
                  <td className="num-fa font-semibold">{s.id}</td>
                  <td>{s.cashier}</td>
                  <td>{s.register}</td>
                  <td className="num-fa">{s.open} → {s.close}</td>
                  <td className="num-fa">{formatToman(s.opening, { withUnit: false })}</td>
                  <td className="num-fa">{formatToman(s.expected, { withUnit: false })}</td>
                  <td className="num-fa font-bold">{formatToman(s.actual, { withUnit: false })}</td>
                  <td className={s.diff === 0 ? "num-fa text-emerald-600" : s.diff < 0 ? "num-fa text-rose-600 font-semibold" : "num-fa text-amber-600 font-semibold"}>
                    {s.diff === 0 ? "بدون مغایرت" : `${s.diff > 0 ? "+" : "−"}${formatToman(Math.abs(s.diff), { withUnit: false })}`}
                    {s.diff < 0 && <AlertTriangle className="w-3.5 h-3.5 inline ms-1" />}
                  </td>
                  <td>
                    {s.status === "باز" ? <span className="chip-green">باز</span> : <span className="chip-slate">بسته</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModulePage>
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
