/**
 * Client-side shared store for restaurant/cafe modules.
 *
 * Uses localStorage + a window-level pub/sub so a change made on one page
 * (occupying a table, sending an order to kitchen, marking a ticket ready)
 * is reflected immediately on every other page that subscribes.
 *
 * This is intentionally client-only for now — the restaurant domain isn't
 * yet in the FastAPI backend. The store shape mirrors what a future
 * SQL model would look like (halls, tables, tickets, ticket_items).
 */

import { useEffect, useSyncExternalStore } from "react";

// -----------------------------------------------------------------------------
// Domain types
// -----------------------------------------------------------------------------

export type Hall = {
  id: string;
  name: string;
  color: string;
};

export type TableStatus =
  | "free"
  | "occupied"
  | "reserved"
  | "billing"
  | "cleaning";

export type Table = {
  id: string;
  hallId: string;
  code: string;      // e.g. "T-12"
  name: string;      // e.g. "میز ۱۲"
  seats: number;
  x: number;         // 0..100 (grid slot)
  y: number;         // 0..100
  status: TableStatus;
  openedAt?: number; // epoch ms when occupied
  guests?: number;
  waiter?: string;
  ticketIds: string[];
  reservationName?: string;
  reservationTime?: string;
};

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  guests: number;
  time: string;   // "20:30"
  date: string;   // "1403/12/03"
  tableId?: string;
  note?: string;
};

export type Station = "grill" | "cold" | "cafe" | "pizza" | "dessert" | "counter";

export const STATION_LABEL: Record<Station, string> = {
  grill: "گریل",
  cold: "سالاد سرد",
  cafe: "کافه / بار",
  pizza: "پیتزا",
  dessert: "دسر",
  counter: "پیشخوان",
};

export const STATION_COLOR: Record<Station, string> = {
  grill: "#ef4444",
  cold: "#10b981",
  cafe: "#f59e0b",
  pizza: "#f97316",
  dessert: "#a855f7",
  counter: "#64748b",
};

export type OrderType =
  | "dine_in"
  | "takeaway"
  | "delivery"
  | "qr_table"
  | "kiosk"
  | "phone";

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  dine_in: "میز",
  takeaway: "بیرون‌بر",
  delivery: "پیک",
  qr_table: "سفارش QR",
  kiosk: "کیوسک",
  phone: "تلفنی",
};

export type TicketStatus =
  | "new"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  new: "جدید",
  preparing: "در حال آماده‌سازی",
  ready: "آماده",
  served: "تحویل داده شد",
  cancelled: "لغو شده",
};

export type TicketItem = {
  id: string;
  menuId: string;
  name: string;
  qty: number;
  station: Station;
  modifiers: string[];  // human-readable, e.g. ["سایز بزرگ", "شیر بادام"]
  note?: string;
  status: TicketStatus; // per-item status
};

export type Ticket = {
  id: string;
  code: string;         // e.g. "K-24"
  type: OrderType;
  tableId?: string;
  waiter?: string;
  customerName?: string;
  items: TicketItem[];
  status: TicketStatus;
  createdAt: number;    // epoch ms
  readyAt?: number;
  servedAt?: number;
  note?: string;
  priority?: "normal" | "rush" | "vip";
};

export type MenuModifier = {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
};

export type MenuModifierGroup = {
  id: string;
  name: string;
  min: number;   // required minimum selections
  max: number;   // max selections
  options: MenuModifier[];
};

export type MenuItem = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  cost?: number;
  station: Station;
  emoji?: string;
  description?: string;
  isAvailable: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  allergens?: string[];
  sizes?: { name: string; priceDelta: number }[];
  modifiers: MenuModifierGroup[];
  timeSlots?: ("breakfast" | "lunch" | "dinner" | "happy_hour")[];
  prepMinutes: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

// -----------------------------------------------------------------------------
// State shape + defaults
// -----------------------------------------------------------------------------

export type RestaurantState = {
  halls: Hall[];
  tables: Table[];
  reservations: Reservation[];
  tickets: Ticket[];
  ticketCounter: number;
  menu: {
    categories: MenuCategory[];
    items: MenuItem[];
  };
};

