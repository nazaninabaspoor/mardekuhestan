"""پیکربندی حرفه‌ای Celery برای پلتفرم مرد کوهستان (سطح Senior Enterprise).

ویژگی‌های کلیدی برای جلوگیری از خطاهای ۵۰۲ و OOM:
1. تفکیک صف‌ها با اولویت‌بندی (high_priority, default, low_priority).
2. بازیافت خودکار ورکرها (worker_max_tasks_per_child و worker_max_memory_per_child) برای پیشگیری قطعی از نشت حافظه و OOM.
3. غیرفعال‌سازی Prefetch حریصانه (worker_prefetch_multiplier = 1) برای توزیع متوازن بار کاری بین ورکرها.
4. تایم‌اوت‌های سخت و نرم برای جلوگیری از قفل شدن ورکرها در عملیات سنگین یا کند.
5. تضمین عدم هدررفت تسک‌ها در صورت کرش با task_acks_late و task_reject_on_worker_lost.
"""

from __future__ import annotations

import os
from celery import Celery
from celery.schedules import crontab
from kombu import Exchange, Queue

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

app = Celery("core")

# خواندن تنظیمات با پیشوند CELERY_
app.config_from_object("django.conf:settings", namespace="CELERY")

# تعریف صف‌ها و اکسچنج‌ها
default_exchange = Exchange("default", type="direct")

app.conf.task_queues = (
    Queue("high_priority", default_exchange, routing_key="high_priority"),
    Queue("default", default_exchange, routing_key="default"),
    Queue("low_priority", default_exchange, routing_key="low_priority"),
)

app.conf.task_default_queue = "default"
app.conf.task_default_exchange = "default"
app.conf.task_default_routing_key = "default"

# مسیربندی هوشمند تسک‌های تجاری پلتفرم
app.conf.task_routes = {
    # اعلان‌ها و پیامک‌های فوری در صف با اولویت بالا
    "notifications.tasks.*": {"queue": "high_priority"},
    "accounts.tasks.notify_*": {"queue": "high_priority"},
    "accounts.tasks.send_*": {"queue": "high_priority"},
    # سفارش‌ها و پرداخت‌ها در صف استاندارد
    "orders.tasks.*": {"queue": "default"},
    "payments.tasks.*": {"queue": "default"},
    "inventory.tasks.*": {"queue": "default"},
    # عملیات پس‌زمینه، ممیزی، تمیزکاری و کش در صف با اولویت پایین
    "sec.tasks.*": {"queue": "low_priority"},
    "product.tasks.*": {"queue": "low_priority"},
    "content.tasks.*": {"queue": "low_priority"},
    "accounts.tasks.cleanup_*": {"queue": "low_priority"},
    "common.tasks.*": {"queue": "default"},
}

# ---------------------------------------------------------------------------
# تنظیمات تاب‌آوری ورکرها و مهار حافظه (Anti-OOM & Anti-Starvation)
# ---------------------------------------------------------------------------

# بازیافت ورکر بعد از ۵۰۰ تسک برای آزادسازی کامل حافظه نشت‌کرده
app.conf.worker_max_tasks_per_child = 500

# سقف مصرف رم هر ورکر (حدود ۳۵۰ مگابایت)؛ بالاتر رفت خودکار جایگزین می‌شود تا OOM ندهد
app.conf.worker_max_memory_per_child = 350000

# توزیع عادلانه تسک‌ها بین پردازه‌ها بدون احتکار تسک
app.conf.worker_prefetch_multiplier = 1

# تایید تسک پس از اتمام موفق (در صورت کرش سیستم، تسک گم نمی‌شود)
app.conf.task_acks_late = True
app.conf.task_reject_on_worker_lost = True

# مهلت زمانی اجرای تسک‌ها (جلوگیری از تسک‌های بی‌پایان و اشغال ورکر)
app.conf.task_soft_time_limit = 120  # ثانیه (سیگنال نرم)
app.conf.task_time_limit = 180       # ثانیه (قطع کامل)

# ---------------------------------------------------------------------------
# زمان‌بندی تسک‌های دوره‌ای (Celery Beat Schedule)
# ---------------------------------------------------------------------------

app.conf.beat_schedule = {
    # تمیزکاری توکن‌های منقضی و لیست سیاه هر ۶ ساعت
    "cleanup-expired-tokens-every-6-hours": {
        "task": "accounts.tasks.cleanup_expired_tokens_task",
        "schedule": crontab(minute=0, hour="*/6"),
    },
    # پاکسازی رکوردهای موقت امنیتی هر ۳۰ دقیقه
    "cleanup-expired-security-jails-every-30-mins": {
        "task": "sec.tasks.cleanup_expired_security_jails_task",
        "schedule": crontab(minute="*/30"),
    },
    # گرم نگه داشتن کش محصولات پرفروش هر ۱۵ دقیقه
    "warm-catalog-cache-every-15-mins": {
        "task": "product.tasks.warm_catalog_cache_task",
        "schedule": crontab(minute="*/15"),
    },
}

# شناسایی خودکار تمام tasks.py در تمام اپ‌ها
app.autodiscover_tasks()
