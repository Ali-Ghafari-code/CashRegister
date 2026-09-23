import { TopBar } from "@/components/admin/top-bar";
import { formatToman, toFa } from "@/lib/utils";
import { Plus, BadgePercent, CalendarClock, Tag, LayoutList, Layers3 } from "lucide-react";

const promos = [
  { id: 1, name: "خرید ۲ ببر ۱ رایگان — چیپس چاکلز", type: "BXGY", scope: "کل شعب", status: "فعال", from: "۱۴۰۳/۱۲/۰۱", to: "۱۴۰۳/۱۲/۳۰", used: 4310, revenue: 218_000_000 },
  { id: 2, name: "تخفیف ۱۵٪ لبنیات — پنج‌شنبه‌ها", type: "دسته‌ای", scope: "همه شعب", status: "فعال", from: "همیشگی", to: "پنج‌شنبه‌ها", used: 12_450, revenue: 640_000_000 },
  { id: 3, name: "هدیه تولد اعضای طلایی", type: "بخش‌بندی مشتری", scope: "همه شعب", status: "فعال", from: "همیشگی", to: "—", used: 812, revenue: 42_000_000 },
  { id: 4, name: "کوپن ۵۰٬۰۰۰ تومانی خرید بالای ۵۰۰ هزار", type: "کوپن", scope: "شعبه مرکزی", status: "متوقف", from: "۱۴۰۳/۱۱/۱۰", to: "۱۴۰۳/۱۱/۲۵", used: 2_180, revenue: 108_000_000 },
  { id: 5, name: "کمپین پایان هفته — نوشیدنی‌ها", type: "بازه زمانی", scope: "همه شعب", status: "فعال", from: "پنج‌شنبه‌ها", to: "جمعه‌ها", used: 5_620, revenue: 312_000_000 },
];

export default function PromotionsPage() {
  return (
    <>
      <TopBar title="پروموشن و تخفیف" description="موتور قواعد ترکیبی؛ محدود بر اساس زمان، مشتری، کالا و شعبه" />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1" />
          <button className="btn-secondary"><Layers3 className="w-4 h-4" /> قواعد ترکیب</button>
          <button className="btn-primary"><Plus className="w-4 h-4" /> کمپین جدید</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Stat icon={BadgePercent} label="کمپین‌های فعال" value={toFa(14)} />
          <Stat icon={LayoutList} label="مصرف امروز" value={toFa(1_247)} />
          <Stat icon={Tag} label="هزینه تخفیف امروز" value={formatToman(58_400_000, { withUnit: false })} />
          <Stat icon={CalendarClock} label="کمپین‌های در انتظار شروع" value={toFa(4)} />
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[900px]">
              <thead>
                <tr>
                  <th>نام کمپین</th>
                  <th>نوع</th>
                  <th>دامنه</th>
                  <th>وضعیت</th>
                  <th>بازه</th>
                  <th>تعداد مصرف</th>
                  <th className="!text-left">فروش منتسب</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold text-slate-800">{p.name}</td>
                    <td><span className="chip-blue">{p.type}</span></td>
                    <td>{p.scope}</td>
                    <td>
                      {p.status === "فعال"
                        ? <span className="chip-green">فعال</span>
                        : <span className="chip-slate">متوقف</span>}
                    </td>
                    <td className="num-fa">{p.from} → {p.to}</td>
                    <td className="num-fa">{toFa(p.used)}</td>
                    <td className="!text-left font-bold num-fa">{formatToman(p.revenue, { withUnit: false })}</td>
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

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-4 h-4" /></div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-bold text-slate-900 num-fa">{value}</div>
      </div>
    </div>
  );
}
