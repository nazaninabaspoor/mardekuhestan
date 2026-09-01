"""JWT از هدر Bearer یا کوکی HttpOnly."""

from __future__ import annotations

from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from accounts.constants import ACCESS_COOKIE_NAME


class CookieJWTAuthentication(JWTAuthentication):
    """
    اول Authorization: Bearer (ابزار و پنل کاتالوگ).
    اگر نبود، کوکی دسترسی. کوکی خراب/منقضی فروشگاه عمومی را خراب نمی‌کند.
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is not None:
            return super().authenticate(request)

        raw = request.COOKIES.get(
            getattr(settings, "AUTH_ACCESS_COOKIE_NAME", ACCESS_COOKIE_NAME)
        )
        if not raw:
            return None
        try:
            validated = self.get_validated_token(raw)
            return self.get_user(validated), validated
        except (InvalidToken, TokenError):
            return None
