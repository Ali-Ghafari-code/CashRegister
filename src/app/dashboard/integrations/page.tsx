import { ModulePage } from "@/components/admin/module-page";
import { toFa } from "@/lib/utils";
import { Plug, Cable, Store, Truck, MessageSquare, Landmark, Boxes, Scale, FileCheck2 } from "lucide-react";

type Integ = { name: string; type: string; icon: React.ComponentType<{ className?: string }>; status: "متصل" | "غیرفعال" | "در حال تست"; };

const integrations: Integ[] = [
  { name: "دیجی‌کالا مارکت‌پلیس", type: "فروش آنلاین", icon: Store, status: "متصل" },
  { name: "سامانه مؤدیان مالیاتی", type: "فاکتور الکترونیکی", icon: FileCheck2, status: "متصل" },
  { name: "پیامک کاوه‌نگار", type: "SMS Provider", icon: MessageSquare, status: "متصل" },
  { name: "بانک ملت — درگاه", type: "پرداخت آنلاین", icon: Landmark, status: "متصل" },
  { name: "تیپاکس", type: "لجستیک", icon: Truck, status: "در حال تست" },
  { name: "سپیدار حسابداری", type: "ERP خارجی", icon: Boxes, status: "متصل" },
  { name: "ترازو دیجیتال Bizerba", type: "سخت‌افزار", icon: Scale, status: "متصل" },
  { name: "شاپیفای", type: "فروشگاه بین‌المللی", icon: Store, status: "غیرفعال" },
];

export default function IntegrationsPage() {
  return (
    <ModulePage
      title="یکپارچه‌سازی‌ها"
      description="آداپتورهای درگاه، سخت‌افزار، فروش آنلاین، حسابداری و ارسال — همه بر پایه اینترفیس"
      metrics={[
        { label: "آداپتورهای فعال" , value: toFa(integrations.filter(i => i.status === "متصل").length) },
        { label: "در حال تست" , value: toFa(integrations.filter(i => i.status === "در حال تست").length) },
        { label: "وب‌هوک‌های ارسال‌شده امروز" , value: toFa(12_408) },
        { label: "خطاهای امروز" , value: toFa(9) },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {integrations.map((i) => (
          <div key={i.name} className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 grid place-items-center">
                <i.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900">{i.name}</div>
                <div className="text-xs text-slate-500">{i.type}</div>
              </div>
              {i.status === "متصل" && <span className="chip-green">متصل</span>}
              {i.status === "در حال تست" && <span className="chip-amber">تست</span>}
              {i.status === "غیرفعال" && <span className="chip-slate">غیرفعال</span>}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button className="btn-secondary flex-1"><Plug className="w-4 h-4" /> پیکربندی</button>
              <button className="btn-ghost !p-2"><Cable className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </ModulePage>
  );
}
