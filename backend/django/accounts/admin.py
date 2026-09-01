from django.contrib import admin
from unfold.admin import ModelAdmin

from accounts.models import CustomerProfile


@admin.register(CustomerProfile)
class CustomerProfileAdmin(ModelAdmin):
    list_display = ("user", "display_name", "phone", "email_verified", "updated_at")
    search_fields = ("user__email", "user__username", "display_name", "phone")
    list_filter = ("email_verified",)
    raw_id_fields = ("user",)
    list_fullwidth = True
