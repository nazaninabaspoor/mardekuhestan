from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline

from accounts.models import CustomerAddress, CustomerProfile


class CustomerAddressInline(TabularInline):
    model = CustomerAddress
    extra = 0
    fields = ("title", "address_type", "city", "district", "address_line", "is_default")


@admin.register(CustomerProfile)
class CustomerProfileAdmin(ModelAdmin):
    list_display = ("user", "display_name", "phone", "email_verified", "updated_at")
    search_fields = ("user__email", "user__username", "display_name", "phone")
    list_filter = ("email_verified",)
    raw_id_fields = ("user",)
    list_fullwidth = True


@admin.register(CustomerAddress)
class CustomerAddressAdmin(ModelAdmin):
    list_display = (
        "title",
        "user",
        "address_type",
        "city",
        "district",
        "receiver_name",
        "receiver_phone",
        "is_default",
        "updated_at",
    )
    list_filter = ("address_type", "is_default", "city")
    search_fields = (
        "title",
        "user__email",
        "user__username",
        "city",
        "district",
        "address_line",
        "receiver_name",
        "receiver_phone",
        "postal_code",
    )
    raw_id_fields = ("user",)
    list_fullwidth = True
