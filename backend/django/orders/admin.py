"""تنظیمات پنل مدیریت سفارش‌ها و سبد خرید — مرد کوهستان."""

from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline

from orders.models import Cart, CartItem, Order, OrderItem


class CartItemInline(TabularInline):
    model = CartItem
    extra = 0
    fields = (
        "product_name",
        "portion",
        "cut_type",
        "unit_price_toman",
        "quantity",
        "total_price_toman",
    )
    readonly_fields = ("total_price_toman",)


@admin.register(Cart)
class CartAdmin(ModelAdmin):
    list_display = ("user", "total_items_count", "total_price_toman", "updated_at")
    search_fields = ("user__email", "user__username", "user__customer_profile__phone")
    inlines = [CartItemInline]
    raw_id_fields = ("user",)
    list_fullwidth = True


class OrderItemInline(TabularInline):
    model = OrderItem
    extra = 0
    fields = (
        "product_name",
        "portion",
        "cut_type",
        "unit_price_toman",
        "quantity",
        "total_price_toman",
    )


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    """همهٔ وضعیت‌های سفارش در لیست دیده می‌شوند؛ فیلتر وضعیت اختیاری است."""

    list_display = (
        "order_number",
        "colored_status",
        "buyer_profile_name",
        "buyer_account_email",
        "buyer_profile_phone",
        "receiver_name",
        "receiver_phone",
        "final_amount_toman",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "order_number",
        "user__email",
        "user__username",
        "user__customer_profile__display_name",
        "user__customer_profile__phone",
        "receiver_name",
        "receiver_phone",
        "shipping_address",
        "pasture_name",
    )
    list_fullwidth = True
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    raw_id_fields = ("user",)
    inlines = [OrderItemInline]
    readonly_fields = (
        "order_number",
        "buyer_profile_name",
        "buyer_account_email",
        "buyer_profile_phone",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        (
            "وضعیت و شماره",
            {
                "fields": ("order_number", "status", "user"),
            },
        ),
        (
            "پروفایل خریدار (از حساب کاربری)",
            {
                "fields": (
                    "buyer_profile_name",
                    "buyer_account_email",
                    "buyer_profile_phone",
                ),
            },
        ),
        (
            "تحویل",
            {
                "fields": (
                    "receiver_name",
                    "receiver_phone",
                    "shipping_address",
                    "delivery_notice",
                ),
            },
        ),
        (
            "مبالغ",
            {
                "fields": (
                    "total_amount_toman",
                    "discount_amount_toman",
                    "final_amount_toman",
                ),
            },
        ),
        (
            "اصالت مرتع",
            {
                "classes": ("collapse",),
                "fields": (
                    "pasture_name",
                    "altitude",
                    "grazing_info",
                    "vet_code",
                    "pack_date",
                    "temperature_log",
                ),
            },
        ),
        (
            "زمان",
            {
                "fields": ("created_at", "updated_at"),
            },
        ),
    )

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("user", "user__customer_profile")
            .prefetch_related("items")
        )

    @admin.display(description="وضعیت", ordering="status")
    def colored_status(self, obj: Order):
        colors = {
            Order.Status.PENDING: "#BE6516",
            Order.Status.CONFIRMED: "#005B48",
            Order.Status.PROCESSING: "#204078",
            Order.Status.SHIPPING: "#204078",
            Order.Status.DELIVERED: "#50AF47",
            Order.Status.CANCELLED: "#861309",
        }
        color = colors.get(obj.status, "#1D1D1B")
        return format_html(
            '<span style="font-weight:700;color:{};">{}</span>',
            color,
            obj.get_status_display(),
        )

    @admin.display(description="نام پروفایل")
    def buyer_profile_name(self, obj: Order) -> str:
        profile = getattr(obj.user, "customer_profile", None)
        name = (getattr(profile, "display_name", "") or "").strip()
        return name or obj.receiver_name or "—"

    @admin.display(description="ایمیل حساب")
    def buyer_account_email(self, obj: Order) -> str:
        return (obj.user.email or obj.user.get_username() or "—").strip()

    @admin.display(description="موبایل پروفایل")
    def buyer_profile_phone(self, obj: Order) -> str:
        profile = getattr(obj.user, "customer_profile", None)
        phone = (getattr(profile, "phone", "") or "").strip()
        return phone or obj.receiver_phone or "—"
