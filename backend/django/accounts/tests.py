"""آزمون ورود، ثبت‌نام و کوکی JWT."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase

from accounts.constants import ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME

User = get_user_model()

_CACHE = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "accounts-tests",
    }
}


@override_settings(CACHES=_CACHE)
class AccountAuthTests(APITestCase):
    def setUp(self):
        self.password = "Sabz-Rah-1405!"
        self.email = "family@example.com"

    def test_register_login_me_logout(self):
        register = self.client.post(
            "/api/auth/register/",
            {
                "email": self.email,
                "password": self.password,
                "password_repeat": self.password,
                "name": "خانواده سبز",
            },
            format="json",
        )
        self.assertEqual(register.status_code, 201)
        self.assertIn("access", register.data)
        self.assertNotIn("refresh", register.data)
        self.assertIn(ACCESS_COOKIE_NAME, register.cookies)
        self.assertIn(REFRESH_COOKIE_NAME, register.cookies)
        user = User.objects.get(email=self.email)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.data["email"], self.email)
        self.assertEqual(me.data["name"], "خانواده سبز")

        self.client.post("/api/auth/logout/", format="json")
        me_after = self.client.get("/api/auth/me/")
        self.assertEqual(me_after.status_code, 401)

        login = self.client.post(
            "/api/auth/login/",
            {"email": self.email, "password": self.password},
            format="json",
        )
        self.assertEqual(login.status_code, 200)
        self.assertNotIn("refresh", login.data)

    def test_login_wrong_password_is_generic(self):
        User.objects.create_user(
            username=self.email,
            email=self.email,
            password=self.password,
        )
        response = self.client.post(
            "/api/auth/login/",
            {"email": self.email, "password": "wrong-wrong-1"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["detail"], "ایمیل یا رمز درست نیست.")

    def test_token_pair_returns_refresh_for_tools(self):
        User.objects.create_user(
            username=self.email,
            email=self.email,
            password=self.password,
        )
        response = self.client.post(
            "/api/auth/token/",
            {"email": self.email, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("refresh", response.data)
        self.assertIn("access", response.data)

    def test_refresh_rotates_cookie(self):
        self.client.post(
            "/api/auth/register/",
            {
                "email": self.email,
                "password": self.password,
                "password_repeat": self.password,
                "name": "آزمایش",
            },
            format="json",
        )
        first_refresh = self.client.cookies[REFRESH_COOKIE_NAME].value
        rotated = self.client.post("/api/auth/token/refresh/", format="json")
        self.assertEqual(rotated.status_code, 200)
        self.assertIn("access", rotated.data)
        self.assertNotIn("refresh", rotated.data)
        second_refresh = self.client.cookies[REFRESH_COOKIE_NAME].value
        self.assertNotEqual(first_refresh, second_refresh)

        self.client.cookies[REFRESH_COOKIE_NAME] = first_refresh
        reuse = self.client.post("/api/auth/token/refresh/", format="json")
        self.assertEqual(reuse.status_code, 401)
