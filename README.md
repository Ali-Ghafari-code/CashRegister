# کش‌رجیستر — سامانه صندوق فروش سازمانی (وب)

پلتفرم کامل POS + مدیریت خرده‌فروشی + رستوران و کافه به زبان فارسی و طراحی راست‌به‌چپ.

- **Frontend** — Next.js 14 + TypeScript + Tailwind
- **Backend** — FastAPI + SQLAlchemy 2 + Alembic
- **Database** — MySQL 8 (با پنل مدیریت phpMyAdmin)
- **Demo Mode** — اگر بک‌اند اجرا نباشد، فرانت خودکار به یک "mock backend" روی مرورگر سوییچ می‌کند و همه صفحات، فرم‌ها، محصولات و فروش‌ها با داده نمونه فارسی کار می‌کنند (در localStorage ذخیره می‌شود).

## ساختار مخزن

```
CashRegister/
├─ docker-compose.yml     ← بالا آوردن همه چیز با یک دستور
├─ frontend/              ← Next.js (پورت 3000)
│  ├─ src/
│  │  ├─ app/             ← صفحه‌ها (page.tsx per route)
│  │  ├─ components/      ← UI مشترک (sidebar، top-bar، charts، api-status)
│  │  └─ lib/             ← api.ts (client)، mock-backend.ts، utils، restaurant-store
│  ├─ package.json
│  └─ Dockerfile
├─ backend/               ← FastAPI (پورت 8000)
│  ├─ app/
│  │  ├─ api/v1/endpoints/    ← 13 گروه endpoint
│  │  ├─ core/                ← config, security (JWT), deps
│  │  ├─ db/                  ← SQLAlchemy base/session
│  │  ├─ models/              ← ORM (Company, Branch, Product, Sale, ...)
│  │  ├─ schemas/             ← Pydantic
│  │  └─ services/            ← منطق فروش، انبار، شماره‌گذاری
│  ├─ alembic/                ← مهاجرت‌ها
│  ├─ scripts/                ← seed.py، wait_for_db.py
│  ├─ requirements.txt
│  └─ Dockerfile
└─ README.md
```

## پیش‌نیاز

- **Docker Desktop** برای ویندوز/مک/لینوکس (توصیه‌شده)  
یا برای اجرای دستی:
- **Node.js 20+** و **npm** برای فرانت
- **Python 3.12+** و **MySQL 8** برای بک‌اند

## اجرای همه‌چیز با یک دستور (Docker)

پس از نصب Docker Desktop، در پوشه پروژه (مثل `D:\assets\CashRegister`) اجرا کنید:

```powershell
# PowerShell / CMD روی ویندوز
cd D:\assets\CashRegister
docker compose up -d --build
```

اولین بار ۲–۳ دقیقه طول می‌کشد. سپس:

| سرویس | آدرس | ورود |
|---|---|---|
| **فرانت** | <http://localhost:3000> | — |
| **API** | <http://localhost:8000/docs> | — |
| **phpMyAdmin** | <http://localhost:8080> | `root` / `root` |
| MySQL | `localhost:3306` | `cashregister` / `cashregister` |

**حساب پیش‌فرض پس از seed:**
- ادمین: `admin` / `admin123` — PIN صندوق: `0000`
- صندوقدار: `cashier1` / `cashier123` — PIN: `1234`

مشاهده لاگ:

```powershell
docker compose logs -f api
docker compose logs -f frontend
```

توقف:

```powershell
docker compose down
```

پاک‌کردن کامل داده MySQL (بازنشانی دیتابیس):

```powershell
docker compose down -v
```

## اجرا بدون Docker (دستی، ویندوز)

### ۱) MySQL

