# CashRegister — Backend (FastAPI + MySQL)

بک‌اند سامانه صندوق فروش سازمانی کش‌رجیستر. REST API با FastAPI، پایگاه داده MySQL 8، مدیریت با phpMyAdmin و مهاجرت‌ها با Alembic.

> برای اجرای همه‌چیز (فرانت + بک‌اند + MySQL + phpMyAdmin) با یک دستور، از **docker-compose.yml اصلی در ریشه پروژه** استفاده کنید:
>
> ```bash
> cd ..    # ریشه CashRegister
> docker compose up -d --build
> ```

## اجرا مستقل بدون Docker

```powershell
# ویندوز PowerShell
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

```bash
# لینوکس/مک
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="mysql+pymysql://cashregister:cashregister@localhost:3306/cashregister?charset=utf8mb4"
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload
```

## حساب پیش‌فرض (پس از seed)

- کاربر ادمین: `admin` / `admin123`  (PIN: `0000`)
- صندوقدار نمونه: `cashier1` / `cashier123`  (PIN: `1234`)

## گروه‌های API

همه اندپوینت‌ها زیر `/api/v1` قرار دارند و به‌جز `/auth/login*` نیاز به JWT دارند.

| گروه | مسیر | توضیح |
| --- | --- | --- |
| auth | `/auth/login`, `/auth/login/pin`, `/auth/me` | ورود با یوزر/پسورد یا PIN |
| products | `/products`, `/products/{id}`, `/products/barcode/{code}` | کالاها، بارکد، دسته/برند |
| customers | `/customers`, `/customers/{id}` | مشتریان و گروه‌ها |
| sales | `/sales`, `/sales/{id}/void` | ثبت فروش (idempotent) و ابطال |
| shifts | `/shifts/open`, `/shifts/{id}/close`, `/shifts/{id}/cash-movement` | افتتاح/بستن شیفت و حرکت نقدی |
| inventory | `/inventory/levels`, `/inventory/adjust`, `/inventory/transfer` | سطح موجودی، اصلاح، انتقال |
| branches | `/branches`, `/branches/{id}/registers`, `/branches/{id}/warehouses` | شعب، صندوق‌ها، انبارها |
| employees | `/employees` | پرسنل |
| suppliers | `/suppliers` | تأمین‌کنندگان |
| purchases | `/purchases`, `/purchases/{id}/receive` | سفارش خرید و دریافت |
| promotions | `/promotions`, `/promotions/coupons`, `/promotions/gift-cards` | کمپین، کوپن، کارت هدیه |
| dashboard | `/dashboard/summary` | خلاصه امروز و ۱۴ روز |
| reports | `/reports/hourly`, `/reports/top-products`, `/reports/by-cashier` | گزارش‌ها |

Swagger کامل روی <http://localhost:8000/docs>.

## ساختار

```
backend/
├─ app/
│  ├─ api/v1/endpoints/   ← 13 گروه endpoint
│  ├─ core/               ← config, security, deps
│  ├─ db/                 ← base, session
│  ├─ models/             ← SQLAlchemy models
│  ├─ schemas/            ← Pydantic
│  ├─ services/           ← sale, inventory, numbering
│  └─ main.py
├─ alembic/               ← migrations
├─ scripts/               ← seed, wait_for_db
├─ Dockerfile
└─ requirements.txt
```

## اعتبار داده مالی

- تمام محاسبات با `Decimal` (نه float) و گرد شدن دو رقمی نیم‌بالا انجام می‌شود.
- مالیات ۹٪ پس از تخفیف فاکتور به‌صورت وزنی روی خطوط بازتوزیع می‌شود.
- ثبت فروش با `client_uid` idempotent است — ارسال دوباره فروش تکراری ایجاد نمی‌کند.
- ابطال فاکتور موجودی را دقیقاً به همان انباری که فروخته شده بود برمی‌گرداند.
