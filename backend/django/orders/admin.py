"""تنظیمات پنل مدیریت سفارش‌ها و سبد خرید — مرد کوهستان."""

from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline

from orders.models import Cart, CartItem, Order, OrderItem


class CartItemInline(TabularInline):
    model = CartItem
    extra = 0
    fields = ("product_name", "portion", "cut_type", "unit_price_toman", "quantity", "total_price_toman")
    readonly_fields = ("total_price_toman",)


@admin.register(Cart)
class CartAdmin(ModelAdmin):
    list_display = ("user", "total_items_count", "total_price_toman", "updated_at")
    search_fields = ("user__email", "user__username")
    inlines = [CartItemInline]
    raw_id_fields = ("user",)
    list_fullwidth = True


class OrderItemInline(TabularInline):
    model = OrderItem
    extra = 0
    fields = ("product_name", "portion", "cut_type", "unit_price_toman", "quantity", "total_price_toman")


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = (
        "order_number",
        "user",
        "status",
        "pasture_name",
        "final_amount_toman",
        "receiver_phone",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "order_number",
        "user__email",
        "user__username",
        "receiver_name",
        "receiver_phone",
        "pasture_name",
    )
    inlines = [OrderItemInline]
    raw_id_fields = ("user",)
    list_fullwidth = True
