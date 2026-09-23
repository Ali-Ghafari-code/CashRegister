import { TopBar } from "@/components/admin/top-bar";
import { recentSales } from "@/lib/mock-data";
import { formatToman, toFa } from "@/lib/utils";
import { FileDown, Filter, Search, RotateCcw, Printer } from "lucide-react";

export default function SalesPage() {
  return (
    <>
      <TopBar title="فروش‌ها" description="مرور، فیلتر و ابطال/مرجوعی تراکنش‌های فروش" />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute right-3 inset-y-0 my-auto w-4 h-4 text-slate-400" />
            <input className="input !pr-9" placeholder="جست‌وجو با شماره فاکتور، مشتری یا مبلغ..." />
          </div>
          <select className="input max-w-[10rem]">
            <option>همه شعب</option>
            <option>مرکزی تهران</option>
            <option>ونک</option>
            <option>اصفهان</option>
          </select>
          <select className="input max-w-[10rem]">
            <option>همه روش‌ها</option>
            <option>کارتی</option>
            <option>نقدی</option>
            <option>ترکیبی</option>
            <option>اعتباری</option>
          </select>
          <button className="btn-secondary"><Filter className="w-4 h-4" /> فیلتر پیشرفته</button>
          <div className="flex-1" />
          <button className="btn-secondary"><FileDown className="w-4 h-4" /> خروجی</button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[900px]">
              <thead>
                <tr>
                  <th>فاکتور</th>
                  <th>ساعت</th>
                  <th>شعبه</th>
                  <th>صندوقدار</th>
                  <th>مشتری</th>
                  <th>اقلام</th>
                  <th>روش پرداخت</th>
                  <th>وضعیت</th>
                  <th>مبلغ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentSales.concat(recentSales).map((s, i) => (
                  <tr key={i}>
                    <td className="num-fa font-semibold">{s.invoiceNo}</td>
                    <td className="num-fa">{s.time}</td>
                    <td>{s.branch}</td>
                    <td>{s.cashier}</td>
                    <td>{s.customer}</td>
                    <td className="num-fa">{toFa(s.items)}</td>
                    <td><span className="chip-blue">{s.payment}</span></td>
                    <td>
                      <span className={
                        s.status === "تسویه" ? "chip-green" :
                        s.status === "معلق" ? "chip-amber" : "chip-red"
                      }>{s.status}</span>
                    </td>
                    <td className="font-bold num-fa">{formatToman(s.total, { withUnit: false })}</td>
                    <td className="!text-left">
                      <div className="flex items-center gap-1 justify-end">
                        <button className="btn-ghost !p-1.5" title="چاپ مجدد"><Printer className="w-4 h-4" /></button>
                        <button className="btn-ghost !p-1.5" title="مرجوعی"><RotateCcw className="w-4 h-4" /></button>
                      </div>
                    </td>
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
