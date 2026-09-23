export type Product = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  variant?: string;
  emoji: string;
  weighted?: boolean;
};

export const CATEGORIES = [
  "همه",
  "لبنیات",
  "تنقلات",
  "نوشیدنی",
  "خواروبار",
  "شوینده",
  "بهداشتی",
  "پروتئینی",
  "میوه و سبزی",
  "نانوایی",
];

export const products: Product[] = [
  { id: "p1", name: "شیر پرچرب پگاه ۱ لیتری", sku: "SKU-1001", barcode: "6260100001001", category: "لبنیات", brand: "پگاه", price: 42000, cost: 33000, stock: 128, unit: "عدد", emoji: "🥛" },
  { id: "p2", name: "ماست موسیر کاله ۵۰۰ گرمی", sku: "SKU-1002", barcode: "6260100001002", category: "لبنیات", brand: "کاله", price: 68500, cost: 51000, stock: 42, unit: "عدد", emoji: "🥣" },
  { id: "p3", name: "پنیر لیقوان تازه", sku: "SKU-1003", barcode: "6260100001003", category: "لبنیات", brand: "محلی", price: 320000, cost: 260000, stock: 12, unit: "کیلوگرم", emoji: "🧀", weighted: true },
  { id: "p4", name: "نوشابه کوکاکولا ۱.۵ لیتری", sku: "SKU-2001", barcode: "6260100002001", category: "نوشیدنی", brand: "کوکاکولا", price: 55000, cost: 42000, stock: 210, unit: "عدد", emoji: "🥤" },
  { id: "p5", name: "آب معدنی دماوند ۱.۵ لیتری", sku: "SKU-2002", barcode: "6260100002002", category: "نوشیدنی", brand: "دماوند", price: 18000, cost: 13500, stock: 320, unit: "عدد", emoji: "💧" },
  { id: "p6", name: "چیپس چاکلز پنیری", sku: "SKU-3001", barcode: "6260100003001", category: "تنقلات", brand: "چی‌توز", price: 39000, cost: 29500, stock: 96, unit: "عدد", emoji: "🍟" },
  { id: "p7", name: "پفک نمکی مینو", sku: "SKU-3002", barcode: "6260100003002", category: "تنقلات", brand: "مینو", price: 22000, cost: 15500, stock: 148, unit: "عدد", emoji: "🌽" },
  { id: "p8", name: "برنج ایرانی هاشمی ۱۰ کیلویی", sku: "SKU-4001", barcode: "6260100004001", category: "خواروبار", brand: "طلای شمال", price: 1_650_000, cost: 1_380_000, stock: 18, unit: "کیسه", emoji: "🍚" },
  { id: "p9", name: "روغن سرخ‌کردنی لادن ۱.۸ لیتری", sku: "SKU-4002", barcode: "6260100004002", category: "خواروبار", brand: "لادن", price: 245_000, cost: 205_000, stock: 34, unit: "عدد", emoji: "🛢️" },
  { id: "p10", name: "مایع ظرفشویی اکتیو ۳.۷۵ لیتری", sku: "SKU-5001", barcode: "6260100005001", category: "شوینده", brand: "اکتیو", price: 175_000, cost: 138_000, stock: 62, unit: "عدد", emoji: "🧴" },
  { id: "p11", name: "شامپو حجم‌دهنده کلیر ۴۰۰ml", sku: "SKU-6001", barcode: "6260100006001", category: "بهداشتی", brand: "کلیر", price: 235_000, cost: 178_000, stock: 41, unit: "عدد", emoji: "🧴" },
  { id: "p12", name: "خمیر دندان سیگنال ضد پوسیدگی", sku: "SKU-6002", barcode: "6260100006002", category: "بهداشتی", brand: "سیگنال", price: 68000, cost: 52000, stock: 88, unit: "عدد", emoji: "🪥" },
  { id: "p13", name: "مرغ تازه", sku: "SKU-7001", barcode: "6260100007001", category: "پروتئینی", brand: "کشتارگاه ۹۱۰", price: 195_000, cost: 172_000, stock: 27, unit: "کیلوگرم", emoji: "🍗", weighted: true },
  { id: "p14", name: "ران گوسفندی", sku: "SKU-7002", barcode: "6260100007002", category: "پروتئینی", brand: "محلی", price: 890_000, cost: 780_000, stock: 8, unit: "کیلوگرم", emoji: "🥩", weighted: true },
  { id: "p15", name: "پرتقال تامسون درجه یک", sku: "SKU-8001", barcode: "6260100008001", category: "میوه و سبزی", brand: "شمال", price: 78000, cost: 58000, stock: 65, unit: "کیلوگرم", emoji: "🍊", weighted: true },
  { id: "p16", name: "سیب زرد لبنانی", sku: "SKU-8002", barcode: "6260100008002", category: "میوه و سبزی", brand: "ارومیه", price: 92000, cost: 71000, stock: 44, unit: "کیلوگرم", emoji: "🍎", weighted: true },
  { id: "p17", name: "نان بربری کنجدی", sku: "SKU-9001", barcode: "6260100009001", category: "نانوایی", brand: "محلی", price: 24000, cost: 15000, stock: 76, unit: "عدد", emoji: "🥖" },
  { id: "p18", name: "نان لواش ماشینی", sku: "SKU-9002", barcode: "6260100009002", category: "نانوایی", brand: "محلی", price: 14000, cost: 9000, stock: 210, unit: "بسته", emoji: "🥙" },
];

