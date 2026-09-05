"""نماهای API برای سبد خرید و سفارش‌ها — مرد کوهستان."""

from __future__ import annotations

import datetime
from django.db import transaction
from rest_framework import status
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
from sec.ownership import acting_user


def _get_or_create_user_cart(user) -> Cart:
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def _seed_demo_orders_for_user(user):
    """ایجاد سفارش‌های پیش‌فرض شناسنامه مرتع در صورتی که کاربر سفارشی نداشته باشد."""
    if Order.objects.filter(user=user).exists():
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
        product_image="/brand/home-meat.png",
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

        item.quantity = serializer.validated_data["quantity"]
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


class UserOrdersListView(APIView):
    """فهرست سفارش‌های کاربر (سفارش‌های قبلی شناسنامه مرتع و جدید)."""

    permission_classes = [IsCustomerOrStaff]

    def get(self, request):
        user = acting_user(request)
        _seed_demo_orders_for_user(user)

        orders = Order.objects.filter(user=user).prefetch_related("items").order_by("-created_at")
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


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
    """ثبت نهایی سفارش و تبدیل سبد خرید به یک سفارش واقعی در دیتابیس."""

    permission_classes = [IsCustomerOrStaff]

    @transaction.atomic
    def post(self, request):
        user = acting_user(request)
        cart = _get_or_create_user_cart(user)
        cart_items = list(cart.items.all())

        if not cart_items:
            return Response(
                {"detail": "سبد خرید شما خالی است و نمی‌توانید سفارشی ثبت کنید."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid()
        data = serializer.validated_data

        receiver_name = data.get("receiver_name") or getattr(user, "customer_profile", None) and user.customer_profile.display_name or "همسفر گرامی"
        receiver_phone = data.get("receiver_phone") or getattr(user, "customer_profile", None) and user.customer_profile.phone or "۰۹۳۷۹۱۴۶۱۳۰"
        shipping_address = data.get("shipping_address") or "تهران، زعفرانیه، خیابان آصف، کوچه رز، پلاک ۱۲"

        total_amount = cart.total_price_toman
        discount_amount = 40000 if total_amount >= 500000 else 0
        final_amount = max(0, total_amount - discount_amount)

        now_str = datetime.datetime.now().strftime("%d شهریور ۱۴۰۵ - %H:%M")

        new_order = Order.objects.create(
            user=user,
            status=Order.Status.PROCESSING,
            pasture_name="مرتع ییلاقی اختصاصی البرز مرکزی",
            altitude="۲,۴۰۰ متر از سطح دریا",
            grazing_info="پوشش گیاهی بکر کوهستان و تغذیه ارگانیک",
            vet_code="IR-99210 نظام دامپزشکی",
            pack_date=now_str,
            temperature_log="۲.۴°C (کنترل‌شده در زنجیره سرد)",
            receiver_name=receiver_name,
            receiver_phone=receiver_phone,
            shipping_address=shipping_address,
            total_amount_toman=total_amount,
            discount_amount_toman=discount_amount,
            final_amount_toman=final_amount,
        )

        for ci in cart_items:
            OrderItem.objects.create(
                order=new_order,
                product_name=f"{ci.product_name} ({ci.portion})",
                product_image=ci.product_image,
                cut_type=ci.cut_type,
                portion=ci.portion,
                unit_price_toman=ci.unit_price_toman,
                quantity=ci.quantity,
                total_price_toman=ci.total_price_toman,
            )

        # تخلیه سبد خرید بعد از ثبت موفق
        cart.items.all().delete()

        order_serializer = OrderSerializer(new_order)
        return Response(
            {
                "message": f"سفارش شما با موفقیت ثبت شد و شناسه پیگیری #{new_order.order_number} تخصیص یافت.",
                "order": order_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )
