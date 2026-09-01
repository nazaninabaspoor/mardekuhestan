"""ورودی/خروجی API حساب — متن ساده."""

from __future__ import annotations

from rest_framework import serializers

from accounts.constants import DISPLAY_NAME_MAX_LENGTH, PASSWORD_MIN_LENGTH
from accounts.selectors import get_or_create_profile


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=PASSWORD_MIN_LENGTH)
    password_repeat = serializers.CharField(write_only=True)
    name = serializers.CharField(max_length=DISPLAY_NAME_MAX_LENGTH)
    phone = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if attrs["password"] != attrs["password_repeat"]:
            raise serializers.ValidationError(
                {"password_repeat": "دو رمز یکی نیستند."}
            )
        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=False, allow_blank=True, default="")
    username = serializers.CharField(required=False, allow_blank=True, default="")
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        ident = (attrs.get("email") or attrs.get("username") or "").strip()
        if not ident:
            raise serializers.ValidationError({"email": "ایمیل را بنویسید."})
        attrs["email"] = ident
        return attrs


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False, allow_blank=True, default="")


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=PASSWORD_MIN_LENGTH)
    new_password_repeat = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_repeat"]:
            raise serializers.ValidationError(
                {"new_password_repeat": "دو رمز یکی نیستند."}
            )
        return attrs


class ProfileUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=DISPLAY_NAME_MAX_LENGTH, required=False)
    phone = serializers.CharField(required=False, allow_blank=True)


class UserMeSerializer(serializers.Serializer):
    def to_representation(self, user):
        profile = get_or_create_profile(user)
        return {
            "id": user.pk,
            "email": user.email,
            "name": profile.display_name or user.first_name or "",
            "phone": profile.phone or "",
            "email_verified": profile.email_verified,
            "is_staff": bool(user.is_staff),
        }
