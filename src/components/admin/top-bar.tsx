"use client";

import { Bell, Search, HelpCircle, ChevronDown } from "lucide-react";
import { jalaliToday } from "@/lib/utils";

export function TopBar({ title, description }: { title: string; description?: string }) {
  return (
    <div className="sticky top-0 z-20 h-14 bg-white/80 backdrop-blur border-b border-surface-border px-6 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-900 truncate">{title}</div>
        {description && <div className="text-[11px] text-slate-500 truncate">{description}</div>}
      </div>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 inset-y-0 my-auto" />
        <input className="input !pr-9 !py-2" placeholder="جست‌وجو در فروش، کالا، مشتری..." />
      </div>

      <div className="flex items-center gap-2">
        <span className="chip chip-green live-dot hidden sm:inline-flex">همه شعب آنلاین</span>
        <span className="chip chip-slate num-fa hidden md:inline-flex">{jalaliToday()}</span>
        <button className="btn-ghost !p-2 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-rose-500" />
        </button>
        <button className="btn-ghost !p-2"><HelpCircle className="w-4 h-4" /></button>
        <button className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-surface-muted rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-sm font-bold">م</div>
          <div className="text-right leading-tight hidden sm:block">
            <div className="text-xs font-bold text-slate-800">مدیر سیستم</div>
            <div className="text-[10px] text-slate-500">دفتر مرکزی</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
