"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScanBarcode, LogIn, KeyRound, AlertCircle } from "lucide-react";
import { api, setToken, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "pin">("password");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = mode === "password"
        ? await api.login(username, password)
        : await api.loginPin(pin);
      setToken(res.access_token);
      router.push("/dashboard");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? typeof err.detail === "string" ? err.detail : "ورود ناموفق بود"
          : "ارتباط با سرور برقرار نشد. لطفاً بک‌اند را اجرا کنید.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-pop">
            <ScanBarcode className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900">ورود به کش‌رجیستر</div>
            <div className="text-xs text-slate-500">با حساب کاربری یا PIN وارد شوید</div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 p-1 bg-surface-muted rounded-xl">
          <button className={"flex-1 py-2 rounded-lg text-sm font-semibold transition " + (mode === "password" ? "bg-white shadow" : "text-slate-500")} onClick={() => setMode("password")}>
            یوزر/پسورد
          </button>
          <button className={"flex-1 py-2 rounded-lg text-sm font-semibold transition " + (mode === "pin" ? "bg-white shadow" : "text-slate-500")} onClick={() => setMode("pin")}>
            PIN
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "password" ? (
            <>
              <div>
                <label className="label">نام کاربری</label>
                <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="label">رمز عبور</label>
                <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </>
          ) : (
            <div>
              <label className="label">PIN صندوقدار</label>
              <input inputMode="numeric" autoFocus className="input tracking-widest text-center text-lg num-fa" value={pin} onChange={(e) => setPin(e.target.value)} />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <button className="btn-primary w-full text-base py-3" disabled={loading}>
            {loading ? "در حال ورود..." : (
              <>
                {mode === "password" ? <LogIn className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                ورود
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-xs text-slate-500 text-center leading-6">
          حساب پیش‌فرض پس از seed: <b className="text-slate-700">admin / admin123</b> — PIN: <b className="text-slate-700 num-fa">۰۰۰۰</b>
          <br />
          <Link href="/" className="text-brand-700 hover:underline">بازگشت به صفحه اصلی</Link>
        </div>
      </div>
    </main>
  );
}
