from django.contrib import admin
from unfold.admin import ModelAdmin

from payments.models import Payment


@admin.register(Payment)
class PaymentAdmin(ModelAdmin):
    list_display = (
        "short_id",
        "user",
        "purpose",
        "gateway",
        "status",
        "amount_toman",
        "receiver_name",
        "receiver_phone",
        "order",
        "sandbox",
        "created_at",
    )
    list_filter = ("status", "purpose", "gateway", "sandbox", "created_at")
    search_fields = (
        "public_id",
        "user__email",
        "user__username",
        "user__customer_profile__display_name",
        "user__customer_profile__phone",
        "receiver_name",
        "receiver_phone",
        "authority",
        "ref_id",
    )
    raw_id_fields = ("user", "order")
    readonly_fields = ("public_id", "created_at", "updated_at")
    list_fullwidth = True
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user", "order", "user__customer_profile")

    @admin.display(description="شناسه", ordering="public_id")
    def short_id(self, obj: Payment) -> str:
        return str(obj.public_id)[:8]
