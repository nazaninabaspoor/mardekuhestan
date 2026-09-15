from django.contrib import admin
from unfold.admin import ModelAdmin

from notifications.models import AiCoachQuota, WaitlistInterest


@admin.register(WaitlistInterest)
class WaitlistInterestAdmin(ModelAdmin):
    list_display = (
        "product_name",
        "display_name",
        "email",
        "phone",
        "user",
        "source",
        "notified_admin",
        "created_at",
    )
    list_filter = ("product_key", "source", "notified_admin", "created_at")
    search_fields = (
        "product_name",
        "product_key",
        "display_name",
        "email",
        "phone",
        "user__email",
        "user__username",
    )
    raw_id_fields = ("user",)
    readonly_fields = ("created_at",)
    list_fullwidth = True
    date_hierarchy = "created_at"
    ordering = ("-created_at",)


@admin.register(AiCoachQuota)
class AiCoachQuotaAdmin(ModelAdmin):
    list_display = (
        "user",
        "free_used",
        "paid_remaining",
        "paid_total",
        "last_payment",
        "updated_at",
    )
    search_fields = ("user__email", "user__username")
    raw_id_fields = ("user", "last_payment")
    readonly_fields = ("created_at", "updated_at")
    list_fullwidth = True
