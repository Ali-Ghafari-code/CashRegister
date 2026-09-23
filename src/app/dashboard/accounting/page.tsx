import { ModulePage } from "@/components/admin/module-page";
import { formatToman, toFa } from "@/lib/utils";
import { Landmark, Receipt, FileCheck2, Percent } from "lucide-react";

const entries = [
  { date: "۱۴۰۳/۱۲/۰۱", ref: "SL-۹۸۲۱", type: "فروش نقدی", debit: 62_400_000, credit: 0, account: "صندوق مرکزی" },
  { date: "۱۴۰۳/۱۲/۰۱", ref: "SL-۹۸۲۱", type: "درآمد فروش", debit: 0, credit: 57_248_000, account: "درآمد فروش کالا" },
  { date: "۱۴۰۳/۱۲/۰۱", ref: "SL-۹۸۲۱", type: "مالیات ارزش افزوده", debit: 0, credit: 5_152_000, account: "مالیات فروش" },
  { date: "۱۴۰۳/۱۲/۰۱", ref: "PU-۲۰۱۹", type: "خرید", debit: 74_200_000, credit: 0, account: "موجودی کالا" },
  { date: "۱۴۰۳/۱۲/۰۱", ref: "PU-۲۰۱۹", type: "بستانکار تأمین‌کننده", debit: 0, credit: 74_200_000, account: "کاله آمل" },
  { date: "۱۴۰۳/۱۲/۰۱", ref: "RT-۴۴۰۲", type: "برگشت فروش", debit: 4_820_000, credit: 0, account: "برگشتی فروش" },
];

export default function AccountingPage() {
  return (
    <ModulePage
      title="حسابداری و مالیات"
      description="اسناد خودکار فروش/خرید، مالیات ارزش‌افزوده و صورتحساب الکترونیکی"
      metrics={[
        { label: "بدهی مالیاتی جاری" , value: formatToman(184_500_000, { withUnit: false }) },
        { label: "اسناد صادرشده امروز" , value: toFa(487) },
        { label: "صورتحساب‌های الکترونیکی ارسال‌شده" , value: toFa(462) },
        { label: "در انتظار ارسال" , value: toFa(25) },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Tile icon={Landmark} label="سرفصل حساب‌ها" />
        <Tile icon={Receipt} label="پیش‌فاکتور و فاکتور" />
        <Tile icon={FileCheck2} label="ارسال به سامانه مؤدیان" />
        <Tile icon={Percent} label="مدیریت نرخ مالیات" />
      </div>
      <div className="card overflow-hidden">
        <div className="p-5 section-title">دفتر روزنامه — امروز</div>
        <div className="overflow-auto">
          <table className="table-clean w-full min-w-[800px]">
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>شماره سند</th>
                <th>شرح</th>
                <th>حساب</th>
                <th>بدهکار</th>
                <th>بستانکار</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i}>
                  <td className="num-fa">{e.date}</td>
                  <td className="num-fa font-semibold">{e.ref}</td>
                  <td>{e.type}</td>
                  <td>{e.account}</td>
                  <td className={e.debit > 0 ? "num-fa font-bold" : "num-fa text-slate-400"}>{e.debit > 0 ? formatToman(e.debit, { withUnit: false }) : "—"}</td>
                  <td className={e.credit > 0 ? "num-fa font-bold" : "num-fa text-slate-400"}>{e.credit > 0 ? formatToman(e.credit, { withUnit: false }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModulePage>
  );
}

function Tile({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="card p-4 flex items-center gap-3 hover:border-brand-300">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-4 h-4" /></div>
      <div className="text-sm font-semibold text-slate-800">{label}</div>
    </div>
  );
}
