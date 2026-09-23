import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string;
  hint?: string;
  delta?: string;
  deltaTone?: "up" | "down" | "flat";
  icon?: LucideIcon;
  accent?: "brand" | "emerald" | "amber" | "rose" | "violet";
};

const accents = {
  brand: "from-brand-500 to-brand-700 text-white",
  emerald: "from-emerald-500 to-emerald-700 text-white",
  amber: "from-amber-500 to-amber-600 text-white",
  rose: "from-rose-500 to-rose-700 text-white",
  violet: "from-violet-500 to-violet-700 text-white",
};

export function KpiCard({ title, value, hint, delta, deltaTone = "flat", icon: Icon, accent }: Props) {
  return (
    <div className="card p-5 relative overflow-hidden">
      {accent && (
        <div className={cn(
          "absolute -left-10 -top-10 w-32 h-32 rounded-full blur-2xl opacity-30 bg-gradient-to-br",
          accents[accent],
        )} />
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-500 text-sm">{title}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 num-fa">{value}</div>
          {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
        </div>
        {Icon && (
          <div className={cn("shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br", accent ? accents[accent] : "from-brand-500 to-brand-700 text-white")}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {delta && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className={cn(
            "chip",
            deltaTone === "up" && "chip-green",
            deltaTone === "down" && "chip-red",
            deltaTone === "flat" && "chip-slate",
          )}>{delta}</span>
          <span className="text-slate-500">نسبت به دیروز</span>
        </div>
      )}
    </div>
  );
}