export type Customer = {
  id: string;
  name: string;
  phone: string;
  code: string;
  group: "عادی" | "طلایی" | "نقره‌ای" | "شرکتی";
  loyaltyPoints: number;
  balance: number;
  lastVisit: string;
  totalPurchases: number;
};

export const customers: Customer[] = [
  { id: "c1", name: "علی رضایی", phone: "۰۹۱۲۱۲۳۴۵۶۷", code: "CU-0001", group: "طلایی", loyaltyPoints: 12500, balance: 0, lastVisit: "امروز", totalPurchases: 48 },
  { id: "c2", name: "زهرا محمدی", phone: "۰۹۳۵۴۴۴۳۳۲۲", code: "CU-0002", group: "نقره‌ای", loyaltyPoints: 4800, balance: 250000, lastVisit: "دیروز", totalPurchases: 22 },
  { id: "c3", name: "شرکت پارس‌گستر", phone: "۰۲۱۸۸۸۸۷۷۶۶", code: "CU-0003", group: "شرکتی", loyaltyPoints: 0, balance: 5_400_000, lastVisit: "۳ روز پیش", totalPurchases: 91 },
  { id: "c4", name: "محمد کریمی", phone: "۰۹۱۲۹۹۸۸۷۷۶", code: "CU-0004", group: "عادی", loyaltyPoints: 900, balance: 0, lastVisit: "هفته گذشته", totalPurchases: 6 },
  { id: "c5", name: "نگار احمدی", phone: "۰۹۳۹۱۱۱۲۲۳۳", code: "CU-0005", group: "طلایی", loyaltyPoints: 21400, balance: 0, lastVisit: "امروز", totalPurchases: 74 },
];

export type Branch = {
  id: string;
  name: string;
  city: string;
  registers: number;
  onlineRegisters: number;
  todaySales: number;
  manager: string;
};

export const branches: Branch[] = [
  { id: "b1", name: "شعبه مرکزی تهران", city: "تهران", registers: 8, onlineRegisters: 8, todaySales: 184_500_000, manager: "سعید تهرانی" },
  { id: "b2", name: "شعبه ونک", city: "تهران", registers: 4, onlineRegisters: 3, todaySales: 92_300_000, manager: "مریم شاهی" },
  { id: "b3", name: "شعبه اصفهان چهارباغ", city: "اصفهان", registers: 5, onlineRegisters: 5, todaySales: 118_700_000, manager: "امیر نجفی" },
  { id: "b4", name: "شعبه مشهد رضا", city: "مشهد", registers: 6, onlineRegisters: 4, todaySales: 141_200_000, manager: "فاطمه رضوی" },
  { id: "b5", name: "شعبه شیراز زند", city: "شیراز", registers: 3, onlineRegisters: 3, todaySales: 71_600_000, manager: "بهرام کاووسی" },
];

export type Employee = {
  id: string;
  name: string;
  role: "صندوقدار" | "صندوقدار ارشد" | "سرشیفت" | "مدیر شعبه" | "انبار" | "حسابدار";
  branch: string;
  status: "فعال" | "غیرفعال";
  pin: string;
  todayShift?: string;
};

