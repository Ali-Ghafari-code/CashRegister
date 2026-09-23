import { ModulePage } from "@/components/admin/module-page";
import { formatToman, toFa } from "@/lib/utils";
import { FileText, PackageCheck, Plus } from "lucide-react";

const orders = [
  { id: "PO-۲۰۱۸", supplier: "شرکت پگاه شمال", items: 42, total: 128_500_000, status: "تحویل کامل", eta: "۱۴۰۳/۱۲/۱۱" },
  { id: "PO-۲۰۱۹", supplier: "کاله آمل", items: 28, total: 74_200_000, status: "دریافت جزئی", eta: "۱۴۰۳/۱۲/۱۳" },
  { id: "PO-۲۰۲۰", supplier: "چی‌توز البرز", items: 60, total: 92_000_000, status: "در انتظار", eta: "۱۴۰۳/۱۲/۱۸" },
  { id: "PO-۲۰۲۱", supplier: "کوکاکولا ایران", items: 120, total: 210_000_000, status: "در انتظار", eta: "۱۴۰۳/۱۲/۲۰" },
];

export default function PurchasesPage() {
  return (
    <ModulePage
      title="خرید و فاکتور تأمین"
      description="سفارش خرید، رسید کالا، فاکتور تأمین و پرداخت"
      metrics={[
        { label: "سفارش خرید فعال" , value: toFa(23) },
        { label: "ارزش در گردش" , value: formatToman(1_842_000_000, { withUnit: false }) },
        { label: "دریافت‌های امروز" , value: toFa(7) },
        { label: "پرداخت‌های سررسید" , value: toFa(4) },
      ]}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1" />
        <button className="btn-secondary"><PackageCheck className="w-4 h-4" /> ثبت رسید</button>
        <button className="btn-primary"><Plus className="w-4 h-4" /> سفارش خرید جدید</button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-auto">
          <table className="table-clean w-full min-w-[800px]">
            <thead>
              <tr>
                <th>شناسه</th>
                <th>تأمین‌کننده</th>
                <th>اقلام</th>
                <th>مبلغ</th>
                <th>تاریخ تحویل</th>
                <th>وضعیت</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="num-fa font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> {o.id}</td>
                  <td>{o.supplier}</td>
                  <td className="num-fa">{toFa(o.items)}</td>
                  <td className="num-fa font-bold">{formatToman(o.total, { withUnit: false })}</td>
                  <td className="num-fa">{o.eta}</td>
                  <td>
                    <span className={
                      o.status === "تحویل کامل" ? "chip-green" :
                      o.status === "دریافت جزئی" ? "chip-amber" : "chip-blue"
                    }>{o.status}</span>
                  </td>
                  <td className="!text-left"><button className="btn-ghost text-xs">جزئیات</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModulePage>
  );
}
