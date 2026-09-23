# کش‌رجیستر — سامانه صندوق فروش و مدیریت خرده‌فروشی سازمانی

پلتفرم یکپارچه POS و مدیریت خرده‌فروشی به زبان فارسی (RTL). این مخزن شامل هر دو بخش است:

- **Frontend** — Next.js 14 (App Router) + Tailwind + TypeScript، تقویم جلالی، فونت وزیرمتن، صفحه صندوق فروش، پنل مدیریت.
- **Backend** — FastAPI + SQLAlchemy 2 + Alembic روی MySQL 8، احراز هویت JWT و PIN، منطق فروش تراکنشی با idempotency، شیفت و صندوق، انبار، خرید، مشتری، پروموشن، داشبورد و گزارش.
- **پایگاه داده** — MySQL 8 با مدیریت آسان از طریق **phpMyAdmin** روی پورت `8080` (docker-compose).

## اجرا (توسعه — همه چیز با Docker)

```bash
# بک‌اند + دیتابیس + phpMyAdmin
cd backend
docker compose up -d --build

# فرانت
cd ..
cp .env.local.example .env.local     # NEXT_PUBLIC_API_URL از قبل به http://localhost:8000/api/v1 اشاره می‌کند
npm install
npm run dev
```

- API: <http://localhost:8000> — Swagger: `/docs`
- phpMyAdmin: <http://localhost:8080>  (`root` / `root`)
- Frontend: <http://localhost:3000>

پس از اولین راه‌اندازی، جدول‌ها با Alembic ساخته می‌شوند و seed اولیه (فارسی) اجرا می‌شود:

- ادمین: `admin` / `admin123` (PIN: `۰۰۰۰`)
- صندوقدار نمونه: `cashier1` / `cashier123` (PIN: `1234`)

## ساختار مخزن

```
CashRegister/
├─ src/                    # فرانت (Next.js)
│  ├─ app/
│  │  ├─ page.tsx          # صفحه اصلی
│  │  ├─ login/            # ورود (پسورد یا PIN)
│  │  ├─ pos/              # صندوق فروش
│  │  └─ dashboard/…       # ۲۰ ماژول پنل مدیریت
│  ├─ components/          # سایدبار، تاپ‌بار، KPI، نمودارهای SVG
│  └─ lib/                 # utils (Jalali, ارز، ...) و کلاینت API
├─ backend/                # بک‌اند (FastAPI + MySQL)
│  ├─ app/
│  │  ├─ api/v1/endpoints/ # ۱۳ گروه اندپوینت (auth, products, sales, shifts, …)
│  │  ├─ core/             # config, security, deps
│  │  ├─ db/               # base, session
│  │  ├─ models/           # ORM (Company, Branch, Product, Sale, …)
│  │  ├─ schemas/          # Pydantic
│  │  └─ services/         # منطق فروش، انبار، شماره‌گذاری
│  ├─ alembic/             # مهاجرت‌ها
│  ├─ scripts/             # seed, wait_for_db
│  ├─ docker-compose.yml   # mysql + phpmyadmin + api
│  └─ README.md
└─ README.md               # این فایل
```

## قابلیت‌های اصلی

- **صندوق فروش لمسی**: اسکن بارکد، سبد، تخفیف خطی، مشتری، پرداخت ترکیبی (نقد + کارت + کیف پول + هدیه + QR + اعتبار)، میانبرهای F1/F2/F4/F6، سبدهای نگه‌داشته.
- **پنل مدیریت**: داشبورد اجرایی با KPI، نمودار ۱۴ روزه، فروش ساعتی، ترکیب پرداخت، وضعیت شعب، هشدار موجودی؛ ۲۰ صفحه ماژول (فروش، کالا، انبار، خرید، تأمین‌کننده، مشتری، وفاداری، پروموشن، پرداخت، صندوق، حسابداری، پرسنل، شعبه، گزارش، لاگ، یکپارچه‌سازی، اعلان، امنیت، تنظیمات).
- **بک‌اند**:
  - احراز هویت JWT (username/password و PIN)، RBAC روی نقش‌ها.
  - `POST /sales` تراکنشی با محاسبه دقیق مالیات، تخفیف خطی و کلی، پرداخت ترکیبی، پشتیبانی از **idempotency (`client_uid`)** برای جلوگیری از فروش تکراری در حالت آفلاین.
  - موجودی زنده: `StockMovement` برای هر جابه‌جایی، تراز `InventoryLevel` به تفکیک انبار.
  - شیفت صندوق: افتتاح/بستن، حرکت نقدی، محاسبه اختلاف صندوق.
  - خرید: PO، دریافت کامل/جزئی که موجودی را افزایش می‌دهد.
  - داشبورد و گزارش: فروش امروز، ساعتی، پرفروش‌ها، به تفکیک صندوقدار، وضعیت شعب، کالای کم‌موجود.

## اتصال فرانت به بک‌اند

فرانت با تلاش برای فراخوانی `/api/v1` بک‌اند شروع می‌کند و در صورت عدم دسترسی، به داده نمونه fallback می‌کند. آدرس API در `.env.local` قابل تنظیم است:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## اعتبار داده‌های مالی

- تمام محاسبات مالی با `Decimal` (نه float) و گرد شدن دو رقمی نیم‌بالا انجام می‌شود.
- محاسبه مالیات پس از اعمال تخفیف فاکتور به‌صورت نسبت وزنی روی خطوط توزیع می‌شود.

## اجرای بک‌اند بدون Docker

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="mysql+pymysql://cashregister:cashregister@localhost:3306/cashregister?charset=utf8mb4"
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload
```

---

**نسخه رابط کاربری و بک‌اند اولیه، آماده توسعه بعدی**: همگام‌سازی آفلاین با IndexedDB/Outbox، آداپتورهای پرداخت واقعی، صورتحساب الکترونیکی مؤدیان، اتصال به سخت‌افزارها.
