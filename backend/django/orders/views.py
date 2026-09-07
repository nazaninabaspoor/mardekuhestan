"""نماهای API برای سبد خرید و سفارش‌ها — مرد کوهستان."""

from __future__ import annotations

import datetime
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCustomerOrStaff
from orders.models import Cart, CartItem, Order, OrderItem
from orders.serializers import (
    AddToCartSerializer,
    CartSerializer,
    CheckoutSerializer,
    OrderSerializer,
    UpdateCartItemSerializer,
)
from orders.services import fulfill_cart_as_order
from sec.ownership import acting_user


def resolve_product_image(name: str, current_image: str = "") -> str:
    """تشخیص و اختصاص تصویر دقیق و متناسب با ماهیت واقعی کالا."""
    n = (name or "").lower()
    if "عسل" in n or "کندو" in n or "honey" in n:
        return "/brand/home-ready.png"
    if "پنیر" in n or "cheese" in n:
        return "/brand/panir.png"
    if any(w in n for w in ["کره", "روغن", "ماست", "دوغ", "شیر", "لبنیات", "dairy"]):
        return "/brand/home-dairy.png"
    if any(w in n for w in ["ماهی", "قزل", "میگو", "آبزیان", "fish"]):
        return "/brand/mahi.png"
    if any(w in n for w in ["راسته", "فیله", "ماهیچه", "شقه", "گوشت", "بره", "گوساله", "گوسفند", "پروتئین", "قلوه‌گاه", "سردست"]):
        return "/brand/goosht.png"
    if current_image and current_image != "/brand/home-meat.png" and current_image.startswith("/"):
        return current_image
    return "/brand/goosht.png"


