"""ثبت سفارش از سبد خرید — مرد کوهستان."""

from __future__ import annotations

import datetime

from django.core.exceptions import ValidationError
from django.db import transaction

from orders.models import Cart, Order, OrderItem


def _get_or_create_user_cart(user) -> Cart:
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


@transaction.atomic
def fulfill_cart_as_order(
    user,
    *,
    receiver_name: str = "",
    receiver_phone: str = "",
    shipping_address: str = "",
    status: str = Order.Status.CONFIRMED,
) -> Order:
    cart = _get_or_create_user_cart(user)
    cart_items = list(cart.items.all())
    if not cart_items:
        raise ValidationError("سبد خرید شما خالی است و نمی‌توانید سفارشی ثبت کنید.")

    profile = getattr(user, "customer_profile", None)
    name = receiver_name or (getattr(profile, "display_name", "") if profile else "") or "همسفر گرامی"
    phone = receiver_phone or (getattr(profile, "phone", "") if profile else "") or ""
    address = shipping_address or "تهران"

    total_amount = cart.total_price_toman
    shipping = 0 if total_amount >= 500000 else 40000
    discount_amount = 0
    final_amount = total_amount + shipping
    now_str = datetime.datetime.now().strftime("%d شهریور ۱۴۰۵ - %H:%M")

    new_order = Order.objects.create(
        user=user,
        status=status,
        pasture_name="مرتع ییلاقی اختصاصی البرز مرکزی",
        altitude="۲,۴۰۰ متر از سطح دریا",
        grazing_info="پوشش گیاهی بکر کوهستان و تغذیه ارگانیک",
        vet_code="IR-99210 نظام دامپزشکی",
        pack_date=now_str,
        temperature_log="۲.۴°C (کنترل‌شده در زنجیره سرد)",
        receiver_name=name,
        receiver_phone=phone,
        shipping_address=address,
        total_amount_toman=total_amount,
        discount_amount_toman=discount_amount,
        final_amount_toman=final_amount,
    )

    for item in cart_items:
        OrderItem.objects.create(
            order=new_order,
            product_name=f"{item.product_name} ({item.portion})",
            product_image=item.product_image,
            cut_type=item.cut_type,
            portion=item.portion,
            unit_price_toman=item.unit_price_toman,
            quantity=item.quantity,
            total_price_toman=item.total_price_toman,
        )

    cart.items.all().delete()
    return new_order
