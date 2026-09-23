import { toFa } from "@/lib/utils";

type Props = {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
};

export function BarChart({ data, height = 220, color = "#3390ff" }: Props) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="w-full">
      <div
        className="grid gap-3 items-end"
        style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, height }}
      >
        {data.map((d) => {
          const h = Math.max(6, (d.value / max) * (height - 30));
          return (
            <div key={d.label} className="flex flex-col items-center justify-end gap-1.5">
              <div className="text-[10px] text-slate-500 num-fa">{toFa(Math.round(d.value))}</div>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 shadow-sm"
                style={{ height: h, background: `linear-gradient(180deg, ${color}55 0%, ${color} 100%)` }}
                title={d.label}
              />
            </div>
          );
        })}
      </div>
      <div className="grid gap-3 mt-2" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
        {data.map((d) => (
          <div key={d.label} className="text-center text-xs text-slate-500">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