MySQL 8 نصب کنید (مثلاً از [MySQL Installer](https://dev.mysql.com/downloads/installer/)). یک دیتابیس بسازید:

```sql
CREATE DATABASE cashregister CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cashregister'@'%' IDENTIFIED BY 'cashregister';
GRANT ALL ON cashregister.* TO 'cashregister'@'%';
```

### ۲) Backend

```powershell
cd D:\assets\CashRegister\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

$env:DATABASE_URL = "mysql+pymysql://cashregister:cashregister@localhost:3306/cashregister?charset=utf8mb4"
$env:SECRET_KEY   = "dev-secret"
$env:CORS_ORIGINS = "http://localhost:3000"

alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --port 8000
```

Swagger روی <http://localhost:8000/docs> باز می‌شود.

### ۳) Frontend

پنجره PowerShell جدید:

```powershell
cd D:\assets\CashRegister\frontend
copy .env.local.example .env.local
npm install
npm run dev
```

فرانت روی <http://localhost:3000>.

## حالت دمو (بدون بک‌اند)

اگر فقط می‌خواهید UI را تست کنید و MySQL/Backend راه‌اندازی نکنید:

```powershell
cd D:\assets\CashRegister\frontend
npm install
npm run dev
```

روی <http://localhost:3000> که رفتید، فرانت متوجه می‌شود بک‌اند بالا نیست و خودکار به **حالت دمو** سوییچ می‌کند. یک چیپ آبی «حالت دمو» در بالای صفحه دیده می‌شود. همه صفحات — POS، داشبورد، محصولات، مشتریان، فروش‌ها، گزارش‌ها، شعب، پرسنل، تأمین‌کنندگان، خرید، پروموشن، صندوق، انبار — با ~۱۸ محصول فارسی، ۵ مشتری، ۵ شعبه، ۵ تأمین‌کننده، ۶ کارمند و ۱۴ روز فروش تاریخی کار می‌کنند.

- محصول یا مشتری می‌سازید → فوراً در POS/داشبورد دیده می‌شود.
- فروش POS می‌زنید → در صفحه فروش‌ها، داشبورد، گزارش‌ها و موجودی reflect می‌شود.
- همه چیز در `localStorage` مرورگر ذخیره می‌شود (کلید `cr_mock_state_v2`).
- دکمه «بازنشانی» در top-bar داده دمو را پاک می‌کند.
- دکمه «اتصال دوباره» به حالت واقعی برمی‌گرداند (اگر بک‌اند بالا آمده).

## قابلیت‌های رستوران و کافه

- `/dashboard/tables` — چیدمان سالن، رزرو، انتقال میز، وضعیت‌های آزاد/اشغال/رزرو/منتظر پرداخت/نظافت
- `/dashboard/kitchen` — نمایشگر آشپزخانه (KDS)، ایستگاه‌های گریل/کافه/پیتزا/دسر، تایمر لحظه‌ای، اولویت VIP و فوری
- `/dashboard/menu` — منوی رستوران/کافه با سایز، شیر بادام/جو، شات اضافه، درجه پختگی، افزودنی‌ها؛ ارسال مستقیم به KDS

این سه صفحه با یک استور مشترک `restaurant-store.ts` (روی localStorage) هم‌گام هستند. اشغال میز در `/tables` بلافاصله در انتخاب میز `/menu` دیده می‌شود؛ سفارش ارسال‌شده از `/menu` فوراً به‌عنوان تیکت در `/kitchen` ظاهر می‌شود.

## معماری اتصال فرانت ↔ بک‌اند

هر صفحه از `useApi(resource, fetcher)` استفاده می‌کند که:

1. اگر توکن JWT در localStorage باشد، آن را در هدر ارسال می‌کند
2. اگر fetch به خطای شبکه بخورد، خودکار به `mock-backend.ts` سوییچ می‌شود
3. هر mutation (ایجاد محصول/مشتری/فروش) پس از موفقیت `invalidate(resource)` می‌کند تا همه صفحات دیگری که همان resource را می‌بینند، refetch شوند

جریان انتها‌به‌انتها (چه با بک‌اند واقعی چه با دمو):

```
POS  ──POST /sales──▶  Backend / Mock  ──▶  sales, dashboard, reports, products, inventory
Products ──POST /products──▶ ...        ──▶  POS product grid رفرش می‌شود
Customers ──POST /customers──▶ ...      ──▶  گزارش‌ها و لیست‌ها
```

## چند نکته فنی

- **محاسبات مالی** با `Decimal` انجام می‌شود، مالیات ۹٪ پس از تخفیف فاکتور به‌صورت وزنی به خطوط بازتوزیع می‌شود.
- **Idempotency** — `POST /sales` با `client_uid` تکرارپذیر است؛ اگر همان uid را دوباره ارسال کنید همان فاکتور برمی‌گردد (مفید برای حالت آفلاین).
- **ابطال فاکتور** — `POST /sales/{id}/void` موجودی را به انبار برمی‌گرداند.
- **CORS** — پیش‌فرض روی `http://localhost:3000` باز است، برای production در `backend/.env` تنظیم کنید.

## در حال توسعه (لایه‌های آینده)

- مهاجرت مدل رستوران (میز، سالن، تیکت، منو، افزودنی) به بک‌اند FastAPI + endpointها
- همگام‌سازی آفلاین با IndexedDB و Outbox
- آداپتور واقعی درگاه پرداخت (سامان کیش، شاپرک)
- ارسال فاکتور الکترونیکی به سامانه مؤدیان مالیاتی
- اپلیکیشن موبایل POS

---

**سؤالی داشتید یا خطایی دیدید:** لاگ‌های `docker compose logs api` و کنسول مرورگر (F12) اولین جاهایی هستند که باید نگاه کنید.
