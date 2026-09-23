import Link from "next/link";
import {
  ScanBarcode,
  LayoutDashboard,
  ShieldCheck,
  Wifi,
  Zap,
  Boxes,
  Users,
  BadgePercent,
  ArrowLeft,
  UtensilsCrossed,
  ChefHat,
  BookOpen,
} from "lucide-react";
import { jalaliToday } from "@/lib/utils";

const features = [
  { icon: Zap, title: "چک‌اوت فوق‌سریع", text: "اسکن، اسکن، اسکن، پرداخت. صندوقدار حرفه‌ای بدون ماوس." },
  { icon: UtensilsCrossed, title: "مدیریت میز و سالن رستوران", text: "چیدمان زنده سالن، رزرو، انتقال میز، ظرفیت و زمان اشغال." },
  { icon: ChefHat, title: "نمایشگر آشپزخانه (KDS)", text: "تیکت لحظه‌ای، ایستگاه‌های گریل/کافه/پیتزا/دسر، اولویت VIP و فوری." },
  { icon: Wifi, title: "کارکرد آفلاین", text: "قطع اینترنت مانع فروش نیست؛ همگام‌سازی خودکار پس از اتصال." },
  { icon: Boxes, title: "مدیریت انبار سازمانی", text: "چند شعبه، سریال، بچ، انقضا، انتقال بین شعب و شمارش موجودی." },
  { icon: Users, title: "CRM و باشگاه مشتریان", text: "نمایه ۳۶۰ درجه، امتیاز وفاداری، اعتبار مشتری، کوپن و کارت هدیه." },
  { icon: BadgePercent, title: "موتور تخفیف و پروموشن", text: "قواعد ترکیبی، محدودیت زمان و مکان، سبد، مشتری و اولویت‌بندی." },
  { icon: BookOpen, title: "منوی رستوران و کافه", text: "سایز، افزودنی، شیر بادام/جو، شات اضافه، درجه پختگی و روتینگ ایستگاه." },
  { icon: ShieldCheck, title: "امنیت و حسابرسی", text: "سطح دسترسی دقیق، تأیید مدیر، لاگ رخداد و ژورنال الکترونیکی." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-24">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-pop">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-lg">کش‌رجیستر</div>
              <div className="text-xs text-slate-500">سامانه صندوق فروش و مدیریت خرده‌فروشی سازمانی</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm">
            <span className="chip chip-slate num-fa">نسخه ۱٫۰٫۰</span>
            <span className="chip chip-green live-dot">آنلاین</span>
            <span className="text-slate-500 num-fa">{jalaliToday()}</span>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-14 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="chip chip-blue mb-4">نسخه سازمانی — چند شعبه‌ای</div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-slate-900">
              پلتفرم یکپارچه فروشگاهی
              <span className="block bg-gradient-to-l from-brand-500 to-brand-800 bg-clip-text text-transparent">
                از صندوق تا حسابداری
              </span>
            </h1>
            <p className="mt-5 text-slate-600 text-lg leading-8 max-w-2xl">
              کش‌رجیستر یک راهکار کامل POS و مدیریت خرده‌فروشی است؛ از یک فروشگاه کوچک تا شبکه‌ای چند شعبه‌ای.
              چک‌اوت سریع، تخفیف پیشرفته، انبار لحظه‌ای، پرداخت ترکیبی، مدیریت شیفت، گزارش‌های اجرایی و
              کار مطمئن در حالت آفلاین — همه در یک اکوسیستم.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pos" className="btn-primary text-base px-5 py-3">
                <ScanBarcode className="w-5 h-5" />
                ورود به صندوق فروش
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="/dashboard" className="btn-secondary text-base px-5 py-3">
                <LayoutDashboard className="w-5 h-5" />
                پنل مدیریت
              </Link>
              <Link href="/login" className="btn-ghost text-base px-5 py-3">
                ورود کاربران →
              </Link>
            </div>

            {/* Restaurant / Cafe quick links */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Link href="/dashboard/tables" className="card p-3 flex items-center gap-3 hover:border-brand-300 transition">
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-slate-800">میزها و سالن‌ها</div>
                  <div className="text-[11px] text-slate-500">چیدمان زنده، رزرو، انتقال</div>
                </div>
              </Link>
              <Link href="/dashboard/kitchen" className="card p-3 flex items-center gap-3 hover:border-brand-300 transition">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 grid place-items-center">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-slate-800">نمایشگر آشپزخانه</div>
                  <div className="text-[11px] text-slate-500">تیکت‌های زنده و ایستگاه‌ها</div>
                </div>
              </Link>
              <Link href="/dashboard/menu" className="card p-3 flex items-center gap-3 hover:border-brand-300 transition">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-slate-800">منوی رستوران/کافه</div>
                  <div className="text-[11px] text-slate-500">سایز، افزودنی، شیر و شات</div>
                </div>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["> ۹۹٫۹٪", "آپ‌تایم صندوق"],
                ["< ۲۰۰ms", "پاسخ‌گویی جست‌وجو"],
                ["۱۲۸+", "ماژول سازمانی"],
                ["۳۰+", "درگاه و آداپتور"],
              ].map(([k, v]) => (
                <div key={v} className="card p-4">
                  <div className="text-xl font-bold text-slate-900 num-fa">{k}</div>
                  <div className="text-xs text-slate-500 mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Fake device preview */}
          <div className="lg:col-span-5">
            <div className="card p-4 rotate-1 hover:rotate-0 transition duration-500">
              <div className="rounded-xl bg-slate-900 text-slate-200 p-5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-slate-400">صندوق ۱ — شعبه مرکزی تهران</div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ["شیر پرچرب پگاه ۱ لیتری", "۲ × ۴۲٬۰۰۰", "۸۴٬۰۰۰"],
                    ["نوشابه کوکاکولا ۱٫۵ لیتری", "۱ × ۵۵٬۰۰۰", "۵۵٬۰۰۰"],
                    ["برنج هاشمی ۱۰ کیلویی", "۱ × ۱٬۶۵۰٬۰۰۰", "۱٬۶۵۰٬۰۰۰"],
                    ["مرغ تازه (کیلوگرم)", "۱٫۸۴ × ۱۹۵٬۰۰۰", "۳۵۸٬۸۰۰"],
                  ].map(([n, q, t]) => (
                    <div key={n} className="flex items-center justify-between text-sm">
                      <span className="text-slate-100">{n}</span>
                      <span className="text-slate-400 num-fa">{q}</span>
                      <span className="text-emerald-300 num-fa font-semibold">{t}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-slate-700/60 pt-4 flex items-center justify-between">
                  <span className="text-slate-400 text-sm">قابل پرداخت</span>
                  <span className="text-2xl font-black num-fa">۲٬۱۴۷٬۸۰۰ تومان</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>۴ قلم کالا</span>
                <span>پرداخت ترکیبی: کارت + کیف پول</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mt-20">
          <h2 className="section-title">قابلیت‌های کلیدی</h2>
          <p className="subtle mt-1">مجموعه‌ای منسجم از ماژول‌های سازمانی؛ آماده استقرار در تولید.</p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="card p-5 hover:-translate-y-0.5 transition">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                  <f.icon className="w-5 h-5" />
                </div>
                <div className="mt-4 font-bold text-slate-900">{f.title}</div>
                <div className="mt-1 text-sm text-slate-600 leading-7">{f.text}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-24 text-center text-xs text-slate-500">
          © کش‌رجیستر — پلتفرم صندوق فروش سازمانی. تمامی حقوق محفوظ است.
        </footer>
      </div>
    </main>
  );
}
