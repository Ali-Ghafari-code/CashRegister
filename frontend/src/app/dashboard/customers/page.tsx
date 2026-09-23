"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/admin/top-bar";
import { formatToman, toFa } from "@/lib/utils";
import { UserPlus, Search, Filter, Gift, X, AlertCircle } from "lucide-react";
import { api, useApi, invalidate, toNumber } from "@/lib/api";

export default function CustomersPage() {
  const [q, setQ] = useState("");
  const [showNew, setShowNew] = useState(false);
  const { data, offline, loading, refetch } = useApi("customers", () => api.listCustomers({ q: q || undefined, size: 200 }));

  const items = data?.items ?? [];
  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    return items.filter((c) =>
      c.full_name.includes(q) || (c.phone ?? "").includes(q) || c.code.includes(q),
    );
  }, [items, q]);

  return (
    <>
      <TopBar title="مشتریان (CRM)" description="لیست مشتریان در سراسر شعب — نمایه، اعتبار، بدهی و امتیاز وفاداری." />
      <div className="p-6 space-y-4">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1 text-sm">اتصال به بک‌اند برقرار نیست.</div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute right-3 inset-y-0 my-auto w-4 h-4 text-slate-400" />
            <input className="input !pr-9" placeholder="جست‌وجو با نام، موبایل یا کد مشتری..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && refetch()} />
          </div>
          <button className="btn-secondary" onClick={() => refetch()}><Filter className="w-4 h-4" /> اعمال</button>
          <div className="flex-1" />
          <button className="btn-primary" onClick={() => setShowNew(true)}><UserPlus className="w-4 h-4" /> افزودن مشتری</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Stat title="کل مشتریان" value={toFa(items.length)} />
          <Stat title="اعضای طلایی" value={toFa(items.filter((c) => c.group_id === 3).length)} />
          <Stat title="مانده اعتباری کل" value={formatToman(items.reduce((s, c) => s + toNumber(c.balance), 0), { withUnit: false })} />
          <Stat title="امتیاز وفاداری فعال" value={toFa(items.reduce((s, c) => s + c.loyalty_points, 0))} />
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[900px]">
              <thead>
                <tr>
                  <th>مشتری</th>
                  <th>کد</th>
                  <th>موبایل</th>
                  <th>مانده اعتبار</th>
                  <th>امتیاز</th>
                  <th>وضعیت</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={7} className="text-center text-slate-400 py-8">در حال بارگذاری...</td></tr>}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-slate-400 py-8">مشتری یافت نشد.</td></tr>
                )}
                {filtered.map((c) => {
                  const bal = toNumber(c.balance);
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold">
                            {c.full_name.charAt(0)}
                          </div>
                          <div className="font-semibold text-slate-800">{c.full_name}</div>
                        </div>
                      </td>
                      <td className="num-fa">{c.code}</td>
                      <td className="num-fa">{c.phone ?? "—"}</td>
                      <td className={bal > 0 ? "num-fa text-rose-600 font-semibold" : "num-fa text-emerald-600"}>
                        {bal > 0 ? "-" : ""}{formatToman(bal, { withUnit: false })}
                      </td>
                      <td className="num-fa flex items-center gap-1"><Gift className="w-3.5 h-3.5 text-amber-500" /> {toFa(c.loyalty_points)}</td>
                      <td>{c.is_active ? <span className="chip-green">فعال</span> : <span className="chip-slate">غیرفعال</span>}</td>
                      <td className="!text-left"><button className="btn-ghost text-xs" disabled>نمایه</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showNew && <NewCustomerModal onClose={() => setShowNew(false)} />}
    </>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-1 font-bold text-slate-900 num-fa">{value}</div>
    </div>
  );
}

function NewCustomerModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState(`CU-${String(Math.floor(Math.random() * 9000 + 1000))}`);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [creditLimit, setCreditLimit] = useState("0");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) { setErr("نام مشتری الزامی است."); return; }
    setBusy(true);
    try {
      await api.createCustomer({
        code, full_name: name, phone: phone || undefined, email: email || undefined,
        credit_limit: (creditLimit || "0") as unknown as number,
      });
      invalidate("customers", "dashboard");
      onClose();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 grid place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="section-title flex items-center gap-2"><UserPlus className="w-5 h-5 text-brand-600" /> افزودن مشتری</div>
          <button type="button" className="btn-ghost !p-2" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="label">نام کامل</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">کد مشتری</label>
              <input className="input num-fa" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div>
              <label className="label">موبایل</label>
              <input className="input num-fa" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">ایمیل (اختیاری)</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">سقف اعتبار (تومان)</label>
            <input inputMode="numeric" className="input num-fa" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value.replace(/[^\d]/g, ""))} />
          </div>
          {err && <div className="text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{err}</div>}
        </div>
        <div className="px-5 py-4 border-t border-surface-border flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>انصراف</button>
          <button className="btn-primary" disabled={busy}>{busy ? "..." : "ذخیره"}</button>
        </div>
      </form>
    </div>
  );
}
