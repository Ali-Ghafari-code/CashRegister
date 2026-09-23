"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/admin/top-bar";
import {
  UtensilsCrossed, Coffee, Flame, Snowflake, Pizza, IceCream, Store,
  X, ChefHat, Send, CheckCircle2, Search, ToggleLeft, ToggleRight, Plus, Minus,
} from "lucide-react";
import { cn, formatToman, toFa } from "@/lib/utils";
import {
  useRestaurantStore, toggleMenuItemAvailability, sendTicketToKitchen,
  STATION_LABEL, STATION_COLOR,
  type MenuItem, type Station,
} from "@/lib/restaurant-store";

const STATION_ICONS: Record<Station, React.ComponentType<{ className?: string }>> = {
  grill: Flame, cold: Snowflake, cafe: Coffee, pizza: Pizza, dessert: IceCream, counter: Store,
};

export default function MenuPage() {
  const state = useRestaurantStore();
  const [activeCat, setActiveCat] = useState<string>(state.menu.categories[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [customizing, setCustomizing] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = state.menu.items.filter((i) => i.categoryId === activeCat);
    if (q.trim()) {
      const like = q.trim();
      items = state.menu.items.filter((i) => i.name.includes(like));
    }
    return items;
  }, [state.menu.items, activeCat, q]);

  const stats = useMemo(() => {
    const total = state.menu.items.length;
    const available = state.menu.items.filter((i) => i.isAvailable).length;
    const soldOut = total - available;
    const modifiers = state.menu.items.reduce((s, i) => s + i.modifiers.length, 0);
    return { total, available, soldOut, modifiers };
  }, [state.menu.items]);

  return (
    <>
      <TopBar title="منوی رستوران و کافه" description="آیتم‌ها، سایزها، افزودنی‌ها و روتینگ به ایستگاه آشپزخانه" />
      <div className="p-6 space-y-4">
        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="کل آیتم‌ها" value={toFa(stats.total)} />
          <Stat label="در دسترس" value={toFa(stats.available)} />
          <Stat label="ناموجود" value={toFa(stats.soldOut)} />
          <Stat label="گروه‌های افزودنی" value={toFa(stats.modifiers)} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Categories */}
          <div className="card p-4 xl:col-span-1">
            <div className="section-title text-sm mb-3 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-brand-600" /> دسته‌بندی‌ها
            </div>
            <ul className="space-y-1">
              {state.menu.categories.map((c) => {
                const count = state.menu.items.filter((i) => i.categoryId === c.id).length;
                const active = activeCat === c.id;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => { setActiveCat(c.id); setQ(""); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-right transition",
                        active
                          ? "bg-brand-600 text-white shadow-pop"
                          : "hover:bg-surface-muted text-slate-700",
                      )}
                    >
                      <span className="text-xl">{c.icon}</span>
                      <span className="flex-1 font-semibold">{c.name}</span>
                      <span className={cn(
                        "chip !py-0 !px-1.5 !text-[10px] num-fa",
                        active ? "bg-white/25 text-white border-transparent" : "chip-slate",
                      )}>{toFa(count)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Items grid */}
          <div className="xl:col-span-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 inset-y-0 my-auto" />
                <input
                  className="input !pr-9"
                  placeholder="جست‌وجو در کل منو..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>ایستگاه‌ها:</span>
                {(Object.keys(STATION_LABEL) as Station[]).map((s) => (
                  <span key={s} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: STATION_COLOR[s] }} />
                    {STATION_LABEL[s]}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((item) => {
                const StationIcon = STATION_ICONS[item.station];
                return (
                  <div key={item.id} className={cn(
                    "card p-4 relative transition",
                    !item.isAvailable && "opacity-60",
                  )} style={{ borderTop: `4px solid ${STATION_COLOR[item.station]}` }}>
                    <div className="flex items-start justify-between">
                      <div className="text-3xl">{item.emoji ?? "🍽️"}</div>
                      <button
                        onClick={() => toggleMenuItemAvailability(item.id)}
                        className={cn("chip !text-[10px] flex items-center gap-1",
                          item.isAvailable ? "chip-green" : "chip-red")}
                        title="تغییر وضعیت در دسترس بودن"
                      >
                        {item.isAvailable
                          ? <><ToggleRight className="w-3.5 h-3.5" /> در دسترس</>
                          : <><ToggleLeft className="w-3.5 h-3.5" /> ناموجود</>}
                      </button>
                    </div>
                    <div className="mt-2 font-bold text-slate-900">{item.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1" style={{ color: STATION_COLOR[item.station] }}>
                        <StationIcon className="w-3.5 h-3.5" /> {STATION_LABEL[item.station]}
                      </span>
                      <span className="num-fa">⏱ {toFa(item.prepMinutes)} دقیقه</span>
                    </div>
                    <div className="mt-2 text-lg font-black text-brand-700 num-fa">
                      {formatToman(item.price, { withUnit: false })}
                      <span className="text-[10px] text-slate-400 font-normal ms-1">تومان</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap text-[10px]">
                      {item.sizes && item.sizes.length > 0 && (
                        <span className="chip-slate">{toFa(item.sizes.length)} سایز</span>
                      )}
                      {item.modifiers.length > 0 && (
                        <span className="chip-blue">{toFa(item.modifiers.length)} گروه افزودنی</span>
                      )}
                      {item.isVegan && <span className="chip-green">گیاهی</span>}
                      {item.isSpicy && <span className="chip-red">تند</span>}
                    </div>
                    <button
                      className="btn-secondary w-full mt-3 text-xs"
                      onClick={() => setCustomizing(item)}
                    >
                      <ChefHat className="w-3.5 h-3.5" /> شخصی‌سازی و ارسال به آشپزخانه
                    </button>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-slate-400 text-sm">
                  آیتمی یافت نشد.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {customizing && (
        <CustomizeModal
          item={customizing}
          onClose={() => setCustomizing(null)}
          onSent={(code) => { setCustomizing(null); setToast(`تیکت ${code} به آشپزخانه ارسال شد.`); }}
        />
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white rounded-xl shadow-pop px-5 py-3 flex items-center gap-3 text-sm"
             onAnimationEnd={() => setTimeout(() => setToast(null), 3000)}>
          <CheckCircle2 className="w-5 h-5" /> {toast}
          <button className="ms-2 opacity-80 hover:opacity-100" onClick={() => setToast(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-bold text-slate-900 num-fa text-lg">{value}</div>
    </div>
  );
}

function CustomizeModal({
  item, onClose, onSent,
}: {
  item: MenuItem;
  onClose: () => void;
  onSent: (code: string) => void;
}) {
  const state = useRestaurantStore();
  const occupiedTables = state.tables.filter((t) => t.status === "occupied");
  const [tableId, setTableId] = useState<string | "">(occupiedTables[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<number>(0);
  const [selectedMods, setSelectedMods] = useState<Record<string, string[]>>(() => {
    const out: Record<string, string[]> = {};
    for (const g of item.modifiers) {
      const def = g.options.filter((o) => o.isDefault).map((o) => o.id);
      if (def.length > 0) out[g.id] = def;
    }
    return out;
  });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  function toggleMod(groupId: string, optionId: string, max: number) {
    setSelectedMods((prev) => {
      const cur = prev[groupId] ?? [];
      if (cur.includes(optionId)) {
        return { ...prev, [groupId]: cur.filter((x) => x !== optionId) };
      }
      if (max === 1) return { ...prev, [groupId]: [optionId] };
      if (cur.length >= max) return prev;
      return { ...prev, [groupId]: [...cur, optionId] };
    });
  }

  const priceExtra = item.modifiers.reduce((sum, g) => {
    const chosen = selectedMods[g.id] ?? [];
    return sum + g.options.filter((o) => chosen.includes(o.id)).reduce((a, o) => a + o.price, 0);
  }, 0);
  const sizeDelta = item.sizes?.[size]?.priceDelta ?? 0;
  const unitPrice = item.price + sizeDelta + priceExtra;
  const total = unitPrice * qty;

  const modifierLabels: string[] = [];
  if (item.sizes && item.sizes[size]) modifierLabels.push(item.sizes[size].name);
  for (const g of item.modifiers) {
    const chosen = selectedMods[g.id] ?? [];
    for (const optId of chosen) {
      const opt = g.options.find((o) => o.id === optId);
      if (opt) modifierLabels.push(opt.name);
    }
  }

  const requiredMet = item.modifiers.every((g) => (selectedMods[g.id] ?? []).length >= g.min);

  async function send() {
    if (!requiredMet) return;
    setBusy(true);
    const ticket = sendTicketToKitchen({
      type: tableId ? "dine_in" : "takeaway",
      tableId: tableId || undefined,
      waiter: tableId ? (state.tables.find((t) => t.id === tableId)?.waiter ?? "صندوقدار") : undefined,
      customerName: !tableId ? "مهمان بیرون‌بر" : undefined,
      items: [{
        menuId: item.id,
        name: item.name,
        qty,
        station: item.station,
        modifiers: modifierLabels,
        note: note || undefined,
      }],
    });
    setBusy(false);
    onSent(ticket.code);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 grid place-items-center p-4">
      <div className="card w-full max-w-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{item.emoji ?? "🍽️"}</div>
            <div>
              <div className="section-title">{item.name}</div>
              <div className="text-xs text-slate-500">{STATION_LABEL[item.station]} · آماده‌سازی {toFa(item.prepMinutes)} دقیقه</div>
            </div>
          </div>
          <button className="btn-ghost !p-2" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
          {item.sizes && item.sizes.length > 0 && (
            <div>
              <div className="label">سایز</div>
              <div className="grid grid-cols-3 gap-2">
                {item.sizes.map((s, ix) => (
                  <button
                    key={s.name}
                    onClick={() => setSize(ix)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-sm font-semibold text-center transition",
                      size === ix ? "border-brand-500 bg-brand-50 text-brand-800" : "border-surface-border hover:border-brand-300",
                    )}
                  >
                    <div>{s.name}</div>
                    <div className="text-[11px] text-slate-500 num-fa mt-1">
                      {s.priceDelta === 0 ? "بدون افزایش" : `+ ${formatToman(s.priceDelta, { withUnit: false })}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.modifiers.map((g) => {
            const chosen = selectedMods[g.id] ?? [];
            const isRadio = g.max === 1;
            return (
              <div key={g.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="label !mb-0">{g.name}</span>
                  <span className="text-[10px] text-slate-500 num-fa">
                    {g.min > 0 ? `الزامی — حداقل ${toFa(g.min)}` : "اختیاری"}
                    {g.max > 1 && ` · حداکثر ${toFa(g.max)}`}
                  </span>
                  {g.min > 0 && chosen.length < g.min && (
                    <span className="chip-red !py-0 !px-1.5 !text-[10px]">نیاز به انتخاب</span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                  {g.options.map((o) => {
                    const active = chosen.includes(o.id);
                    return (
                      <button
                        key={o.id}
                        onClick={() => toggleMod(g.id, o.id, g.max)}
                        className={cn(
                          "px-2.5 py-2 rounded-lg border text-xs font-semibold text-right transition",
                          active
                            ? isRadio ? "bg-brand-600 border-brand-600 text-white" : "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white border-surface-border hover:border-brand-300",
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate">{o.name}</span>
                          {active && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        </div>
                        {o.price > 0 && (
                          <div className={cn("text-[10px] mt-0.5 num-fa", active ? "text-white/80" : "text-slate-500")}>
                            + {formatToman(o.price, { withUnit: false })}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div>
            <div className="label">یادداشت ویژه (اختیاری)</div>
            <input
              className="input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً: بدون پیاز، سس اضافه بیاورید..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="label">میز مقصد</div>
              <select className="input" value={tableId} onChange={(e) => setTableId(e.target.value)}>
                <option value="">بیرون‌بر</option>
                {occupiedTables.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} — {state.halls.find((h) => h.id === t.hallId)?.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="label">تعداد</div>
              <div className="flex items-center gap-2">
                <button type="button" className="btn-secondary !px-3" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="w-4 h-4" /></button>
                <div className="flex-1 text-center text-2xl font-black num-fa">{toFa(qty)}</div>
                <button type="button" className="btn-secondary !px-3" onClick={() => setQty((q) => q + 1)}><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-surface-border flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-slate-500">جمع</div>
            <div className="text-2xl font-black num-fa">{formatToman(total)}</div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={onClose}>انصراف</button>
            <button className="btn-primary" disabled={!requiredMet || busy} onClick={send}>
              <Send className="w-4 h-4" /> {busy ? "..." : "ارسال به آشپزخانه"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