function seed(): RestaurantState {
  const halls: Hall[] = [
    { id: "H1", name: "سالن اصلی", color: "#3390ff" },
    { id: "H2", name: "سالن VIP", color: "#a855f7" },
    { id: "H3", name: "تراس روباز", color: "#10b981" },
    { id: "H4", name: "پیشخوان / بیرون‌بر", color: "#f59e0b" },
  ];

  const tables: Table[] = [];
  // Main hall — 12 tables in a grid
  for (let i = 0; i < 12; i++) {
    tables.push({
      id: `T${i + 1}`,
      hallId: "H1",
      code: `T-${String(i + 1).padStart(2, "0")}`,
      name: `میز ${i + 1}`,
      seats: [2, 4, 4, 6][i % 4],
      x: (i % 4) * 25 + 6,
      y: Math.floor(i / 4) * 30 + 8,
      status: (["free", "occupied", "free", "reserved", "free", "free"] as TableStatus[])[i % 6],
      ticketIds: [],
    });
  }
  // VIP hall — 4 booths
  for (let i = 0; i < 4; i++) {
    tables.push({
      id: `V${i + 1}`,
      hallId: "H2",
      code: `V-${i + 1}`,
      name: `بوکس VIP ${i + 1}`,
      seats: 8,
      x: (i % 2) * 45 + 12,
      y: Math.floor(i / 2) * 40 + 15,
      status: i === 0 ? "occupied" : "free",
      ticketIds: [],
    });
  }
  // Terrace — 6 tables
  for (let i = 0; i < 6; i++) {
    tables.push({
      id: `TR${i + 1}`,
      hallId: "H3",
      code: `TR-${i + 1}`,
      name: `تراس ${i + 1}`,
      seats: [2, 2, 4, 4, 6, 6][i],
      x: (i % 3) * 30 + 8,
      y: Math.floor(i / 3) * 35 + 15,
      status: i === 2 ? "billing" : i === 5 ? "cleaning" : "free",
      ticketIds: [],
    });
  }
  // Counter — 3 stools
  for (let i = 0; i < 3; i++) {
    tables.push({
      id: `C${i + 1}`,
      hallId: "H4",
      code: `C-${i + 1}`,
      name: `صندلی پیشخوان ${i + 1}`,
      seats: 1,
      x: i * 30 + 10,
      y: 40,
      status: "free",
      ticketIds: [],
    });
  }

  const reservations: Reservation[] = [
    { id: "R1", name: "خانواده کریمی", phone: "09121234567", guests: 6, time: "20:30", date: "1403/12/03", tableId: "T4", note: "جشن تولد" },
    { id: "R2", name: "آقای محمدی", phone: "09354443322", guests: 2, time: "19:00", date: "1403/12/03" },
    { id: "R3", name: "شرکت پارس‌گستر", phone: "02188887766", guests: 12, time: "13:00", date: "1403/12/04", tableId: "V2", note: "جلسه ناهار کاری" },
  ];

  const categories: MenuCategory[] = [
    { id: "MC1", name: "کافه گرم", icon: "☕", color: "#a16207" },
    { id: "MC2", name: "کافه سرد", icon: "🧊", color: "#0ea5e9" },
    { id: "MC3", name: "غذای اصلی", icon: "🍽️", color: "#dc2626" },
    { id: "MC4", name: "پیتزا و پاستا", icon: "🍕", color: "#f97316" },
    { id: "MC5", name: "برگر و فست‌فود", icon: "🍔", color: "#ea580c" },
    { id: "MC6", name: "سالاد", icon: "🥗", color: "#16a34a" },
    { id: "MC7", name: "دسر", icon: "🍰", color: "#a855f7" },
    { id: "MC8", name: "نوشیدنی", icon: "🥤", color: "#0369a1" },
  ];

  const drinkSizes = [
    { name: "کوچک", priceDelta: 0 },
    { name: "متوسط", priceDelta: 20000 },
    { name: "بزرگ", priceDelta: 40000 },
  ];

  const drinkMods: MenuModifierGroup[] = [
    {
      id: "MG-MILK", name: "نوع شیر", min: 1, max: 1, options: [
        { id: "m-reg", name: "شیر پرچرب", price: 0, isDefault: true },
        { id: "m-low", name: "شیر کم‌چرب", price: 0 },
        { id: "m-al", name: "شیر بادام", price: 20000 },
        { id: "m-oat", name: "شیر جو (Oat)", price: 22000 },
        { id: "m-soy", name: "شیر سویا", price: 18000 },
      ],
    },
    {
      id: "MG-SYRUP", name: "شربت طعم‌دهنده", min: 0, max: 3, options: [
        { id: "s-van", name: "وانیل", price: 8000 },
        { id: "s-car", name: "کارامل", price: 8000 },
        { id: "s-haz", name: "فندق", price: 8000 },
        { id: "s-chc", name: "شکلات", price: 10000 },
      ],
    },
    {
      id: "MG-SHOT", name: "شات اضافه اسپرسو", min: 0, max: 3, options: [
        { id: "sh-1", name: "۱ شات", price: 15000 },
        { id: "sh-2", name: "۲ شات", price: 28000 },
        { id: "sh-3", name: "۳ شات", price: 40000 },
      ],
    },
    {
      id: "MG-SUGAR", name: "میزان شیرینی", min: 1, max: 1, options: [
        { id: "sg-0", name: "بدون شکر", price: 0 },
        { id: "sg-1", name: "کم", price: 0 },
        { id: "sg-2", name: "متوسط", price: 0, isDefault: true },
        { id: "sg-3", name: "زیاد", price: 0 },
      ],
    },
    {
      id: "MG-ICE", name: "میزان یخ", min: 1, max: 1, options: [
        { id: "ic-0", name: "بدون یخ", price: 0 },
        { id: "ic-1", name: "کم", price: 0 },
        { id: "ic-2", name: "معمولی", price: 0, isDefault: true },
        { id: "ic-3", name: "زیاد", price: 0 },
      ],
    },
    {
      id: "MG-TEMP", name: "دمای نوشیدنی", min: 1, max: 1, options: [
        { id: "t-hot", name: "داغ", price: 0, isDefault: true },
        { id: "t-warm", name: "ولرم", price: 0 },
      ],
    },
  ];

  const foodMods: MenuModifierGroup[] = [
    {
      id: "MG-COOK", name: "درجه پختگی", min: 1, max: 1, options: [
        { id: "c-rare", name: "خام (Rare)", price: 0 },
        { id: "c-med", name: "متوسط", price: 0, isDefault: true },
        { id: "c-well", name: "کاملاً پخته", price: 0 },
      ],
    },
    {
      id: "MG-EXT", name: "اضافات", min: 0, max: 5, options: [
        { id: "e-ch", name: "پنیر اضافه", price: 25000 },
        { id: "e-mush", name: "قارچ", price: 20000 },
        { id: "e-jal", name: "فلفل هالوپینو", price: 12000 },
        { id: "e-bac", name: "بیکن گوشت", price: 30000 },
        { id: "e-sauce", name: "سس مخصوص", price: 8000 },
      ],
    },
    {
      id: "MG-SIDE", name: "مخلفات", min: 1, max: 1, options: [
        { id: "sd-fry", name: "سیب‌زمینی سرخ‌کرده", price: 0, isDefault: true },
        { id: "sd-sal", name: "سالاد فصل", price: 5000 },
        { id: "sd-rice", name: "برنج زعفرانی", price: 15000 },
      ],
    },
  ];

  const items: MenuItem[] = [
    // Hot cafe
    m("MI-1", "اسپرسو تک", "MC1", 65000, "cafe", "☕", [], drinkSizes.slice(0, 1)),
    m("MI-2", "کاپوچینو", "MC1", 95000, "cafe", "🥛", drinkMods, drinkSizes),
    m("MI-3", "لاته", "MC1", 110000, "cafe", "☕", drinkMods, drinkSizes),
    m("MI-4", "موکا", "MC1", 128000, "cafe", "🍫", drinkMods, drinkSizes),
    m("MI-5", "قهوه ترک", "MC1", 78000, "cafe", "🫖", [], []),
    // Cold cafe
    m("MI-6", "آیس لاته", "MC2", 128000, "cafe", "🧊", drinkMods, drinkSizes),
    m("MI-7", "کولد برو", "MC2", 145000, "cafe", "❄️", drinkMods, drinkSizes),
    m("MI-8", "فراپه شکلاتی", "MC2", 165000, "cafe", "🍫", drinkMods, drinkSizes),
    // Main dishes
    m("MI-9", "استیک راسته گوساله", "MC3", 890000, "grill", "🥩", foodMods, []),
    m("MI-10", "جوجه‌کباب زعفرانی", "MC3", 480000, "grill", "🍗", foodMods.slice(2), []),
    m("MI-11", "چلوکباب کوبیده", "MC3", 380000, "grill", "🍢", foodMods.slice(2), []),
    // Pizza / pasta
    m("MI-12", "پیتزا مارگاریتا", "MC4", 350000, "pizza", "🍕", foodMods.slice(1, 2), [
      { name: "معمولی (26 سانت)", priceDelta: 0 },
      { name: "بزرگ (32 سانت)", priceDelta: 80000 },
      { name: "خانواده (40 سانت)", priceDelta: 180000 },
    ]),
    m("MI-13", "پیتزا پپرونی", "MC4", 420000, "pizza", "🍕", foodMods.slice(1, 2), [
      { name: "معمولی", priceDelta: 0 },
      { name: "بزرگ", priceDelta: 100000 },
    ]),
    m("MI-14", "پاستا آلفردو", "MC4", 320000, "pizza", "🍝", foodMods.slice(1, 2), []),
    // Burger
    m("MI-15", "برگر کلاسیک", "MC5", 285000, "grill", "🍔", foodMods, []),
    m("MI-16", "دبل چیزبرگر", "MC5", 385000, "grill", "🍔", foodMods, []),
    m("MI-17", "برگر مرغ کریسپی", "MC5", 265000, "grill", "🥪", foodMods.slice(1), []),
    // Salad
    m("MI-18", "سالاد سزار", "MC6", 210000, "cold", "🥗", foodMods.slice(1, 2), []),
    m("MI-19", "سالاد یونانی", "MC6", 195000, "cold", "🥗", foodMods.slice(1, 2), []),
    // Dessert
    m("MI-20", "چیزکیک نیویورک", "MC7", 145000, "dessert", "🍰", [], []),
    m("MI-21", "شکلات فوندانت", "MC7", 165000, "dessert", "🍫", [], []),
    // Drinks
    m("MI-22", "لیموناد پرتقالی", "MC8", 85000, "cafe", "🍊", [], drinkSizes),
    m("MI-23", "آب‌میوه طبیعی", "MC8", 95000, "cafe", "🍹", [], drinkSizes),
  ];

  // Preload a couple of live tickets so the KDS isn't empty on first render
  const now = Date.now();
  const tickets: Ticket[] = [
    {
      id: "TK-1", code: "K-24", type: "dine_in", tableId: "T2",
      waiter: "سمیرا حسینی", createdAt: now - 6 * 60 * 1000,
      status: "preparing", priority: "normal",
      items: [
        { id: "ti1", menuId: "MI-15", name: "برگر کلاسیک", qty: 2, station: "grill", modifiers: ["متوسط پخت", "سیب‌زمینی سرخ‌کرده", "پنیر اضافه"], status: "preparing" },
        { id: "ti2", menuId: "MI-22", name: "لیموناد پرتقالی", qty: 2, station: "cafe", modifiers: ["سایز بزرگ"], status: "ready" },
      ],
    },
    {
      id: "TK-2", code: "K-25", type: "dine_in", tableId: "V1",
      waiter: "کوروش امینی", createdAt: now - 2 * 60 * 1000,
      status: "new", priority: "vip",
      items: [
        { id: "ti3", menuId: "MI-9", name: "استیک راسته گوساله", qty: 4, station: "grill", modifiers: ["متوسط", "سالاد فصل"], status: "new" },
        { id: "ti4", menuId: "MI-18", name: "سالاد سزار", qty: 4, station: "cold", modifiers: [], status: "new" },
        { id: "ti5", menuId: "MI-3", name: "لاته", qty: 4, station: "cafe", modifiers: ["شیر بادام", "کارامل", "بدون شکر"], status: "new" },
      ],
    },
    {
      id: "TK-3", code: "K-26", type: "takeaway", customerName: "علی رضایی",
      createdAt: now - 12 * 60 * 1000, status: "ready",
      items: [
        { id: "ti6", menuId: "MI-12", name: "پیتزا مارگاریتا", qty: 1, station: "pizza", modifiers: ["بزرگ (32 سانت)"], status: "ready" },
      ],
    },
  ];

  // Attach the two dine-in tickets to their tables
  const withTickets = tables.map((t) => {
    if (t.id === "T2") return { ...t, status: "occupied" as TableStatus, openedAt: now - 20 * 60 * 1000, guests: 3, waiter: "سمیرا حسینی", ticketIds: ["TK-1"] };
    if (t.id === "V1") return { ...t, status: "occupied" as TableStatus, openedAt: now - 8 * 60 * 1000, guests: 4, waiter: "کوروش امینی", ticketIds: ["TK-2"] };
    return t;
  });

  return {
    halls, tables: withTickets, reservations, tickets, ticketCounter: 26,
    menu: { categories, items },
  };
}

