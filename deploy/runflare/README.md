# راهنمای شروع دیپلوی روی Runflare (هاست Django واحد)

هدف: یک سرویس Django روی Runflare که همزمان این‌ها را جواب می‌دهد:

- سایت/فرانت (فایل‌های استاتیک Next در `public/web`)
- API کسب‌وکار Django (`/api/...`, `/admin/`)
- سرویس AI/پشتیبانی FastAPI (`/api/v1/...` و WebSocket)

مستندات رسمی Runflare:
- اتصال GitHub: https://runflare.com/docs/ci-cd-setup/how-to-add-github/
- Static/Media: https://runflare.com/docs/load-django-css-images/
- Migrate: https://runflare.com/docs/اجرای-migrations-در-جنگو/

---

## کارهایی که من در کد آماده کردم

1. ASGI واحد (`backend/django/core/asgi.py`) — FastAPI روی `/api/v1`
2. مسیرهای `public/static` و `public/media` برای دیسک Runflare
3. سرو فرانت از Django (`core/spa.py`)
4. `manage.py` و `requirements.txt` در ریشه ریپو
5. اسکریپت استارت: `deploy/runflare/start.sh`
6. نمونه env: `deploy/runflare/env.django.example`

---

## کارهایی که خودت مرحله‌به‌مرحله انجام بده

### مرحله ۱ — مطمئن شو کد روی گیت‌هاب است

روی لپ‌تاپ:

1. تغییرات دیپلوی را کامیت و پوش کن روی برنچی که می‌خواهی دیپلوی شود (`stage` یا `develope`).
2. ریپو: `https://github.com/nazaninabaspoor/mardekuhestan.git`

اگر لازم بود بگو تا من کامیت را برایت بسازم.

### مرحله ۲ — در Runflare سرویس‌ها را چک کن

داخل همان پروژه‌ای که ساختی:

1. یک سرویس **Django** (همین هاست اصلی)
2. یک سرویس **PostgreSQL** (حتماً)
3. ترجیحاً یک سرویس **Redis** (برای چت/کش/Celery؛ اگر هنوز نداری بعداً هم می‌شود)

منابع پروژه را بین Django و Postgres تقسیم کن (طبق راهنمای خود Runflare).

### مرحله ۳ — دیسک `public` بساز

روی سرویس Django:

1. دیسک جدید بساز
2. مسیر را دقیقاً این بگذار: `/app/public`
3. این برای عکس‌ها، فایل‌های static ادمین، و فرانت لازم است

### مرحله ۴ — متغیرهای محیطی را پر کن

1. فایل `deploy/runflare/env.django.example` را باز کن
2. مقادیر را از پنل Postgres/Redis کپی کن
3. یک `SECRET_KEY` بلند و تصادفی بساز
4. `JWT_SECRET` را **همان** `SECRET_KEY` بگذار (توکن لاگین برای FastAPI)
5. همه را در پنل Runflare → متغیرهای محیطی سرویس Django بچسبان

دامنه را اگر هنوز وصل نکردی، موقتاً همان دامنه موقت Runflare را در `ALLOWED_HOSTS` بگذار.

### مرحله ۵ — سرویس را به GitHub وصل کن

طبق مستند Runflare:

1. مدیریت سرویس Django → اتصال به مخزن گیت / GitHub
2. آدرس ریپو را بگذار
3. برنچ: `stage` (پیشنهادی) یا `develope`
4. اگر ریپو private است، توکن GitHub با دسترسی `repo` بساز و وارد کن
5. روی کامیت مدنظر **Revert/Deploy** بزن
6. تیک **دریافت خودکار (auto pull)** را اگر می‌خواهی بعد از هر push آپدیت شود فعال کن

### رفع خطای `ValueError: Empty module name`

علت رایج: `wsgi.py` در ریشه ریپو باعث می‌شود رانفلر نام پکیج را خالی بگذارد و بزند `gunicorn :application`.

الان پکیج استاندارد این است: `koohestan/wsgi.py`

در env حتماً:

```
DJANGO_SETTINGS_MODULE=core.settings
DJANGO_WSGI_MODULE=koohestan.wsgi
WSGI_MODULE=koohestan.wsgi
```

اگر فیلد «تغییر اپلیکیشن» دیدی، نام پروژه/ماژول را بگذار: `koohestan`

اگر Start Command داشتی:

```
bash /app/start.sh
```

یا:

```
gunicorn koohestan.wsgi:application --bind 0.0.0.0:80 --workers 2 --timeout 120
```

### دامنه فعلی

`koohestanesepid.com` (دیگر mardekuhestan.com نیست) — ALLOWED_HOSTS و CORS را با همین دامنه پر کن.

### مرحله ۶ — دستور استارت / روت پروژه

**مهم:** مسیر ریشه (Root) سرویس را روی **ریشه ریپو** بگذار (جایی که `manage.py` و `wsgi.py` و `requirements.txt` هستند)، نه `backend/django`.

اگر پنل جایی برای Start Command دارد، این را بگذار:

```bash
bash deploy/runflare/start.sh
```

فایل `requirements.txt` ریشه باید لیست کامل پکیج‌ها باشد (نه `-r ...`) تا بیلد Runflare گیر نکند.

بعد از بالا آمدن، در ترمینال سرویس یک‌بار چک کن:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

(اگر `start.sh` درست اجرا شود، migrate و collectstatic خودش زده می‌شود.)

### مرحله ۷ — دامنه

1. دامنه `mardekuhestan.com` را در Runflare اضافه کن
2. به سرویس Django وصلش کن
3. DNS را طبق پنل تنظیم کن
4. بعد از HTTPS، env را با دامنه نهایی یکسان کن و یک‌بار ری‌دیپلوی بزن

### مرحله ۸ — فرانت (سایت ظاهری)

هاست Django پایتون است؛ Next را باید **قبل از دیپلوی** به صورت استاتیک بسازی و داخل `backend/django/public/web` بگذاری:

روی ویندوز:

```powershell
cd C:\Users\kamyar\Desktop\MardeKoohestan
.\deploy\runflare\build-frontend.ps1 -SiteUrl "https://mardekuhestan.com"
```

بعد فایل‌های ساخته‌شده را کامیت/پوش کن (یا با CLI آپلود کن).

**نکته صادقانه:** بعضی صفحات مجله الان `force-dynamic` هستند و ممکن است در export استاتیک گیر کنند. اگر بیلد خطا داد، بگو تا همان صفحات را برای حالت دیپلوی درست کنم. تا قبل از آن، بک‌اند و `/admin` و `/api` باید بالا باشند.

### مرحله ۹ — تست سریع بعد از بالا آمدن

1. `https://دامنه‌ات/admin/` باز شود
2. `https://دامنه‌ات/api/v1/health` (یا مسیر health FastAPI) جواب بدهد
3. لاگین ادمین و یک محصول در پنل
4. بعد از بیلد فرانت: صفحه اصلی سایت

---

## ترتیب پیشنهادی همین امروز

1. پوش کد روی گیت‌هاب
2. Postgres + دیسک `/app/public` + env
3. وصل GitHub و دیپلوی
4. migrate + superuser
5. تست admin/api
6. بعدش بیلد فرانت

اگر جایی از پنل Runflare گیر کردی (اسکرین)، بفرست تا دقیق بگویم کجا کلیک کنی.
