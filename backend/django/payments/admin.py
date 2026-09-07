from django.contrib import admin
from unfold.admin import ModelAdmin

from payments.models import Payment


@admin.register(Payment)
class PaymentAdmin(ModelAdmin):
    list_display = ("public_id", "user", "gateway", "status", "amount_toman", "sandbox", "order", "created_at")
    list_filter = ("gateway", "status", "sandbox")
    search_fields = ("public_id", "user__email", "authority", "ref_id")
    raw_id_fields = ("user", "order")
    readonly_fields = ("public_id", "created_at", "updated_at")
