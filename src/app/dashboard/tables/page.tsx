"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/admin/top-bar";
import {
  Users, Clock, Sofa, Utensils, Wine, Coffee, X, ArrowLeftRight,
  Check, Sparkles, Ban, CalendarClock, Plus, Phone, RotateCcw,
  UserRound, ChefHat, Split,
} from "lucide-react";
import { cn, formatToman, toFa, jalaliDate } from "@/lib/utils";
import {
  useRestaurantStore, setTableStatus, transferTable, addReservation,
  TABLE_STATUS_LABEL, TABLE_STATUS_STYLE, elapsedMinutes, resetRestaurantStore,
  type Table, type TableStatus, type Hall,
} from "@/lib/restaurant-store";

const HALL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  H1: Utensils, H2: Wine, H3: Sofa, H4: Coffee,
};

const STATUS_ORDER: TableStatus[] = ["free", "occupied", "reserved", "billing", "cleaning"];

export default function TablesPage() {
  const state = useRestaurantStore();
  const [activeHall, setActiveHall] = useState<string>(state.halls[0]?.id ?? "H1");
  const [selected, setSelected] = useState<Table | null>(null);
  const [showReservation, setShowReservation] = useState(false);
  const [transferMode, setTransferMode] = useState<Table | null>(null);

  const tables = useMemo(
    () => state.tables.filter((t) => t.hallId === activeHall),
    [state.tables, activeHall],
  );

  const byStatus = useMemo(() => {
    const map: Record<TableStatus, number> = { free: 0, occupied: 0, reserved: 0, billing: 0, cleaning: 0 };
    for (const t of state.tables) map[t.status]++;
    return map;
  }, [state.tables]);

  const activeReservations = useMemo(
    () => state.reservations.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [state.reservations],
  );

  return (
    <>
      <TopBar title="مدیریت میز و سالن" description="نمای زنده اشغال میزها، رزرو و انتقال بین سالن‌ها" />
      <div className="p-6 space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {STATUS_ORDER.map((s) => (
            <div key={s} className={cn("card p-4 border-r-4", statusAccent(s))}>
              <div className="text-xs text-slate-500">{TABLE_STATUS_LABEL[s]}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900 num-fa">{toFa(byStatus[s])}</div>
            </div>
          ))}
        </div>

        {/* Hall tabs + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {state.halls.map((h) => {
            const active = activeHall === h.id;
            const count = state.tables.filter((t) => t.hallId === h.id).length;
            const Icon = HALL_ICONS[h.id] ?? Utensils;
            return (
              <button
                key={h.id}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm font-semibold border transition flex items-center gap-2",
                  active
                    ? "bg-brand-600 border-brand-600 text-white shadow-pop"
                    : "bg-white border-surface-border text-slate-700 hover:border-brand-300",
                )}
                onClick={() => setActiveHall(h.id)}
              >
                <Icon className="w-4 h-4" />
                {h.name}
                <span className={cn("chip !py-0 !px-1.5 !text-[10px] num-fa", active ? "bg-white/20 text-white border-transparent" : "chip-slate")}>{toFa(count)}</span>
              </button>
            );
          })}
          <div className="flex-1" />
          <button className="btn-secondary" onClick={() => setShowReservation(true)}>
            <CalendarClock className="w-4 h-4" /> رزرو جدید
          </button>
          <button className="btn-ghost text-xs" onClick={() => { if (confirm("همه چیدمان به حالت پیش‌فرض بازگردد؟")) resetRestaurantStore(); }}>
            <RotateCcw className="w-4 h-4" /> بازنشانی
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Floor plan */}
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="section-title flex items-center gap-2">
                  <FloorIcon hall={state.halls.find((h) => h.id === activeHall)} />
                  چیدمان {state.halls.find((h) => h.id === activeHall)?.name}
                </div>
                <div className="subtle mt-0.5">
                  روی هر میز کلیک کنید تا وضعیت را تغییر دهید یا سفارش را مدیریت کنید.
                </div>
              </div>
              {transferMode && (
                <div className="chip chip-amber flex items-center gap-2">
                  <ArrowLeftRight className="w-3.5 h-3.5" /> در حال انتقال از {transferMode.name} — یک میز آزاد را انتخاب کنید.
                  <button className="ms-2 text-rose-500" onClick={() => setTransferMode(null)}><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>

            <div className="relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-surface-border bg-gradient-to-br from-slate-50 to-white overflow-hidden">
              {tables.length === 0 && (
                <div className="absolute inset-0 grid place-items-center text-slate-400 text-sm">
                  این سالن هنوز میزی ندارد.
                </div>
              )}
              {tables.map((t) => {
                const busy = t.status !== "free";
                const isTransferTarget = transferMode && t.status === "free" && t.id !== transferMode.id;
                return (
                  <button
                    key={t.id}
                    className={cn(
                      "absolute rounded-xl border-2 shadow-sm p-2 text-right transition hover:scale-[1.03] hover:shadow-pop",
                      TABLE_STATUS_STYLE[t.status],
                      isTransferTarget && "ring-4 ring-amber-300 animate-pulse",
                    )}
                    style={{ right: `${t.x}%`, top: `${t.y}%`, width: t.seats >= 6 ? "22%" : "16%" }}
                    onClick={() => {
                      if (transferMode) {
                        if (t.status === "free" && t.id !== transferMode.id) {
                          transferTable(transferMode.id, t.id);
                          setTransferMode(null);
                          setSelected(state.tables.find((x) => x.id === t.id) ?? null);
                        }
                        return;
                      }
                      setSelected(t);
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold num-fa">{t.code}</span>
                      <span className="flex items-center gap-0.5 num-fa"><Users className="w-3 h-3" />{toFa(t.seats)}</span>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold truncate">{TABLE_STATUS_LABEL[t.status]}</div>
                    {busy && t.openedAt && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] num-fa opacity-80">
                        <Clock className="w-3 h-3" />
                        {toFa(elapsedMinutes(t.openedAt))} دقیقه
                      </div>
                    )}
                    {t.ticketIds.length > 0 && (
                      <div className="mt-1 text-[10px] flex items-center gap-1 num-fa">
                        <ChefHat className="w-3 h-3" /> {toFa(t.ticketIds.length)} تیکت
                      </div>
                    )}
                    {t.status === "reserved" && t.reservationName && (
                      <div className="mt-1 text-[10px] opacity-80 truncate">{t.reservationName}</div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {STATUS_ORDER.map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={cn("w-3 h-3 rounded-md border", TABLE_STATUS_STYLE[s])} />
                  {TABLE_STATUS_LABEL[s]}
                </span>
              ))}
            </div>
          </div>

          {/* Reservations panel */}
          <div className="card p-5">
            <div className="section-title flex items-center gap-2"><CalendarClock className="w-5 h-5 text-brand-600" /> رزروهای امروز و آینده</div>
            <div className="subtle mt-1 mb-4">جمعاً {toFa(state.reservations.length)} رزرو ثبت‌شده.</div>
            <ul className="space-y-2 max-h-[26rem] overflow-auto pr-1">
              {activeReservations.map((r) => {
                const tableName = state.tables.find((t) => t.id === r.tableId)?.name;
                return (
                  <li key={r.id} className="p-3 rounded-xl border border-surface-border hover:border-brand-300">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
                        <UserRound className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{r.name}</div>
                        <div className="text-[11px] text-slate-500 num-fa flex items-center gap-2">
                          <Phone className="w-3 h-3" /> {r.phone}
                          <span className="opacity-30">·</span>
                          <Users className="w-3 h-3" /> {toFa(r.guests)}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-800 num-fa">{r.time}</div>
                        <div className="text-[10px] text-slate-500 num-fa">{r.date}</div>
                      </div>
                    </div>
                    {(tableName || r.note) && (
                      <div className="mt-2 text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                        {tableName && <span className="chip-blue">{tableName}</span>}
                        {r.note && <span className="chip-slate">{r.note}</span>}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <button className="btn-secondary w-full mt-4" onClick={() => setShowReservation(true)}>
              <Plus className="w-4 h-4" /> رزرو جدید
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <TableActionsModal
          table={selected}
          onClose={() => setSelected(null)}
          onTransfer={(t) => { setSelected(null); setTransferMode(t); }}
        />
      )}
      {showReservation && <ReservationModal onClose={() => setShowReservation(false)} />}
    </>
  );
}

function statusAccent(s: TableStatus): string {
  return ({
    free: "border-emerald-500", occupied: "border-rose-500",
    reserved: "border-violet-500", billing: "border-amber-500",
    cleaning: "border-slate-400",
  } as const)[s];
}

function FloorIcon({ hall }: { hall?: Hall }) {
  const Icon = HALL_ICONS[hall?.id ?? "H1"] ?? Utensils;
  return <Icon className="w-5 h-5 text-brand-600" />;
}

function TableActionsModal({
  table, onClose, onTransfer,
}: { table: Table; onClose: () => void; onTransfer: (t: Table) => void }) {
  const state = useRestaurantStore();
  const [guests, setGuests] = useState(table.guests ?? Math.min(2, table.seats));
  const [waiter, setWaiter] = useState(table.waiter ?? "");
  const openTickets = state.tickets.filter((t) => table.ticketIds.includes(t.id));

  function set(status: TableStatus, extra?: Partial<Table>) {
    setTableStatus(table.id, status, extra);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 grid place-items-center p-4">
      <div className="card w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div>
            <div className="section-title flex items-center gap-2">
              <span className="text-2xl">{table.status === "free" ? "🪑" : "🍽️"}</span>
              {table.name}
              <span className={cn("chip text-[10px]", TABLE_STATUS_STYLE[table.status])}>{TABLE_STATUS_LABEL[table.status]}</span>
            </div>
            <div className="text-xs text-slate-500 num-fa mt-0.5">ظرفیت: {toFa(table.seats)} نفر · کد: {table.code}</div>
          </div>
          <button className="btn-ghost !p-2" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {table.status === "occupied" && table.openedAt && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
              <Clock className="w-4 h-4" />
              اشغال از <span className="num-fa font-bold">{toFa(elapsedMinutes(table.openedAt))}</span> دقیقه پیش
              {table.guests && <> · {toFa(table.guests)} مهمان</>}
              {table.waiter && <> · گارسون: {table.waiter}</>}
            </div>
          )}

          {openTickets.length > 0 && (
            <div className="card p-3">
              <div className="text-xs font-semibold text-slate-500 mb-2">تیکت‌های آشپزخانه</div>
              <ul className="space-y-1.5">
                {openTickets.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-sm">
                    <ChefHat className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold num-fa">{t.code}</span>
                    <span className="chip-blue">{t.status === "new" ? "جدید" : t.status === "preparing" ? "در حال پخت" : t.status === "ready" ? "آماده" : "تحویل"}</span>
                    <span className="ms-auto text-[11px] text-slate-500 num-fa">
                      {toFa(t.items.reduce((s, x) => s + x.qty, 0))} قلم
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/kitchen" className="btn-secondary w-full mt-3 text-xs">مشاهده در KDS</Link>
            </div>
          )}

          {table.status === "free" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">تعداد مهمان</label>
                <input inputMode="numeric" className="input num-fa"
                       value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} />
              </div>
              <div>
                <label className="label">گارسون</label>
                <input className="input" placeholder="نام گارسون"
                       value={waiter} onChange={(e) => setWaiter(e.target.value)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {table.status !== "occupied" && (
              <button className="btn-primary" onClick={() => set("occupied", { guests, waiter: waiter || undefined })}>
                <Utensils className="w-4 h-4" /> اشغال / باز کردن
              </button>
            )}
            {table.status === "occupied" && (
              <button className="btn-secondary" onClick={() => set("billing")}>
                <Check className="w-4 h-4" /> منتظر پرداخت
              </button>
            )}
            {table.status === "billing" && (
              <Link href="/pos" className="btn-primary col-span-2">
                <Sparkles className="w-4 h-4" /> برو به POS برای تسویه
              </Link>
            )}
            <button className="btn-secondary" onClick={() => set("reserved", { reservationName: "رزرو دستی" })}>
              <CalendarClock className="w-4 h-4" /> رزرو
            </button>
            {table.status !== "cleaning" && (
              <button className="btn-secondary" onClick={() => set("cleaning")}>
                <Sparkles className="w-4 h-4" /> نظافت
              </button>
            )}
            {table.status !== "free" && (
              <button className="btn-secondary col-span-2" onClick={() => onTransfer(table)}>
                <ArrowLeftRight className="w-4 h-4" /> انتقال به میز دیگر
              </button>
            )}
            {table.status !== "free" && (
              <button className="btn-secondary col-span-2 opacity-60" disabled>
                <Split className="w-4 h-4" /> تقسیم صورتحساب (به‌زودی)
              </button>
            )}
            <button className="btn-danger col-span-2" onClick={() => set("free")}>
              <Ban className="w-4 h-4" /> آزاد کردن میز
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservationModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState("20:00");
  const [note, setNote] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addReservation({
      name, phone, guests, time,
      date: jalaliDate(new Date()), note: note || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 grid place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="section-title flex items-center gap-2"><CalendarClock className="w-5 h-5 text-brand-600" /> رزرو جدید</div>
          <button type="button" className="btn-ghost !p-2" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="label">نام مشتری</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">شماره تماس</label>
              <input className="input num-fa" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">تعداد مهمان</label>
              <input inputMode="numeric" className="input num-fa" value={guests}
                     onChange={(e) => setGuests(Number(e.target.value) || 1)} />
            </div>
          </div>
          <div>
            <label className="label">ساعت (۲۴ ساعته)</label>
            <input className="input num-fa" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <label className="label">یادداشت (اختیاری)</label>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="مناسبت، درخواست ویژه..." />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-surface-border flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>انصراف</button>
          <button className="btn-primary">ثبت رزرو</button>
        </div>
      </form>
    </div>
  );
}
