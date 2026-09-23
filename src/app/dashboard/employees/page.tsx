import { TopBar } from "@/components/admin/top-bar";
import { employees } from "@/lib/mock-data";
import { UserPlus, Fingerprint, KeyRound } from "lucide-react";
import { toFa } from "@/lib/utils";

export default function EmployeesPage() {
  return (
    <>
      <TopBar title="کارکنان" description="مدیریت پرسنل، نقش‌ها، PIN ورود و شیفت روزانه" />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1" />
          <button className="btn-secondary"><KeyRound className="w-4 h-4" /> بازنشانی PIN گروهی</button>
          <button className="btn-primary"><UserPlus className="w-4 h-4" /> کارمند جدید</button>
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
                  <th>PIN</th>
                  <th>شیفت امروز</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 grid place-items-center font-bold">{e.name.charAt(0)}</div>
                        <div className="font-semibold text-slate-800">{e.name}</div>
                      </div>
                    </td>
                    <td><span className="chip-blue">{e.role}</span></td>
                    <td>{e.branch}</td>
                    <td>
                      {e.status === "فعال"
                        ? <span className="chip-green">فعال</span>
                        : <span className="chip-slate">غیرفعال</span>}
                    </td>
                    <td className="num-fa flex items-center gap-2"><Fingerprint className="w-3.5 h-3.5 text-slate-400" /> {e.pin}</td>
                    <td className="num-fa">{e.todayShift ?? <span className="text-slate-400">—</span>}</td>
                    <td className="!text-left"><button className="btn-ghost text-xs">ویرایش</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card title="کل کارکنان" value={toFa(184)} />
          <Card title="شیفت‌های باز" value={toFa(23)} />
          <Card title="تأخیر امروز" value={toFa(3)} />
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