function m(
  id: string, name: string, categoryId: string, price: number,
  station: Station, emoji: string,
  modifiers: MenuModifierGroup[] = [], sizes: { name: string; priceDelta: number }[] = [],
): MenuItem {
  return {
    id, name, categoryId, price, cost: Math.round(price * 0.4),
    station, emoji, isAvailable: true, modifiers, sizes,
    prepMinutes: station === "grill" || station === "pizza" ? 15 :
                 station === "cafe" ? 4 : station === "cold" ? 6 : 8,
    allergens: [], timeSlots: [],
  };
}

// -----------------------------------------------------------------------------
// Store (SSR-safe)
// -----------------------------------------------------------------------------

const KEY = "cr_restaurant_state_v1";
let cached: RestaurantState | null = null;
const listeners = new Set<() => void>();

function load(): RestaurantState {
  if (cached) return cached;
  if (typeof window === "undefined") {
    cached = seed();
    return cached;
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RestaurantState;
      cached = parsed;
      return cached;
    }
  } catch { /* ignore */ }
  cached = seed();
  save(cached);
  return cached;
}

function save(next: RestaurantState) {
  cached = next;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    // Also broadcast a storage event so other tabs stay in sync.
    try { window.dispatchEvent(new StorageEvent("storage", { key: KEY })); } catch { /* ignore */ }
  }
  listeners.forEach((l) => l());
}

