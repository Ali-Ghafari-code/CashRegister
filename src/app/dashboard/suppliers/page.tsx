import { ModulePage } from "@/components/admin/module-page";
import { formatToman, toFa } from "@/lib/utils";
import { Truck, Phone, MapPin, Plus } from "lucide-react";

const suppliers = [
  { id: 1, name: "شرکت پگاه شمال", phone: "۰۱۱۳۳۴۴۵۵۶۶", city: "آمل", lead: 3, balance: 128_400_000, rating: 4.6 },
  { id: 2, name: "کاله آمل", phone: "۰۱۱۴۴۵۵۶۶۷۷", city: "آمل", lead: 4, balance: 82_500_000, rating: 4.4 },
  { id: 3, name: "چی‌توز البرز", phone: "۰۲۶۳۳۲۲۱۱۰۰", city: "کرج", lead: 5, balance: 42_100_000, rating: 4.2 },
  { id: 4, name: "کوکاکولا ایران", phone: "۰۲۱۸۸۸۸۹۹۰۰", city: "تهران", lead: 2, balance: 320_000_000, rating: 4.8 },
  { id: 5, name: "لادن گلستان", phone: "۰۱۷۳۳۲۲۱۱۹۹", city: "گرگان", lead: 7, balance: 18_200_000, rating: 4.1 },
];

export default function SuppliersPage() {
  return (
    <ModulePage
      title="تأمین‌کنندگان"
      description="مدیریت تأمین‌کنندگان، عملکرد، پرداخت‌ها و شرایط"
      metrics={[
        { label: "تعداد تأمین‌کنندگان" , value: toFa(184) },
        { label: "بدهی جاری" , value: formatToman(3_240_500_000, { withUnit: false }) },
        { label: "میانگین زمان تحویل" , value: toFa(4) + " روز" },
        { label: "پرداخت‌های سررسید هفته" , value: toFa(11) },
      ]}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1" />
        <button className="btn-primary"><Plus className="w-4 h-4" /> تأمین‌کننده جدید</button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-auto">
          <table className="table-clean w-full min-w-[800px]">
            <thead>
              <tr>
                <th>تأمین‌کننده</th>
                <th>تلفن</th>
                <th>شهر</th>
                <th>لید تایم</th>
                <th>مانده حساب</th>
                <th>امتیاز</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td className="font-semibold flex items-center gap-2 text-slate-800"><Truck className="w-4 h-4 text-slate-400" /> {s.name}</td>
                  <td className="num-fa flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {s.phone}</td>
                  <td className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {s.city}</td>
                  <td className="num-fa">{toFa(s.lead)} روز</td>
                  <td className="num-fa font-bold">{formatToman(s.balance, { withUnit: false })}</td>
                  <td className="num-fa">
                    <span className="chip-amber">★ {toFa(s.rating)}</span>
                  </td>
                  <td className="!text-left"><button className="btn-ghost text-xs">پروفایل</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModulePage>
  );
}
