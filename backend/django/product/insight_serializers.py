"""ثبت رفتار و نظر محصول از فروشگاه."""

from __future__ import annotations

from rest_framework import serializers

from product.constants import (
    INSIGHT_CATEGORY_KEY_MAX_LENGTH,
    INSIGHT_COMMENT_MAX_LENGTH,
    INSIGHT_PRODUCT_KEY_MAX_LENGTH,
    INSIGHT_PRODUCT_NAME_MAX_LENGTH,
    INSIGHT_VISITOR_MAX_LENGTH,
    InsightEventType,
    OpinionMeal,
)
from product.models import ProductInsightEvent, ProductOpinion

ALLOWED_PAYLOAD_KEYS = frozenset(
    {"related_key", "related_name", "source", "rating", "meal"}
)


class InsightEventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductInsightEvent
        fields = (
            "visitor_id",
            "event_type",
            "product_key",
            "product_name",
            "category_key",
            "payload",
        )

    def validate_visitor_id(self, value: str) -> str:
        cleaned = (value or "").strip()[:INSIGHT_VISITOR_MAX_LENGTH]
        if len(cleaned) < 8:
            raise serializers.ValidationError("شناسه بازدید معتبر نیست.")
        return cleaned

    def validate_event_type(self, value: str) -> str:
        allowed = {item[0] for item in InsightEventType.CHOICES}
        if value not in allowed:
            raise serializers.ValidationError("نوع رفتار معتبر نیست.")
        return value

    def validate_product_key(self, value: str) -> str:
        cleaned = (value or "").strip()[:INSIGHT_PRODUCT_KEY_MAX_LENGTH]
        if not cleaned:
            raise serializers.ValidationError("شناسه محصول لازم است.")
        return cleaned

    def validate_product_name(self, value: str) -> str:
        cleaned = (value or "").strip()[:INSIGHT_PRODUCT_NAME_MAX_LENGTH]
        if not cleaned:
            raise serializers.ValidationError("نام محصول لازم است.")
        return cleaned

    def validate_category_key(self, value: str) -> str:
        return (value or "").strip()[:INSIGHT_CATEGORY_KEY_MAX_LENGTH]

    def validate_payload(self, value):
        if value in (None, ""):
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError("جزئیات باید شیء باشد.")
        return {
            str(key)[:32]: str(item)[:160]
            for key, item in list(value.items())[:8]
            if key in ALLOWED_PAYLOAD_KEYS
        }


class ProductOpinionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOpinion
        fields = (
            "visitor_id",
            "product_key",
            "product_name",
            "category_key",
            "rating",
            "meal",
            "comment",
        )

    def validate_visitor_id(self, value: str) -> str:
        cleaned = (value or "").strip()[:INSIGHT_VISITOR_MAX_LENGTH]
        if len(cleaned) < 8:
            raise serializers.ValidationError("شناسه بازدید معتبر نیست.")
        return cleaned

    def validate_product_key(self, value: str) -> str:
        cleaned = (value or "").strip()[:INSIGHT_PRODUCT_KEY_MAX_LENGTH]
        if not cleaned:
            raise serializers.ValidationError("شناسه محصول لازم است.")
        return cleaned

    def validate_product_name(self, value: str) -> str:
        cleaned = (value or "").strip()[:INSIGHT_PRODUCT_NAME_MAX_LENGTH]
        if not cleaned:
            raise serializers.ValidationError("نام محصول لازم است.")
        return cleaned

    def validate_category_key(self, value: str) -> str:
        return (value or "").strip()[:INSIGHT_CATEGORY_KEY_MAX_LENGTH]

    def validate_rating(self, value: int) -> int:
        if value not in {1, 2, 3, 4, 5}:
            raise serializers.ValidationError("امتیاز باید بین ۱ و ۵ باشد.")
        return value

    def validate_meal(self, value: str) -> str:
        if not value:
            return ""
        allowed = {item[0] for item in OpinionMeal.CHOICES}
        if value not in allowed:
            raise serializers.ValidationError("وعده معتبر نیست.")
        return value

    def validate_comment(self, value: str) -> str:
        return (value or "").strip()[:INSIGHT_COMMENT_MAX_LENGTH]