export function resetRestaurantStore() {
  const next = seed();
  save(next);
}

export function getRestaurantState(): RestaurantState { return load(); }

export function updateRestaurantState(fn: (s: RestaurantState) => RestaurantState) {
  save(fn(load()));
}

/** React hook — subscribes and returns the current state. */
export function useRestaurantStore(): RestaurantState {
  const state = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => load(),
    () => load(),
  );

  // Cross-tab sync
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key && e.key !== KEY) return;
      cached = null;
      listeners.forEach((l) => l());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return state;
}

// -----------------------------------------------------------------------------
// Domain actions
// -----------------------------------------------------------------------------

export function setTableStatus(tableId: string, status: TableStatus, extra?: Partial<Table>) {
  updateRestaurantState((s) => ({
    ...s,
    tables: s.tables.map((t) =>
      t.id === tableId
        ? {
            ...t, ...extra, status,
            openedAt: status === "occupied" ? (t.openedAt ?? Date.now()) : status === "free" ? undefined : t.openedAt,
            guests: status === "free" ? undefined : (extra?.guests ?? t.guests),
            waiter: status === "free" ? undefined : (extra?.waiter ?? t.waiter),
            ticketIds: status === "free" ? [] : t.ticketIds,
          }
        : t,
    ),
  }));
}

