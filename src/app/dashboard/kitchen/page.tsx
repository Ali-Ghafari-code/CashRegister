"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/admin/top-bar";
import {
  ChefHat, Clock, Flame, Snowflake, Coffee, Pizza, IceCream, Store,
  CheckCircle2, XCircle, Timer, Bell, Sparkles, RefreshCcw, User, Filter,
} from "lucide-react";
import { cn, toFa } from "@/lib/utils";
import {
  useRestaurantStore, advanceTicketStatus, elapsedMinutes,
  STATION_LABEL, STATION_COLOR, TICKET_STATUS_LABEL, ORDER_TYPE_LABEL,
  type Ticket, type TicketStatus, type Station,
} from "@/lib/restaurant-store";

const STATION_ICONS: Record<Station, React.ComponentType<{ className?: string }>> = {
  grill: Flame, cold: Snowflake, cafe: Coffee, pizza: Pizza, dessert: IceCream, counter: Store,
};

const COLUMNS: TicketStatus[] = ["new", "preparing", "ready", "served"];

export default function KitchenPage() {
  const state = useRestaurantStore();
  const [stationFilter, setStationFilter] = useState<Station | "all">("all");
  const [soundOn, setSoundOn] = useState(false);
  const [tick, setTick] = useState(0);

  // Repaint timers every 30s
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const list = state.tickets.filter((t) => t.status !== "cancelled");
    if (stationFilter === "all") return list;
    return list
      .map((t) => ({
        ...t,
        items: t.items.filter((it) => it.station === stationFilter),
      }))
      .filter((t) => t.items.length > 0);
  }, [state.tickets, stationFilter]);

  const columns = useMemo(() => {
    const map: Record<TicketStatus, Ticket[]> = { new: [], preparing: [], ready: [], served: [], cancelled: [] };
    for (const t of filtered) map[t.status].push(t);
    for (const c of COLUMNS) map[c].sort((a, b) => a.createdAt - b.createdAt);
    return map;
  }, [filtered]);

  const stationStats = useMemo(() => {
    const stats: Record<Station, { active: number; oldest: number }> = {
      grill: { active: 0, oldest: 0 }, cold: { active: 0, oldest: 0 },
      cafe: { active: 0, oldest: 0 }, pizza: { active: 0, oldest: 0 },
      dessert: { active: 0, oldest: 0 }, counter: { active: 0, oldest: 0 },
    };
    for (const t of state.tickets) {
      if (t.status === "served" || t.status === "cancelled") continue;
      for (const it of t.items) {
        if (it.status === "served" || it.status === "cancelled") continue;
        stats[it.station].active += it.qty;
        stats[it.station].oldest = Math.max(stats[it.station].oldest, elapsedMinutes(t.createdAt));
      }
    }
    return stats;
  }, [state.tickets, tick]);

  return (
    <>
      <TopBar
        title="نمایشگر آشپزخانه (KDS)"
        description="تیکت‌های زنده — تغییر وضعیت با یک کلیک؛ همگام با میزها و POS"
      />
      <div className="p-6 space-y-4">
        {/* Station stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {(Object.keys(STATION_LABEL) as Station[]).map((s) => {
            const Icon = STATION_ICONS[s];
            const active = stationStats[s].active;
            const oldest = stationStats[s].oldest;
            return (
              <button
                key={s}
                onClick={() => setStationFilter(stationFilter === s ? "all" : s)}
                className={cn(
                  "card p-3 text-right transition hover:-translate-y-0.5",
                  stationFilter === s && "ring-2 ring-brand-500",
                )}
                style={{ borderLeft: `4px solid ${STATION_COLOR[s]}` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg grid place-items-center text-white" style={{ background: STATION_COLOR[s] }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">{STATION_LABEL[s]}</div>
                    <div className="font-bold text-slate-900 num-fa">{toFa(active)}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 num-fa">
                  <Clock className="w-3 h-3" /> قدیمی‌ترین: {toFa(oldest)} دقیقه
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="card p-3 flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">فیلتر:</span>
          <button
            onClick={() => setStationFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold border transition",
              stationFilter === "all"
                ? "bg-brand-600 border-brand-600 text-white"
                : "bg-white border-surface-border text-slate-700",
            )}
          >
            همه ایستگاه‌ها
          </button>
          {(Object.keys(STATION_LABEL) as Station[]).map((s) => (
            <button
              key={s}
              onClick={() => setStationFilter(stationFilter === s ? "all" : s)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold border transition flex items-center gap-1",
                stationFilter === s
                  ? "bg-brand-600 border-brand-600 text-white"
                  : "bg-white border-surface-border text-slate-700",
              )}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: STATION_COLOR[s] }} />
              {STATION_LABEL[s]}
            </button>
          ))}
          <div className="flex-1" />
          <button
            className={cn("btn-secondary text-xs", soundOn && "bg-brand-600 text-white border-brand-600")}
            onClick={() => setSoundOn((v) => !v)}
          >
            <Bell className="w-4 h-4" /> اعلان صوتی {soundOn ? "روشن" : "خاموش"}
          </button>
          <button className="btn-ghost text-xs" onClick={() => setTick((n) => n + 1)}>
            <RefreshCcw className="w-4 h-4" /> بازخوانی
          </button>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col} className="flex flex-col min-h-[400px]">
              <div className={cn(
                "px-3 py-2 rounded-t-xl2 flex items-center justify-between font-bold text-sm",
                col === "new" && "bg-brand-100 text-brand-800",
                col === "preparing" && "bg-amber-100 text-amber-800",
                col === "ready" && "bg-emerald-100 text-emerald-800",
                col === "served" && "bg-slate-100 text-slate-700",
              )}>
                <span>{TICKET_STATUS_LABEL[col]}</span>
                <span className="chip !py-0 !px-1.5 !text-[10px] bg-white/70 border-transparent num-fa">
                  {toFa(columns[col].length)}
                </span>
              </div>
              <div className={cn(
                "flex-1 p-2 rounded-b-xl2 border-x border-b space-y-2 overflow-auto max-h-[70vh]",
                col === "new" && "border-brand-200 bg-brand-50/40",
                col === "preparing" && "border-amber-200 bg-amber-50/40",
                col === "ready" && "border-emerald-200 bg-emerald-50/40",
                col === "served" && "border-slate-200 bg-slate-50/40",
              )}>
                {columns[col].length === 0 && (
                  <div className="text-center text-slate-400 text-xs py-8">بدون تیکت</div>
                )}
                {columns[col].map((t) => (
                  <TicketCard key={t.id} ticket={t} state={state} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TicketCard({ ticket, state }: { ticket: Ticket; state: ReturnType<typeof useRestaurantStore> }) {
  const table = ticket.tableId ? state.tables.find((x) => x.id === ticket.tableId) : null;
  const minutes = elapsedMinutes(ticket.createdAt);
  const urgent = minutes >= 15 && (ticket.status === "new" || ticket.status === "preparing");
  const rush = ticket.priority === "rush" || ticket.priority === "vip";

  return (
    <div
      className={cn(
        "rounded-xl border bg-white shadow-sm hover:shadow-pop transition",
        urgent ? "border-rose-400" : rush ? "border-violet-400" : "border-surface-border",
      )}
    >
      <div className="px-3 py-2 flex items-center justify-between border-b border-surface-border/70">
        <div className="flex items-center gap-2 min-w-0">
          <ChefHat className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-800 num-fa">{ticket.code}</span>
          {ticket.priority === "vip" && <span className="chip !py-0 !px-1.5 !text-[10px] bg-violet-100 text-violet-700 border-violet-300">VIP</span>}
          {ticket.priority === "rush" && <span className="chip !py-0 !px-1.5 !text-[10px] bg-rose-100 text-rose-700 border-rose-300">فوری</span>}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs num-fa",
          urgent ? "text-rose-600 font-bold" : "text-slate-500",
        )}>
          <Timer className="w-3.5 h-3.5" /> {toFa(minutes)} دقیقه
        </div>
      </div>

      <div className="px-3 py-2 text-[11px] flex items-center gap-2 flex-wrap border-b border-surface-border/50">
        <span className="chip-slate">{ORDER_TYPE_LABEL[ticket.type]}</span>
        {table && <span className="chip-blue">{table.name}</span>}
        {ticket.customerName && (
          <span className="flex items-center gap-1 text-slate-500">
            <User className="w-3 h-3" /> {ticket.customerName}
          </span>
        )}
        {ticket.waiter && <span className="text-slate-500">گارسون: {ticket.waiter}</span>}
      </div>

      <ul className="p-3 space-y-1.5">
        {ticket.items.map((it) => {
          const stationColor = STATION_COLOR[it.station];
          return (
            <li key={it.id} className="text-sm">
              <div className="flex items-start gap-2">
                <span
                  className="mt-1 w-2 h-2 rounded-full shrink-0"
                  style={{ background: stationColor }}
                  title={STATION_LABEL[it.station]}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 truncate">{it.name}</span>
                    <span className="num-fa font-bold text-brand-700 shrink-0">× {toFa(it.qty)}</span>
                  </div>
                  {it.modifiers.length > 0 && (
                    <div className="text-[11px] text-slate-500 truncate">{it.modifiers.join(" · ")}</div>
                  )}
                  {it.note && <div className="text-[11px] text-amber-700">یادداشت: {it.note}</div>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-2 pb-2 flex items-center gap-1.5">
        {ticket.status === "new" && (
          <button className="btn-secondary flex-1 text-xs !py-1.5" onClick={() => advanceTicketStatus(ticket.id, "preparing")}>
            <Flame className="w-3.5 h-3.5" /> شروع پخت
          </button>
        )}
        {ticket.status === "preparing" && (
          <button className="btn-primary flex-1 text-xs !py-1.5" onClick={() => advanceTicketStatus(ticket.id, "ready")}>
            <CheckCircle2 className="w-3.5 h-3.5" /> آماده شد
          </button>
        )}
        {ticket.status === "ready" && (
          <button className="btn-primary flex-1 text-xs !py-1.5" onClick={() => advanceTicketStatus(ticket.id, "served")}>
            <Sparkles className="w-3.5 h-3.5" /> تحویل داده شد
          </button>
        )}
        {ticket.status === "served" && (
          <span className="chip-green text-xs">تحویل شده</span>
        )}
        {(ticket.status === "new" || ticket.status === "preparing") && (
          <button
            className="btn-ghost text-xs !py-1.5 text-rose-600"
            onClick={() => advanceTicketStatus(ticket.id, "cancelled")}
            title="لغو تیکت"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