def _get_or_create_user_cart(user) -> Cart:
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def _seed_demo_orders_for_user(user):
    """ایجاد یا به‌روزرسانی سفارش‌های پیش‌فرض شناسنامه مرتع با تصاویر و داده‌های دقیق."""
    existing_orders = Order.objects.filter(user=user)
    if existing_orders.exists():
        # به‌روزرسانی هوشمند تصاویر اقلام سفارش‌های قبلی در دیتابیس
        for o in existing_orders:
            for item in o.items.all():
                correct_img = resolve_product_image(item.product_name, item.product_image)
                if item.product_image != correct_img:
                    item.product_image = correct_img
                    item.save(update_fields=["product_image"])
        return

    # سفارش اول (کلاردشت)
    o1 = Order.objects.create(
        order_number="MK-94021",
        user=user,
        status=Order.Status.DELIVERED,
        pasture_name="مرتع ییلاقی کلاردشت (دامنه مازیچال)",
        altitude="۲,۲۰۰ متر از سطح دریا",
        grazing_info="علوفه وحشی کوهپایه و آویشن ارگانیک",
        vet_code="IR-88301 نظام دامپزشکی",
        pack_date="۱۰ شهریور ۱۴۰۵ - ۰۶:۳۰",
        temperature_log="۲.۴°C (زنجیره سرد کنترل‌شده)",
        receiver_name=getattr(user, "customer_profile", None) and user.customer_profile.display_name or "همسفر مرد کوهستان",
        receiver_phone=getattr(user, "customer_profile", None) and user.customer_profile.phone or "۰۹۳۷۹۱۴۶۱۳۰",
        shipping_address="تهران، زعفرانیه، خیابان آصف، کوچه رز، پلاک ۱۲",
        total_amount_toman=770000,
        discount_amount_toman=40000,
        final_amount_toman=730000,
    )
    OrderItem.objects.create(
        order=o1,
        product_name="راسته بره مرتعی تازه (۱ کیلوگرم)",
        product_image="/brand/goosht.png",
        cut_type="برش قصابی استریل · بدون چربی اضافه",
        portion="۱ کیلوگرم",
        unit_price_toman=530000,
        quantity=1,
        total_price_toman=530000,
    )
    OrderItem.objects.create(
        order=o1,
        product_name="کره سنتی خالص کوهپایه (۵۰۰ گرم)",
        product_image="/brand/home-dairy.png",
        cut_type="فرآوری ییلاقی با مشک سنتی",
        portion="۵۰۰ گرم",
        unit_price_toman=240000,
        quantity=1,
        total_price_toman=240000,
    )

    # سفارش دوم (هزارجریب)
    o2 = Order.objects.create(
        order_number="MK-91823",
        user=user,
        status=Order.Status.DELIVERED,
        pasture_name="مرتع هزارجریب البرز شرقی",
        altitude="۲,۵۰۰ متر از سطح دریا",
        grazing_info="گیاهان دارویی، کاسنی و پونه کوهی",
        vet_code="IR-91802 نظام دامپزشکی",
        pack_date="۲۸ مرداد ۱۴۰۵ - ۰۵:۴۵",
        temperature_log="۲.۲°C (زنجیره سرد کنترل‌شده)",
        receiver_name=getattr(user, "customer_profile", None) and user.customer_profile.display_name or "همسفر مرد کوهستان",
        receiver_phone=getattr(user, "customer_profile", None) and user.customer_profile.phone or "۰۹۳۷۹۱۴۶۱۳۰",
        shipping_address="تهران، زعفرانیه، خیابان آصف، کوچه رز، پلاک ۱۲",
        total_amount_toman=950000,
        discount_amount_toman=50000,
        final_amount_toman=900000,
    )
    OrderItem.objects.create(
        order=o2,
        product_name="ماهیچه بره تازه ییلاقی (۱.۵ کیلوگرم)",
        product_image="/brand/goosht.png",
        cut_type="برش پاک‌شده استریل مجلسی",
        portion="۱.۵ کیلوگرم",
        unit_price_toman=650000,
        quantity=1,
        total_price_toman=650000,
    )
    OrderItem.objects.create(
        order=o2,
        product_name="روغن زرد حیوانی دست‌ساز (۱ کیلوگرم)",
        product_image="/brand/home-dairy.png",
        cut_type="عطر خالص کوهپایه مازندران",
        portion="۱ کیلوگرم",
        unit_price_toman=300000,
        quantity=1,
        total_price_toman=300000,
    )

    # سفارش سوم (سبلان)
    o3 = Order.objects.create(
        order_number="MK-88712",
        user=user,
        status=Order.Status.DELIVERED,
        pasture_name="دامنه‌های سبلان و آبگرم سرعین",
        altitude="۲,۸۰۰ متر از سطح دریا",
        grazing_info="گون و آویشن کوهستانی سبلان",
        vet_code="IR-77412 نظام دامپزشکی",
        pack_date="۱۵ مرداد ۱۴۰۵ - ۰۶:۰۰",
        temperature_log="۲.۱°C (زنجیره سرد کنترل‌شده)",
        receiver_name=getattr(user, "customer_profile", None) and user.customer_profile.display_name or "همسفر مرد کوهستان",
        receiver_phone=getattr(user, "customer_profile", None) and user.customer_profile.phone or "۰۹۳۷۹۱۴۶۱۳۰",
        shipping_address="تهران، زعفرانیه، خیابان آصف، کوچه رز، پلاک ۱۲",
        total_amount_toman=1150000,
        discount_amount_toman=60000,
        final_amount_toman=1090000,
    )
    OrderItem.objects.create(
        order=o3,
        product_name="عسل خام صخره‌ای سبلان (۱ کیلوگرم)",
        product_image="/brand/home-ready.png",
        cut_type="برداشت مستقیم کندوهای ییلاق",
        portion="۱ کیلوگرم",
        unit_price_toman=490000,
        quantity=1,
        total_price_toman=490000,
    )
    OrderItem.objects.create(
        order=o3,
        product_name="پنیر کوزه‌ای کهنه کوهستان (۱ کیلوگرم)",
        product_image="/brand/panir.png",
        cut_type="رسیده در غارهای طبیعی سرعین",
        portion="۱ کیلوگرم",
        unit_price_toman=660000,
        quantity=1,
        total_price_toman=660000,
    )


