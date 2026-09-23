import { toFa } from "@/lib/utils";

type Segment = { name: string; value: number; color: string };

export function DonutChart({ data, size = 180, stroke = 22 }: { data: Segment[]; size?: number; stroke?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#eef1f6" strokeWidth={stroke} fill="none" />
        {data.map((d) => {
          const len = (d.value / total) * circ;
          const dashArray = `${len} ${circ - len}`;
          const el = (
            <circle
              key={d.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={d.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-slate-700">{d.name}</span>
            <span className="text-slate-500 num-fa">— {toFa(d.value)}٪</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