export function transferTable(fromId: string, toId: string) {
  updateRestaurantState((s) => {
    const from = s.tables.find((t) => t.id === fromId);
    const to = s.tables.find((t) => t.id === toId);
    if (!from || !to) return s;
    return {
      ...s,
      tables: s.tables.map((t) => {
        if (t.id === toId) return {
          ...t, status: "occupied", openedAt: from.openedAt ?? Date.now(),
          guests: from.guests, waiter: from.waiter, ticketIds: [...from.ticketIds],
        };
        if (t.id === fromId) return {
          ...t, status: "cleaning", openedAt: undefined,
          guests: undefined, waiter: undefined, ticketIds: [],
        };
        return t;
      }),
      tickets: s.tickets.map((tk) => from.ticketIds.includes(tk.id) ? { ...tk, tableId: toId } : tk),
    };
  });
}

export function sendTicketToKitchen(payload: {
  type: OrderType;
  tableId?: string;
  waiter?: string;
  customerName?: string;
  priority?: Ticket["priority"];
  items: Omit<TicketItem, "id" | "status">[];
  note?: string;
}): Ticket {
  const state = load();
  const nextCounter = state.ticketCounter + 1;
  const code = `K-${nextCounter}`;
  const id = `TK-${nextCounter}`;
  const t: Ticket = {
    id, code, type: payload.type, tableId: payload.tableId,
    waiter: payload.waiter, customerName: payload.customerName,
    priority: payload.priority ?? "normal",
    createdAt: Date.now(), status: "new",
    note: payload.note,
    items: payload.items.map((it, ix) => ({ ...it, id: `${id}-${ix + 1}`, status: "new" })),
  };
  updateRestaurantState((s) => ({
    ...s,
    ticketCounter: nextCounter,
    tickets: [t, ...s.tickets],
    tables: payload.tableId
      ? s.tables.map((tb) =>
          tb.id === payload.tableId
            ? { ...tb, status: "occupied", openedAt: tb.openedAt ?? Date.now(), ticketIds: [...tb.ticketIds, id] }
            : tb,
        )
      : s.tables,
  }));
  return t;
}

