"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanBarcode,
  Package,
  Warehouse,
  Truck,
  Users,
  Gift,
  BadgePercent,
  Coins,
  Clock4,
  Building2,
  BookOpenCheck,
  BarChart3,
  Bell,
  Cable,
  ShieldCheck,
  Settings,
  Boxes,
  FileText,
  ClipboardList,
  CreditCard,
  UtensilsCrossed,
  ChefHat,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; group: string };

const nav: Item[] = [
  { href: "/dashboard", label: "داشبورد اجرایی", icon: LayoutDashboard, group: "خلاصه" },
  { href: "/dashboard/sales", label: "فروش‌ها", icon: ScanBarcode, group: "خلاصه" },
  { href: "/dashboard/reports", label: "گزارش‌ها", icon: BarChart3, group: "خلاصه" },

  { href: "/dashboard/tables", label: "میزها و سالن‌ها", icon: UtensilsCrossed, group: "رستوران و کافه" },
  { href: "/dashboard/kitchen", label: "نمایشگر آشپزخانه (KDS)", icon: ChefHat, group: "رستوران و کافه" },
  { href: "/dashboard/menu", label: "منو و افزودنی‌ها", icon: BookOpen, group: "رستوران و کافه" },

  { href: "/dashboard/products", label: "کالاها و کاتالوگ", icon: Package, group: "محصول و انبار" },
  { href: "/dashboard/inventory", label: "موجودی انبار", icon: Warehouse, group: "محصول و انبار" },
  { href: "/dashboard/transfers", label: "انتقال بین شعب", icon: Boxes, group: "محصول و انبار" },

  { href: "/dashboard/purchases", label: "خرید و فاکتور تأمین", icon: FileText, group: "خرید و تأمین" },
  { href: "/dashboard/suppliers", label: "تأمین‌کنندگان", icon: Truck, group: "خرید و تأمین" },

  { href: "/dashboard/customers", label: "مشتریان (CRM)", icon: Users, group: "مشتری" },
  { href: "/dashboard/loyalty", label: "باشگاه وفاداری", icon: Gift, group: "مشتری" },
  { href: "/dashboard/promotions", label: "پروموشن و تخفیف", icon: BadgePercent, group: "مشتری" },

  { href: "/dashboard/payments", label: "پرداخت‌ها و درگاه‌ها", icon: CreditCard, group: "مالی و صندوق" },
  { href: "/dashboard/cash", label: "مدیریت صندوق و شیفت", icon: Coins, group: "مالی و صندوق" },
  { href: "/dashboard/accounting", label: "حسابداری و مالیات", icon: BookOpenCheck, group: "مالی و صندوق" },

  { href: "/dashboard/employees", label: "کارکنان", icon: Clock4, group: "پرسنل و ساختار" },
  { href: "/dashboard/branches", label: "شعب و صندوق‌ها", icon: Building2, group: "پرسنل و ساختار" },
  { href: "/dashboard/audit", label: "لاگ رخداد و ژورنال", icon: ClipboardList, group: "پرسنل و ساختار" },

  { href: "/dashboard/integrations", label: "یکپارچه‌سازی‌ها", icon: Cable, group: "سیستم" },
  { href: "/dashboard/notifications", label: "اعلان‌ها", icon: Bell, group: "سیستم" },
  { href: "/dashboard/security", label: "امنیت و دسترسی", icon: ShieldCheck, group: "سیستم" },
  { href: "/dashboard/settings", label: "تنظیمات", icon: Settings, group: "سیستم" },
];

export function Sidebar() {
  const path = usePathname();
  const groups = Array.from(new Set(nav.map((n) => n.group)));

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 border-l border-surface-border bg-white/90 backdrop-blur">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-surface-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white">
          <ScanBarcode className="w-4 h-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-extrabold text-slate-900">کش‌رجیستر</div>
          <div className="text-[10px] text-slate-500">پنل مدیریت سازمانی</div>
        </div>
      </div>

      <nav className="h-[calc(100vh-3.5rem)] overflow-y-auto p-3 space-y-4">
        {groups.map((g) => (
          <div key={g}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-2 mb-1">{g}</div>
            <ul className="space-y-0.5">
              {nav.filter((n) => n.group === g).map((n) => {
                const active = path === n.href || (n.href !== "/dashboard" && path.startsWith(n.href));
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition",
                        active
                          ? "bg-brand-600 text-white shadow-pop"
                          : "text-slate-600 hover:bg-surface-muted",
                      )}
                    >
                      <n.icon className="w-4 h-4" />
                      <span>{n.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="pt-2">
          <Link href="/pos" className="btn-primary w-full">
            <ScanBarcode className="w-4 h-4" />
            بازگشت به صندوق فروش
          </Link>
        </div>
      </nav>
    </aside>
  );
}
