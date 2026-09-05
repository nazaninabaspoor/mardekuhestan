"""مسیرهای API اپلیکیشن سفارش‌ها — مرد کوهستان."""

from django.urls import path

from orders.views import (
    CartAddItemView,
    CartItemDetailView,
    CartView,
    CheckoutOrderView,
    OrderDetailView,
    UserOrdersListView,
)

app_name = "orders"

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/add/", CartAddItemView.as_view(), name="cart-add"),
    path("cart/items/<int:item_id>/", CartItemDetailView.as_view(), name="cart-item-detail"),
    path("checkout/", CheckoutOrderView.as_view(), name="checkout"),
    path("", UserOrdersListView.as_view(), name="orders-list"),
    path("<str:order_number>/", OrderDetailView.as_view(), name="order-detail"),
]