export const employees: Employee[] = [
  { id: "e1", name: "رضا مرادی", role: "صندوقدار", branch: "شعبه مرکزی تهران", status: "فعال", pin: "۱۲۳۴", todayShift: "۰۸:۰۰ - ۱۶:۰۰" },
  { id: "e2", name: "سمیرا حسینی", role: "صندوقدار ارشد", branch: "شعبه مرکزی تهران", status: "فعال", pin: "۵۶۷۸", todayShift: "۱۶:۰۰ - ۲۴:۰۰" },
  { id: "e3", name: "کوروش امینی", role: "سرشیفت", branch: "شعبه ونک", status: "فعال", pin: "۹۹۹۱" },
  { id: "e4", name: "مریم شاهی", role: "مدیر شعبه", branch: "شعبه ونک", status: "فعال", pin: "۰۰۰۱" },
  { id: "e5", name: "بهنام قربانی", role: "انبار", branch: "شعبه اصفهان چهارباغ", status: "فعال", pin: "۴۳۲۱" },
  { id: "e6", name: "لیلا کاظمی", role: "حسابدار", branch: "دفتر مرکزی", status: "فعال", pin: "۷۷۷۷" },
];

export type Sale = {
  id: string;
  invoiceNo: string;
  time: string;
  branch: string;
  cashier: string;
  customer: string;
  items: number;
  total: number;
  payment: "نقدی" | "کارتی" | "ترکیبی" | "اعتباری" | "کیف پول";
  status: "تسویه" | "معلق" | "برگشتی";
};

export const recentSales: Sale[] = [
  { id: "s1", invoiceNo: "INV-۱۴۰۳۱۲۰۱۰۰۰۱", time: "۰۸:۴۲", branch: "مرکزی تهران", cashier: "رضا مرادی", customer: "علی رضایی", items: 6, total: 1_240_000, payment: "کارتی", status: "تسویه" },
  { id: "s2", invoiceNo: "INV-۱۴۰۳۱۲۰۱۰۰۰۲", time: "۰۸:۴۷", branch: "مرکزی تهران", cashier: "رضا مرادی", customer: "مهمان", items: 2, total: 92_000, payment: "نقدی", status: "تسویه" },
  { id: "s3", invoiceNo: "INV-۱۴۰۳۱۲۰۱۰۰۰۳", time: "۰۹:۰۳", branch: "ونک", cashier: "کوروش امینی", customer: "زهرا محمدی", items: 11, total: 3_580_000, payment: "ترکیبی", status: "تسویه" },
  { id: "s4", invoiceNo: "INV-۱۴۰۳۱۲۰۱۰۰۰۴", time: "۰۹:۱۲", branch: "اصفهان", cashier: "سمیرا حسینی", customer: "شرکت پارس‌گستر", items: 24, total: 12_450_000, payment: "اعتباری", status: "معلق" },
  { id: "s5", invoiceNo: "INV-۱۴۰۳۱۲۰۱۰۰۰۵", time: "۰۹:۲۱", branch: "مشهد", cashier: "بهنام قربانی", customer: "نگار احمدی", items: 4, total: 480_000, payment: "کیف پول", status: "تسویه" },
  { id: "s6", invoiceNo: "INV-۱۴۰۳۱۲۰۱۰۰۰۶", time: "۰۹:۳۴", branch: "مرکزی تهران", cashier: "رضا مرادی", customer: "مهمان", items: 3, total: 168_000, payment: "کارتی", status: "برگشتی" },
];

export const salesTrend14d = [
  38, 42, 35, 51, 48, 62, 71, 56, 63, 74, 68, 82, 91, 88,
];

export const paymentMix = [
  { name: "کارتی", value: 62, color: "#3390ff" },
  { name: "نقدی", value: 22, color: "#10b981" },
  { name: "کیف پول", value: 9, color: "#f59e0b" },
  { name: "اعتباری", value: 5, color: "#ef4444" },
  { name: "کارت هدیه", value: 2, color: "#8b5cf6" },
];

export const lowStock = [
  { name: "ران گوسفندی", stock: 8, min: 15 },
  { name: "پنیر لیقوان تازه", stock: 12, min: 20 },
  { name: "برنج ایرانی هاشمی", stock: 18, min: 25 },
];

export const heldCarts = [
  { id: "h1", cashier: "رضا مرادی", register: "صندوق ۲", items: 5, total: 640_000, time: "۰۹:۱۲", customer: "مهمان" },
  { id: "h2", cashier: "سمیرا حسینی", register: "صندوق ۱", items: 12, total: 2_180_000, time: "۰۹:۲۸", customer: "زهرا محمدی" },
];
