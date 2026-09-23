import { ModulePage } from "@/components/admin/module-page";
import { toFa } from "@/lib/utils";
import { Bell, MessageSquare, Mail, Smartphone, Webhook, AlertTriangle, PackageX, RefreshCcw, CreditCard } from "lucide-react";

const notifs = [
  { icon: AlertTriangle, title: "اختلاف صندوق شعبه ونک", detail: "مغایرت ۳۸٬۰۰۰ تومانی در پایان شیفت سمیرا حسینی", time: "۵ دقیقه پیش", level: "warn" },
  { icon: PackageX, title: "کالای پرفروش رو به اتمام", detail: "ران گوسفندی — موجودی ۸ کیلوگرم (نقطه سفارش: ۱۵)", time: "۱۴ دقیقه پیش", level: "warn" },
  { icon: CreditCard, title: "پرداخت ناموفق درگاه", detail: "کد خطا: TIMEOUT — درگاه سامان کیش، فاکتور INV-...۹۹۲", time: "۲۸ دقیقه پیش", level: "err" },
  { icon: RefreshCcw, title: "مرجوعی بزرگ نیازمند تأیید", detail: "مبلغ ۴٬۸۰۰٬۰۰۰ تومان — شعبه اصفهان", time: "۴۲ دقیقه پیش", level: "info" },
];

export default function NotificationsPage() {
  return (
    <ModulePage
      title="اعلان‌ها"
      description="مرکز اعلان‌ها؛ کانال‌های In-App، SMS، Email، Push و Webhook"
      metrics={[
        { label: "اعلان‌های ۲۴ ساعت گذشته" , value: toFa(1_284) },
        { label: "قوانین فعال" , value: toFa(42) },
        { label: "کانال‌های فعال" , value: toFa(5) },
        { label: "خطای ارسال" , value: toFa(3) },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Channel icon={Bell} label="In-App" active />
        <Channel icon={Smartphone} label="Push" active />
        <Channel icon={MessageSquare} label="SMS" active />
        <Channel icon={Mail} label="Email" active />
      </div>

      <div className="card overflow-hidden">
        <div className="section-title p-5 flex items-center gap-2"><Webhook className="w-4 h-4" /> اعلان‌های اخیر</div>
        <ul>
          {notifs.map((n, i) => (
            <li key={i} className={
              "px-5 py-3 border-t border-surface-border/70 flex items-start gap-3 " +
              (n.level === "warn" ? "bg-amber-50/30" : n.level === "err" ? "bg-rose-50/30" : "")
            }>
              <div className={
                "w-9 h-9 rounded-xl grid place-items-center " +
                (n.level === "warn" ? "bg-amber-100 text-amber-700" :
                 n.level === "err" ? "bg-rose-100 text-rose-700" :
                 "bg-brand-100 text-brand-700")
              }>
                <n.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{n.title}</div>
                <div className="text-sm text-slate-600">{n.detail}</div>
              </div>
              <div className="text-xs text-slate-500 num-fa whitespace-nowrap">{n.time}</div>
            </li>
          ))}
        </ul>
      </div>
    </ModulePage>
  );
}

function Channel({ icon: Icon, label, active }: { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-4 h-4" /></div>
      <div className="flex-1">
        <div className="font-semibold text-slate-800">{label}</div>
        <div className="text-xs text-slate-500">{active ? "فعال" : "غیرفعال"}</div>
      </div>
      <span className={active ? "chip-green" : "chip-slate"}>{active ? "فعال" : "غیرفعال"}</span>
    </div>
  );
}
