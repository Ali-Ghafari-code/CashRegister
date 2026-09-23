# CashRegister — Backend (FastAPI + MySQL)

بک‌اند سامانه صندوق فروش سازمانی کش‌رجیستر. REST API با FastAPI، پایگاه داده MySQL 8، مدیریت پایگاه با phpMyAdmin و مهاجرت‌ها با Alembic.

## اجرای سریع با Docker

```bash
cd backend
cp .env.example .env    # اختیاری
docker compose up -d --build
```

سرویس‌ها بالا می‌آیند:

- **API** — http://localhost:8000  (اسناد Swagger: `/docs`، ReDoc: `/redoc`)
- **phpMyAdmin** — http://localhost:8080  (کاربر: `root` / پسورد: `root`)
- **MySQL** — `localhost:3306`  (کاربر: `cashregister` / پسورد: `cashregister` / دیتابیس: `cashregister`)

هنگام اولین راه‌اندازی، `alembic upgrade head` اجرا می‌شود و در صورت `SEED_ON_START=1`، داده نمونه فارسی درج می‌شود.

## اجرا بدون Docker

```bash
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

## ماژول‌های API

همه اندپوینت‌ها زیر `/api/v1` قرار دارند و به‌جز `/auth/login*` نیاز به JWT دارند.

| گروه | توضیح |
| --- | --- |
| `auth` | ورود با یوزر/پسورد یا PIN، اطلاعات کاربر جاری |
| `products` | کالاها، بارکد، دسته‌بندی، برند، جست‌وجو + پیدا با بارکد |
| `customers` | مشتریان و گروه‌ها |
| `sales` | ثبت فروش (پرداخت ترکیبی، مالیات، idempotency)، ابطال |
| `shifts` | افتتاح و بستن شیفت، ثبت واریز/برداشت نقدی، اختلاف صندوق |
| `inventory` | سطح موجودی، اصلاح دستی، انتقال بین انبار |
| `purchases` | سفارش خرید، دریافت کالا (کامل/جزئی) |
| `suppliers` | تأمین‌کنندگان و مانده حساب |
| `promotions` | کمپین، کوپن، کارت هدیه |
| `branches` | شعبه‌ها، صندوق‌ها، انبارها |
| `employees` | پرسنل |
| `dashboard` | خلاصه امروز (فروش، صندوق، پرداخت، شعبه، کم‌موجود) |
| `reports` | ساعتی، پرفروش‌ها، فروش هر صندوقدار |

## ساختار

```
backend/
  app/
    api/v1/endpoints/   # روت‌ها
    core/               # config, security, deps
    db/                 # base, session
    models/             # SQLAlchemy models
    schemas/            # Pydantic
    services/           # sale, inventory, numbering
    main.py
  alembic/              # migrations
  scripts/              # seed, wait_for_db
  Dockerfile
  docker-compose.yml
  requirements.txt
```

## مالیات، اعداد، ایمنی
- محاسبات مالی همه‌جا `Decimal` هستند و به دو رقم اعشار گرد می‌شوند.
- ثبت فروش با `client_uid` idempotent است؛ ارسال دوباره فروش تکراری ایجاد نمی‌کند.
- موجودی هنگام فروش کاهش و در ابطال بازگردانی می‌شود.