export function advanceTicketStatus(ticketId: string, status: TicketStatus) {
  updateRestaurantState((s) => ({
    ...s,
    tickets: s.tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t, status,
            items: t.items.map((it) => ({ ...it, status })),
            readyAt: status === "ready" ? Date.now() : t.readyAt,
            servedAt: status === "served" ? Date.now() : t.servedAt,
          }
        : t,
    ),
  }));
}

export function toggleMenuItemAvailability(itemId: string) {
  updateRestaurantState((s) => ({
    ...s,
    menu: {
      ...s.menu,
      items: s.menu.items.map((it) => it.id === itemId ? { ...it, isAvailable: !it.isAvailable } : it),
    },
  }));
}

export function addReservation(res: Omit<Reservation, "id">) {
  updateRestaurantState((s) => ({
    ...s,
    reservations: [...s.reservations, { ...res, id: `R${s.reservations.length + 1}` }],
  }));
}

// -----------------------------------------------------------------------------
// Small selectors
// -----------------------------------------------------------------------------

export function elapsedMinutes(from: number): number {
  return Math.floor((Date.now() - from) / 60000);
}

export const TABLE_STATUS_LABEL: Record<TableStatus, string> = {
  free: "آزاد",
  occupied: "اشغال",
  reserved: "رزرو",
  billing: "منتظر پرداخت",
  cleaning: "نظافت",
};

export const TABLE_STATUS_STYLE: Record<TableStatus, string> = {
  free: "border-emerald-300 bg-emerald-50 text-emerald-800",
  occupied: "border-rose-300 bg-rose-50 text-rose-800",
  reserved: "border-violet-300 bg-violet-50 text-violet-800",
  billing: "border-amber-300 bg-amber-50 text-amber-800",
  cleaning: "border-slate-300 bg-slate-100 text-slate-700",
};
