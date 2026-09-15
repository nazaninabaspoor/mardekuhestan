"""پیکربندی سطح Senior برای Gunicorn / Uvicorn در محیط Production.

استراتژی‌های قطعی برای جلوگیری از OOM و Nginx 502:
1. استفاده از max_requests و max_requests_jitter: هر ورکر پس از پردازش حدود ۱۰۰۰ درخواست، بدون Downtime ریستارت می‌شود تا هرگونه نشت حافظه (Memory Leak) پایتون پاکسازی شود و هرگز سرور با کمبود رم (OOM-Killer) مواجه نشود.
2. تعیین دقیق worker_class و تعداد threads: ترکیب فرآیندها و تردها (gthread) برای هندل همزمان هزاران کانکشن I/O بدون اشغال رم اضافه.
3. تنظیم دقیق timeout و graceful_timeout: جلوگیری از قفل شدن ورکرها روی کوئری‌های بی‌پایان.
"""

import multiprocessing
import os

# آدرس و پورت اتصال به Nginx (ترجیحاً Unix Domain Socket برای سرعت بالاتر)
bind = os.getenv("GUNICORN_BIND", "127.0.0.1:8000")

# فرمول مهندسی محاسبه تعداد ورکرها بر اساس هسته‌های پردازنده
cpu_count = multiprocessing.cpu_count()
workers = int(os.getenv("GUNICORN_WORKERS", (2 * cpu_count) + 1))

# تعداد تردهای هر ورکر برای همزمانی بالا
threads = int(os.getenv("GUNICORN_THREADS", 3))
worker_class = "gthread"

# ---------------------------------------------------------------------------
# مهار نشت حافظه و پیشگیری قطعی از OOM-Killer
# ---------------------------------------------------------------------------
max_requests = 1000
max_requests_jitter = 100

# ---------------------------------------------------------------------------
# مهلت‌های زمانی و پیشگیری از خطای ۵۰۲
# ---------------------------------------------------------------------------
timeout = 30           # اگر پردازش درخواستی بیش از ۳۰ ثانیه طول کشید، ورکر ریستارت شود
graceful_timeout = 30  # مهلت به اتمام رسیدن درخواست‌های جاری قبل از خاموشی ورکر
keepalive = 5          # زنده نگه داشتن کانکشن‌های بین Nginx و Gunicorn

# ظرفیت صف درخواست‌های در انتظار پشت سرور
backlog = 2048

# ---------------------------------------------------------------------------
# لاگ‌ها و رصد سیستم
# ---------------------------------------------------------------------------
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" (took %(L)ss)'


def on_starting(server):
    server.log.info("Starting Marde Kuhestan Gunicorn Server with %d workers and %d threads per worker", workers, threads)


def worker_int(worker):
    worker.log.warning("Worker received INT or QUIT signal (pid: %s)", worker.pid)


def worker_abort(worker):
    worker.log.error("Worker ABORTED due to timeout/deadlock (pid: %s)", worker.pid)
