import { ModulePage } from "@/components/admin/module-page";
import { formatToman, toFa } from "@/lib/utils";
import { CreditCard, Banknote, Wallet, Gift, QrCode, Layers, Plug } from "lucide-react";
import { DonutChart } from "@/components/ui/donut-chart";
import { paymentMix } from "@/lib/mock-data";

const gateways = [
  { name: "سامان کیش (PC-POS)", status: "متصل", type: "کارت‌خوان بانکی", volume: 421_000_000, latency: 720 },
  { name: "درگاه شاپرک — به‌پرداخت ملت", status: "متصل", type: "درگاه آنلاین", volume: 128_500_000, latency: 340 },
  { name: "کیف پول آپ", status: "متصل", type: "کیف پول", volume: 58_400_000, latency: 210 },
  { name: "زرین‌کارت", status: "غیرفعال", type: "کارت هدیه", volume: 0, latency: 0 },
  { name: "BNPL — دیجی‌پی", status: "در حال تست", type: "خرید اقساطی", volume: 12_000_000, latency: 890 },
];

export default function PaymentsPage() {
  return (
    <ModulePage
      title="پرداخت‌ها و درگاه‌ها"
      description="آداپتورهای درگاه، کارت‌خوان، کیف پول و اقساط — بدون قفل تأمین‌کننده"
      metrics={[
        { label: "درگاه‌های فعال" , value: toFa(9) },
        { label: "تراکنش امروز" , value: toFa(3_218) },
        { label: "نرخ موفقیت" , value: "۹۹٫۴٪" },
        { label: "میانگین تأخیر" , value: toFa(520) + " ms" },
      ]}
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2 overflow-hidden">
          <div className="section-title mb-3 flex items-center gap-2"><Plug className="w-4 h-4" /> درگاه‌ها و آداپتورها</div>
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[600px]">
              <thead>
                <tr>
                  <th>درگاه</th>
                  <th>نوع</th>
                  <th>وضعیت</th>
                  <th>حجم امروز</th>
                  <th>تأخیر</th>
                </tr>
              </thead>
              <tbody>
                {gateways.map((g) => (
                  <tr key={g.name}>
                    <td className="font-semibold text-slate-800">{g.name}</td>
                    <td><span className="chip-slate">{g.type}</span></td>
                    <td>
                      {g.status === "متصل"
                        ? <span className="chip-green">متصل</span>
                        : g.status === "در حال تست"
                          ? <span className="chip-amber">در حال تست</span>
                          : <span className="chip-red">غیرفعال</span>}
                    </td>
                    <td className="num-fa font-bold">{formatToman(g.volume, { withUnit: false })}</td>
                    <td className="num-fa">{toFa(g.latency)} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card p-5">
          <div className="section-title mb-3 flex items-center gap-2"><Layers className="w-4 h-4" /> ترکیب پرداخت امروز</div>
          <DonutChart data={paymentMix} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Tile icon={Banknote} label="نقدی" />
        <Tile icon={CreditCard} label="کارت‌خوان" />
        <Tile icon={Wallet} label="کیف پول" />
        <Tile icon={Gift} label="کارت هدیه" />
        <Tile icon={QrCode} label="QR / موبایل" />
      </div>
    </ModulePage>
  );
}

function Tile({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="card p-4 flex flex-col items-center justify-center gap-2 text-center">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-4 h-4" /></div>
      <div className="text-sm font-semibold text-slate-800">{label}</div>
    </div>
  );
}
