import { TopBar } from "@/components/admin/top-bar";
import { formatToman, toFa } from "@/lib/utils";
import { Gift, Trophy, Award, Users } from "lucide-react";

const tiers = [
  { name: "برنزی", from: 0, to: 999_999, rewards: "۱٪ کش‌بک", members: 24_180, color: "bg-amber-800" },
  { name: "نقره‌ای", from: 1_000_000, to: 4_999_999, rewards: "۲٪ کش‌بک + کوپن‌های ماهانه", members: 12_540, color: "bg-slate-500" },
  { name: "طلایی", from: 5_000_000, to: 19_999_999, rewards: "۴٪ کش‌بک + هدیه تولد + ارسال رایگان", members: 1_942, color: "bg-amber-500" },
  { name: "پلاتینیوم", from: 20_000_000, to: Number.POSITIVE_INFINITY, rewards: "۶٪ کش‌بک + خدمات ویژه", members: 312, color: "bg-slate-800" },
];

export default function LoyaltyPage() {
  return (
    <>
      <TopBar title="باشگاه وفاداری" description="امتیاز، سطوح، جوایز و کش‌بک" />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Stat icon={Users} label="اعضای فعال" value={toFa(38_974)} />
          <Stat icon={Gift} label="امتیاز فعال" value={toFa(23_400_000)} />
          <Stat icon={Trophy} label="جوایز صادرشده امروز" value={toFa(214)} />
          <Stat icon={Award} label="ارزش کش‌بک ماه جاری" value={formatToman(184_500_000, { withUnit: false })} />
        </div>

        <div className="card p-5">
          <div className="section-title mb-4">سطوح عضویت</div>
          <div className="grid gap-3 md:grid-cols-2">
            {tiers.map((t) => (
              <div key={t.name} className="p-4 rounded-xl border border-surface-border flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${t.color} text-white grid place-items-center font-bold`}>
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500 num-fa">
                    خرید سالانه: {formatToman(t.from, { withUnit: false })} تا {Number.isFinite(t.to) ? formatToman(t.to, { withUnit: false }) : "∞"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">مزایا: {t.rewards}</div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 num-fa">{toFa(t.members)}</div>
                  <div className="text-[11px] text-slate-500">عضو</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-4 h-4" /></div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-bold text-slate-900 num-fa">{value}</div>
      </div>
    </div>
  );
}
