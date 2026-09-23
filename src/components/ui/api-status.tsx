"use client";

import { useApiHealth } from "@/lib/api";
import { Wifi, WifiOff, User, LogOut } from "lucide-react";
import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";

export function ApiStatusBadge({ compact = false }: { compact?: boolean }) {
  const { online, me } = useApiHealth();
  const router = useRouter();

  if (compact) {
    return online
      ? <span className="chip chip-green live-dot">متصل</span>
      : <span className="chip chip-amber flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" /> آفلاین</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {online
        ? <span className="chip chip-green live-dot flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> متصل به سرور</span>
        : <span className="chip chip-amber flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" /> بک‌اند در دسترس نیست</span>}
      {me ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="chip chip-blue flex items-center gap-1"><User className="w-3.5 h-3.5" /> {me.full_name}</span>
          <button
            className="btn-ghost !p-1"
            title="خروج"
            onClick={() => { logout(); router.push("/login"); }}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          className="btn-secondary !py-1 !px-2 text-xs"
          onClick={() => router.push("/login")}
        >
          ورود
        </button>
      )}
    </div>
  );
}
