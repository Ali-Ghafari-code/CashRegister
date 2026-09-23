import { ModulePage } from "@/components/admin/module-page";
import { toFa } from "@/lib/utils";
import { ShieldCheck, KeySquare, UserCog, Lock, EyeOff, ClipboardCheck } from "lucide-react";

const roles = [
  { name: "صندوقدار", users: 84, perms: ["ثبت فروش", "پرداخت", "مرجوعی با فاکتور"] },
  { name: "صندوقدار ارشد", users: 22, perms: ["تخفیف تا ۱۵٪", "ابطال قلم", "نگه‌داشتن سبد"] },
  { name: "سرشیفت", users: 14, perms: ["تأیید مدیر", "بازکردن کشو", "بستن شیفت"] },
  { name: "مدیر شعبه", users: 8, perms: ["تخفیف نامحدود", "مرجوعی بدون فاکتور", "اصلاح موجودی"] },
  { name: "انبار", users: 27, perms: ["ورود کالا", "شمارش", "انتقال بین شعب"] },
  { name: "حسابدار", users: 6, perms: ["حسابداری", "مالیات", "پرداخت تأمین‌کننده"] },
];

export default function SecurityPage() {
  return (
    <ModulePage
      title="امنیت و دسترسی"
      description="RBAC دقیق؛ سیاست‌های ورود، دستگاه‌ها، سشن و رمزنگاری"
      metrics={[
        { label: "نقش‌های تعریف‌شده" , value: toFa(roles.length) },
        { label: "کاربران فعال" , value: toFa(184) },
        { label: "سشن‌های فعال" , value: toFa(96) },
        { label: "دستگاه‌های ثبت‌شده" , value: toFa(38) },
      ]}
      features={[
        { icon: Lock, title: "احراز هویت دو‌مرحله‌ای", description: "پشتیبانی از TOTP، پیامکی و کارت مغناطیسی برای مدیران و حسابداران." },
        { icon: KeySquare, title: "PIN صندوقدار", description: "ورود سریع در POS با PIN با محدودیت تلاش ناموفق و قفل خودکار." },
        { icon: EyeOff, title: "مخفی‌سازی داده حساس", description: "کارت بانکی و شماره تماس مشتری فقط برای نقش‌های مجاز نمایش داده می‌شود." },
        { icon: ClipboardCheck, title: "لاگ تغییرات دسترسی", description: "هرگونه تغییر مجوز، نقش یا سیاست ورود در ژورنال ثبت و قابل بازبینی است." },
        { icon: UserCog, title: "دسترسی شرطی", description: "قوانین بر اساس زمان، شعبه، دستگاه و آی‌پی — مثلاً مرجوعی خارج از ساعت اداری." },
        { icon: ShieldCheck, title: "رمزنگاری داده در حال حرکت و در حال ذخیره", description: "TLS، AES-256 برای داده حساس، هاش قوی برای رمز عبور." },
      ]}
    >
      <div className="card overflow-hidden">
        <div className="section-title p-5">نقش‌ها و دسترسی‌ها</div>
        <div className="overflow-auto">
          <table className="table-clean w-full min-w-[700px]">
            <thead>
              <tr>
                <th>نقش</th>
                <th>تعداد کاربر</th>
                <th>نمونه مجوزها</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.name}>
                  <td className="font-semibold text-slate-800">{r.name}</td>
                  <td className="num-fa">{toFa(r.users)}</td>
                  <td className="flex flex-wrap gap-1">
                    {r.perms.map((p) => <span key={p} className="chip-slate">{p}</span>)}
                  </td>
                  <td className="!text-left"><button className="btn-ghost text-xs">مدیریت</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModulePage>
  );
}
