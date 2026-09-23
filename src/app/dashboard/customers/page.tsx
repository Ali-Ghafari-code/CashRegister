import { TopBar } from "@/components/admin/top-bar";
import { customers } from "@/lib/mock-data";
import { formatToman, toFa } from "@/lib/utils";
import { UserPlus, Search, Filter, Gift } from "lucide-react";

export default function CustomersPage() {
  return (
    <>
      <TopBar title="مشتریان (CRM)" description="نمای ۳۶۰ درجه، امتیاز وفاداری، اعتبار و بدهی مشتری" />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute right-3 inset-y-0 my-auto w-4 h-4 text-slate-400" />
            <input className="input !pr-9" placeholder="جست‌وجو با نام، موبایل یا کد مشتری..." />
          </div>
          <button className="btn-secondary"><Filter className="w-4 h-4" /> فیلتر گروه</button>
          <div className="flex-1" />
          <button className="btn-primary"><UserPlus className="w-4 h-4" /> افزودن مشتری</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Stat title="کل مشتریان" value={toFa(48_215)} />
          <Stat title="اعضای طلایی" value={toFa(1_942)} />
          <Stat title="مانده اعتباری کل" value={formatToman(1_284_500_000, { withUnit: false })} />
          <Stat title="امتیاز وفاداری فعال" value={toFa(23_400_000)} />
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[900px]">
              <thead>
                <tr>
                  <th>مشتری</th>
                  <th>کد</th>
                  <th>موبایل</th>
                  <th>گروه</th>
                  <th>خریدها</th>
                  <th>مانده اعتبار</th>
                  <th>امتیاز</th>
                  <th>آخرین بازدید</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <div className="font-semibold text-slate-800">{c.name}</div>
                      </div>
                    </td>
                    <td className="num-fa">{c.code}</td>
                    <td className="num-fa">{c.phone}</td>
                    <td>
                      <span className={
                        c.group === "طلایی" ? "chip-amber" :
                        c.group === "نقره‌ای" ? "chip-slate" :
                        c.group === "شرکتی" ? "chip-blue" : "chip-slate"
                      }>{c.group}</span>
                    </td>
                    <td className="num-fa">{toFa(c.totalPurchases)}</td>
                    <td className={c.balance > 0 ? "num-fa text-rose-600 font-semibold" : "num-fa text-emerald-600"}>
                      {c.balance > 0 ? "-" : ""}{formatToman(c.balance, { withUnit: false })}
                    </td>
                    <td className="num-fa flex items-center gap-1"><Gift className="w-3.5 h-3.5 text-amber-500" /> {toFa(c.loyaltyPoints)}</td>
                    <td>{c.lastVisit}</td>
                    <td className="!text-left"><button className="btn-ghost text-xs">نمایه</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
