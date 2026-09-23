import { ModulePage } from "@/components/admin/module-page";
import { Building2, Globe, Languages, Printer, Bell, Cog, Wallet, Barcode, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <ModulePage
      title="تنظیمات"
      description="پیکربندی سراسری، شعبه، صندوق و ماژول‌های اختیاری"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Panel icon={Building2} title="اطلاعات شرکت" desc="نام حقوقی، لوگو، شماره اقتصادی، آدرس و اطلاعات فیسکالی." />
        <Panel icon={Globe} title="ارز و منطقه" desc="تومان/ریال، نمایش اعداد، ارزهای خارجی و نرخ تبدیل." />
        <Panel icon={Languages} title="زبان و تقویم" desc="فارسی، انگلیسی، عربی. تقویم جلالی، ترجمه فاکتور." />
        <Panel icon={Printer} title="طراحی رسید و فاکتور" desc="قالب حرارتی، A4، QR فاکتور، بارکد و پیام تبلیغاتی." />
        <Panel icon={Bell} title="اعلان‌ها" desc="کانال‌های ارسال، قوانین و آستانه‌های هشدار." />
        <Panel icon={Cog} title="قوانین کسب‌وکار" desc="مرجوعی، تخفیف، اعتبار مشتری، تأیید مدیر، فروش زیر قیمت." />
        <Panel icon={Wallet} title="روش‌های پرداخت" desc="فعال‌سازی، اولویت، محدودیت هر روش، پرداخت ترکیبی." />
        <Panel icon={Barcode} title="سخت‌افزار و چاپ برچسب" desc="پرینتر، ترازو، اسکنر، صفحه‌نمایش مشتری." />
        <Panel icon={ShieldCheck} title="فیچرها (Feature Flags)" desc="فعال/غیرفعال‌سازی ماژول‌های اختیاری: وفاداری، اقساط، آفلاین و..." />
      </div>
    </ModulePage>
  );
}

function Panel({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="card p-5 hover:-translate-y-0.5 transition">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-4 h-4" /></div>
      <div className="mt-3 font-bold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600 leading-7">{desc}</div>
      <button className="mt-4 btn-secondary w-full">پیکربندی</button>
    </div>
  );
}
