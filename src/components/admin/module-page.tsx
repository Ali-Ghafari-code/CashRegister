import { TopBar } from "@/components/admin/top-bar";
import { LucideIcon } from "lucide-react";

type Feature = { title: string; description: string; icon: LucideIcon };
type Metric = { label: string; value: string; tone?: "brand" | "emerald" | "amber" | "rose" };

export function ModulePage({
  title,
  description,
  metrics,
  features,
  children,
}: {
  title: string;
  description: string;
  metrics?: Metric[];
  features?: Feature[];
  children?: React.ReactNode;
}) {
  return (
    <>
      <TopBar title={title} description={description} />
      <div className="p-6 space-y-4">
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="card p-4">
                <div className="text-xs text-slate-500">{m.label}</div>
                <div className="mt-1 font-bold text-slate-900 num-fa">{m.value}</div>
              </div>
            ))}
          </div>
        )}

        {features && features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="card p-5 hover:-translate-y-0.5 transition">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center">
                  <f.icon className="w-4 h-4" />
                </div>
                <div className="mt-3 font-bold text-slate-900">{f.title}</div>
                <div className="mt-1 text-sm text-slate-600 leading-7">{f.description}</div>
              </div>
            ))}
          </div>
        )}

        {children}
      </div>
    </>
  );
}
