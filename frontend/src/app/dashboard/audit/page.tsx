import { ModulePage } from "@/components/admin/module-page";
import { toFa, jalaliDateTime } from "@/lib/utils";
import { ShieldAlert, KeyRound, FilePenLine, Trash2, RotateCcw, BadgePercent, Settings2 } from "lucide-react";

const logs = [
  { time: new Date(Date.now() - 60_000 * 4), user: "رضا مرادی", role: "صندوقدار", action: "تخفیف دستی ۱۰٪", detail: "فاکتور INV-۱۴۰۳۱۲۰۱۰۰۲۱", icon: BadgePercent, level: "info" },
  { time: new Date(Date.now() - 60_000 * 12), user: "سمیرا حسینی", role: "صندوقدار ارشد", action: "بازکردن کشوی صندوق بدون فروش", detail: "صندوق ۲ — مرکزی", icon: KeyRound, level: "warn" },
  { time: new Date(Date.now() - 60_000 * 26), user: "مریم شاهی", role: "مدیر شعبه", action: "تأیید مرجوعی بدون فاکتور", detail: "مبلغ ۴۸۰٬۰۰۰ تومان", icon: RotateCcw, level: "warn" },
  { time: new Date(Date.now() - 60_000 * 40), user: "لیلا کاظمی", role: "حسابدار", action: "ویرایش نرخ مالیات", detail: "از ۹٪ به ۱۰٪ برای دسته تنقلات", icon: Settings2, level: "info" },
  { time: new Date(Date.now() - 60_000 * 58), user: "کوروش امینی", role: "سرشیفت", action: "حذف قلم پس از فروش", detail: "فاکتور INV-۱۴۰۳۱۲۰۱۰۰۱۸", icon: Trash2, level: "warn" },
  { time: new Date(Date.now() - 60_000 * 72), user: "مدیر سیستم", role: "مدیر", action: "تغییر سطح دسترسی نقش «صندوقدار»", detail: "افزودن مجوز «ابطال قلم»", icon: FilePenLine, level: "info" },
  { time: new Date(Date.now() - 60_000 * 92), user: "بهنام قربانی", role: "انبار", action: "اصلاح موجودی", detail: "کاهش ۳ عدد پفک نمکی — دلیل: خرابی", icon: ShieldAlert, level: "info" },
];

export default function AuditPage() {
  return (
    <ModulePage
      title="لاگ رخداد و ژورنال الکترونیکی"
      description="ثبت غیرقابل تغییر تمام رخدادهای حساس؛ قابل جست‌وجو و صادرشدنی"
      metrics={[
        { label: "رویدادهای امروز" , value: toFa(14_820) },
        { label: "رویدادهای حساس" , value: toFa(84) },
        { label: "تأییدهای مدیر امروز" , value: toFa(27) },
        { label: "هشدارهای فعال" , value: toFa(3) },
      ]}
    >
      <div className="card overflow-hidden">
        <div className="overflow-auto">
          <table className="table-clean w-full min-w-[900px]">
            <thead>
              <tr>
                <th>زمان</th>
                <th>کاربر</th>
                <th>نقش</th>
                <th>عمل</th>
                <th>جزئیات</th>
                <th>سطح</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i}>
                  <td className="num-fa whitespace-nowrap">{jalaliDateTime(l.time)}</td>
                  <td className="font-semibold text-slate-800">{l.user}</td>
                  <td>{l.role}</td>
                  <td className="flex items-center gap-2"><l.icon className="w-4 h-4 text-slate-400" /> {l.action}</td>
                  <td className="text-slate-600 num-fa">{l.detail}</td>
                  <td>
                    {l.level === "warn"
                      ? <span className="chip-amber">هشدار</span>
                      : <span className="chip-slate">اطلاع</span>}
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
