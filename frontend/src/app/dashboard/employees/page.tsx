"use client";

import { TopBar } from "@/components/admin/top-bar";
import { api, useApi } from "@/lib/api";
import { UserPlus, Fingerprint, AlertCircle } from "lucide-react";
import { toFa } from "@/lib/utils";

export default function EmployeesPage() {
  const { data: employees, offline, loading, refetch } = useApi("employees", () => api.listEmployees(), []);
  const { data: branches } = useApi("branches", () => api.listBranches(), []);
  const branchMap = new Map((branches ?? []).map((b) => [b.id, b.name] as const));

  return (
    <>
      <TopBar title="کارکنان" description="لیست پرسنل ثبت‌شده در بک‌اند" />
      <div className="p-6 space-y-4">
        {offline && (
          <div className="card p-4 bg-amber-50 border-amber-200 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1 text-sm">اتصال به بک‌اند برقرار نیست.</div>
            <button className="btn-secondary" onClick={() => refetch()}>تلاش مجدد</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1" />
          <button className="btn-primary" disabled><UserPlus className="w-4 h-4" /> کارمند جدید</button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[800px]">
              <thead>
                <tr>
                  <th>کارمند</th>
                  <th>نقش</th>
                  <th>شعبه</th>
                  <th>وضعیت</th>
                  <th>موبایل</th>
                  <th>کد</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} className="text-center text-slate-400 py-8">در حال بارگذاری...</td></tr>}
                {!loading && (employees?.length ?? 0) === 0 && (
                  <tr><td colSpan={6} className="text-center text-slate-400 py-8">کارمندی یافت نشد.</td></tr>
                )}
                {(employees ?? []).map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 grid place-items-center font-bold">{e.full_name.charAt(0)}</div>
                        <div className="font-semibold text-slate-800">{e.full_name}</div>
                      </div>
                    </td>
                    <td><span className="chip-blue">{e.role_title}</span></td>
                    <td>{e.branch_id ? branchMap.get(e.branch_id) ?? "—" : "—"}</td>
                    <td>{e.is_active ? <span className="chip-green">فعال</span> : <span className="chip-slate">غیرفعال</span>}</td>
                    <td className="num-fa">{e.phone ?? "—"}</td>
                    <td className="num-fa flex items-center gap-1"><Fingerprint className="w-3.5 h-3.5 text-slate-400" /> {e.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card title="کل کارکنان" value={toFa(employees?.length ?? 0)} />
          <Card title="فعال" value={toFa((employees ?? []).filter((e) => e.is_active).length)} />
          <Card title="شعب" value={toFa(branches?.length ?? 0)} />
        </div>
      </div>
    </>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="font-bold text-slate-900 mt-1 num-fa">{value}</div>
    </div>
  );
}
