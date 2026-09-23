import { ModulePage } from "@/components/admin/module-page";
import { formatToman, toFa } from "@/lib/utils";
import { ArrowLeftRight, PackageCheck, PackageOpen, Truck } from "lucide-react";

const transfers = [
  { id: "TR-۱۰۲۳۴", from: "انبار مرکزی", to: "شعبه ونک", items: 24, value: 18_400_000, status: "در حال ارسال" },
  { id: "TR-۱۰۲۳۵", from: "شعبه اصفهان", to: "شعبه مشهد", items: 6, value: 4_120_000, status: "دریافت شد" },
  { id: "TR-۱۰۲۳۶", from: "انبار مرکزی", to: "شعبه شیراز", items: 18, value: 9_800_000, status: "منتظر تأیید" },
  { id: "TR-۱۰۲۳۷", from: "شعبه ونک", to: "شعبه مرکزی", items: 3, value: 1_200_000, status: "مغایرت" },
];

export default function TransfersPage() {
  return (
    <ModulePage
      title="انتقال بین شعب"
      description="مدیریت گردش موجودی بین انبارها و شعب"
      metrics={[
        { label: "انتقال‌های فعال" , value: toFa(14) },
        { label: "ارزش در گردش" , value: formatToman(64_500_000, { withUnit: false }) },
        { label: "منتظر تأیید" , value: toFa(3) },
        { label: "مغایرت‌های امروز" , value: toFa(1) },
      ]}
    >
      <div className="card overflow-hidden">
        <div className="overflow-auto">
          <table className="table-clean w-full min-w-[720px]">
            <thead>
              <tr>
                <th>شناسه</th>
                <th>مبدأ</th>
                <th>مقصد</th>
                <th>تعداد اقلام</th>
                <th>ارزش</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id}>
                  <td className="num-fa font-semibold">{t.id}</td>
                  <td className="flex items-center gap-2"><PackageOpen className="w-4 h-4 text-slate-400" /> {t.from}</td>
                  <td className="flex items-center gap-2"><PackageCheck className="w-4 h-4 text-emerald-500" /> {t.to}</td>
                  <td className="num-fa">{toFa(t.items)}</td>
                  <td className="num-fa font-bold">{formatToman(t.value, { withUnit: false })}</td>
                  <td>
                    <span className={
                      t.status === "دریافت شد" ? "chip-green" :
                      t.status === "منتظر تأیید" ? "chip-amber" :
                      t.status === "مغایرت" ? "chip-red" : "chip-blue"
                    }>
                      {t.status === "در حال ارسال" && <Truck className="w-3.5 h-3.5 ms-1" />}
                      {t.status === "منتظر تأیید" && <ArrowLeftRight className="w-3.5 h-3.5 ms-1" />}
                      {t.status}
                    </span>
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
