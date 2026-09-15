"""سریالایزرهای سفارش و سبد خرید — مرد کوهستان."""

from __future__ import annotations

from rest_framework import serializers

from orders.models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    total_price_toman = serializers.IntegerField(read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product_id",
            "product_name",
            "product_image",
            "portion",
            "cut_type",
            "unit_price_toman",
            "quantity",
            "total_price_toman",
            "created_at",
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items_count = serializers.IntegerField(read_only=True)
    total_price_toman = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "total_items_count",
            "total_price_toman",
            "updated_at",
        ]


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.CharField(required=False, allow_blank=True, default="")
    product_name = serializers.CharField(max_length=255)
    product_image = serializers.CharField(required=False, allow_blank=True, default="/brand/home-meat.png")
    portion = serializers.CharField(required=False, allow_blank=True, default="۱ کیلوگرم")
    cut_type = serializers.CharField(required=False, allow_blank=True, default="برش استاندارد")
    unit_price_toman = serializers.IntegerField(min_value=0)
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "product_image",
            "cut_type",
            "portion",
            "unit_price_toman",
            "quantity",
            "total_price_toman",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "status_display",
            "pasture_name",
            "altitude",
            "grazing_info",
            "vet_code",
            "pack_date",
            "temperature_log",
            "receiver_name",
            "receiver_phone",
            "shipping_address",
            "delivery_notice",
            "total_amount_toman",
            "discount_amount_toman",
            "final_amount_toman",
            "created_at",
            "items",
        ]


class CheckoutSerializer(serializers.Serializer):
    receiver_name = serializers.CharField(required=False, allow_blank=True, default="")
    receiver_phone = serializers.CharField(required=False, allow_blank=True, default="")
    shipping_address = serializers.CharField(required=False, allow_blank=True, default="")
