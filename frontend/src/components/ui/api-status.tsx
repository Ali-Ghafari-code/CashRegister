"use client";

import { useApiHealth, logout, setDemoMode } from "@/lib/api";
import { resetMockBackend } from "@/lib/mock-backend";
import { Wifi, WifiOff, User, LogOut, FlaskConical, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApiStatusBadge({ compact = false }: { compact?: boolean }) {
  const { online, demo, me } = useApiHealth();
  const router = useRouter();

  if (compact) {
    if (demo) return <span className="chip chip-blue"><FlaskConical className="w-3.5 h-3.5" /> دمو</span>;
    return online
      ? <span className="chip chip-green live-dot">متصل</span>
      : <span className="chip chip-amber flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" /> آفلاین</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {demo
        ? (
          <span
            className="chip chip-blue flex items-center gap-1"
            title="داده‌ها روی مرورگر ذخیره می‌شوند — بک‌اند اجرا نشده."
          >
            <FlaskConical className="w-3.5 h-3.5" /> حالت دمو
          </span>
        )
        : online
          ? <span className="chip chip-green live-dot flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> متصل به سرور</span>
          : <span className="chip chip-amber flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" /> بک‌اند در دسترس نیست</span>}

      {demo && (
        <button
          className="btn-ghost !p-1"
          title="بازنشانی داده دمو"
          onClick={() => {
            if (confirm("همه داده دمو (محصولات، فروش‌ها، مشتریان) به حالت اولیه بازگردد؟")) {
              resetMockBackend();
              window.location.reload();
            }
          }}
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
      )}

      {demo && (
        <button
          className="btn-ghost !py-1 !px-2 text-xs"
          title="اتصال به بک‌اند واقعی"
          onClick={() => { setDemoMode(false); window.location.reload(); }}
        >
          اتصال دوباره
        </button>
      )}

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