class CartView(APIView):
    """دریافت محتویات سبد خرید کاربر یا پاک کردن کامل آن."""

    permission_classes = [IsCustomerOrStaff]

    def get(self, request):
        user = acting_user(request)
        cart = _get_or_create_user_cart(user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def delete(self, request):
        user = acting_user(request)
        cart = _get_or_create_user_cart(user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartAddItemView(APIView):
    """افزودن کالا به سبد خرید کاربر (AJAX بدون بارگذاری مجدد صفحه)."""

    permission_classes = [IsCustomerOrStaff]

    def post(self, request):
        user = acting_user(request)
        cart = _get_or_create_user_cart(user)

        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        product_name = data["product_name"]
        portion = data.get("portion", "۱ کیلوگرم")
        cut_type = data.get("cut_type", "برش استاندارد")
        unit_price = data["unit_price_toman"]
        quantity = data.get("quantity", 1)
        product_image = data.get("product_image", "/brand/home-meat.png")
        product_id = data.get("product_id", "")

        # بررسی وجود قلم مشابه در سبد
        existing_item = cart.items.filter(
            product_name=product_name,
            portion=portion,
            cut_type=cut_type,
        ).first()

        if existing_item:
            existing_item.quantity += quantity
            existing_item.unit_price_toman = unit_price
            existing_item.save()
        else:
            CartItem.objects.create(
                cart=cart,
                product_id=product_id,
                product_name=product_name,
                product_image=product_image,
                portion=portion,
                cut_type=cut_type,
                unit_price_toman=unit_price,
                quantity=quantity,
            )

        cart_serializer = CartSerializer(cart)
        return Response(
            {
                "message": f"«{product_name}» با موفقیت به سبد خرید اضافه شد.",
                "cart": cart_serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class CartItemDetailView(APIView):
    """ویرایش تعداد یا حذف یک قلم از سبد خرید."""

    permission_classes = [IsCustomerOrStaff]

    def patch(self, request, item_id: int):
        user = acting_user(request)
        cart = _get_or_create_user_cart(user)
        item = cart.items.filter(id=item_id).first()
        if not item:
            return Response({"detail": "قلم مورد نظر در سبد خرید یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateCartItemSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        qty = serializer.validated_data["quantity"]
        if qty <= 0:
            item.delete()
        else:
            item.quantity = qty
            item.save()

        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)

    def delete(self, request, item_id: int):
        user = acting_user(request)
        cart = _get_or_create_user_cart(user)
        item = cart.items.filter(id=item_id).first()
        if not item:
            return Response({"detail": "قلم مورد نظر در سبد خرید یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)


class OrderListPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = None
    max_page_size = 15


class UserOrdersListView(APIView):
    """فهرست سفارش‌های واقعی کاربر — هر صفحه ۱۵ خرید کامل."""

    permission_classes = [IsCustomerOrStaff]

    def get(self, request):
        user = acting_user(request)
        orders = Order.objects.filter(user=user).prefetch_related("items").order_by("-created_at")
        paginator = OrderListPagination()
        page = paginator.paginate_queryset(orders, request, view=self)
        serializer = OrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class OrderDetailView(APIView):
    """جزئیات یک سفارش و بارنامه بر اساس شماره سفارش."""

    permission_classes = [IsCustomerOrStaff]

    def get(self, request, order_number: str):
        user = acting_user(request)
        order = Order.objects.filter(user=user, order_number=order_number).prefetch_related("items").first()
        if not order:
            return Response({"detail": "سفارش یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class CheckoutOrderView(APIView):
    """ثبت نهایی سفارش از سبد — برای جریان پرداخت استفاده می‌شود."""

    permission_classes = [IsCustomerOrStaff]

    def post(self, request):
        user = acting_user(request)
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=False)
        data = serializer.validated_data if getattr(serializer, "_validated_data", None) else {}
        try:
            new_order = fulfill_cart_as_order(
                user,
                receiver_name=data.get("receiver_name", "") if data else request.data.get("receiver_name", ""),
                receiver_phone=data.get("receiver_phone", "") if data else request.data.get("receiver_phone", ""),
                shipping_address=data.get("shipping_address", "") if data else request.data.get("shipping_address", ""),
            )
        except DjangoValidationError as exc:
            msg = exc.messages[0] if getattr(exc, "messages", None) else str(exc)
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": f"سفارش شما با موفقیت ثبت شد و شناسه پیگیری #{new_order.order_number} تخصیص یافت.",
                "order": OrderSerializer(new_order).data,
            },
            status=status.HTTP_201_CREATED,
        )
