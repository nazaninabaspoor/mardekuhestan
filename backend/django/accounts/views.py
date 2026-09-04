"""API حساب مشتری — ثبت‌نام، ورود، خروج، تازه‌کردن توکن."""

from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.constants import REFRESH_COOKIE_NAME
from accounts.models import CustomerAddress
from accounts.permissions import IsCustomerOrStaff
from accounts.serializers import (
    ChangePasswordSerializer,
    CustomerAddressSerializer,
    CustomerAddressWriteSerializer,
    LoginSerializer,
    ProfileUpdateSerializer,
    RefreshSerializer,
    RegisterSerializer,
    UserMeSerializer,
)
from accounts.services import (
    AuthError,
    blacklist_all_refresh_tokens,
    blacklist_refresh,
    change_password,
    issue_tokens,
    login_user,
    register_customer,
    update_profile,
)
from accounts.utils import clear_auth_cookies, set_auth_cookies
from sec.ownership import acting_user, reject_foreign_identity
from sec.throttling import AuthLoginThrottle, AuthRefreshThrottle, AuthRegisterThrottle


def _django_validation_response(exc: DjangoValidationError) -> Response:
    if hasattr(exc, "message_dict") and exc.message_dict:
        return Response(exc.message_dict, status=status.HTTP_400_BAD_REQUEST)
    messages = list(getattr(exc, "messages", None) or [str(exc)])
    return Response({"detail": messages[0] if len(messages) == 1 else messages}, status=400)


def _auth_error_response(exc: AuthError) -> Response:
    code = status.HTTP_423_LOCKED if exc.code == "locked" else status.HTTP_400_BAD_REQUEST
    if exc.code == "invalid":
        code = status.HTTP_401_UNAUTHORIZED
    if exc.code == "email_taken":
        code = status.HTTP_409_CONFLICT
    return Response({"detail": exc.message}, status=code)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRegisterThrottle]
    throttle_scope = "auth_register"
    authentication_classes = []

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            user = register_customer(
                email=ser.validated_data["email"],
                password=ser.validated_data["password"],
                display_name=ser.validated_data["name"],
                phone=ser.validated_data.get("phone") or "",
            )
        except AuthError as exc:
            return _auth_error_response(exc)
        except DjangoValidationError as exc:
            return _django_validation_response(exc)

        access, refresh = issue_tokens(user)
        body = {"user": UserMeSerializer().to_representation(user), "access": access}
        response = Response(body, status=status.HTTP_201_CREATED)
        set_auth_cookies(response, access=access, refresh=refresh)
        return response


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthLoginThrottle]
    throttle_scope = "auth_login"
    authentication_classes = []

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            user = login_user(
                email=ser.validated_data["email"],
                password=ser.validated_data["password"],
            )
        except AuthError as exc:
            return _auth_error_response(exc)
        except DjangoValidationError as exc:
            return _django_validation_response(exc)

        access, refresh = issue_tokens(user)
        body = {"user": UserMeSerializer().to_representation(user), "access": access}
        response = Response(body)
        set_auth_cookies(response, access=access, refresh=refresh)
        return response


class TokenPairView(APIView):
    """ورود برای ابزار و پنل manage — access و refresh در بدنه هم می‌آید."""

    permission_classes = [AllowAny]
    throttle_classes = [AuthLoginThrottle]
    throttle_scope = "auth_login"
    authentication_classes = []

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            user = login_user(
                email=ser.validated_data["email"],
                password=ser.validated_data["password"],
            )
        except AuthError as exc:
            return _auth_error_response(exc)
        except DjangoValidationError as exc:
            return _django_validation_response(exc)

        access, refresh = issue_tokens(user)
        body = {
            "user": UserMeSerializer().to_representation(user),
            "access": access,
            "refresh": refresh,
        }
        response = Response(body)
        set_auth_cookies(response, access=access, refresh=refresh)
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRefreshThrottle]
    throttle_scope = "auth_refresh"
    authentication_classes = []

    def post(self, request):
        raw = request.COOKIES.get(REFRESH_COOKIE_NAME) or request.data.get("refresh")
        blacklist_refresh(raw)
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_auth_cookies(response)
        return response


class RefreshView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRefreshThrottle]
    throttle_scope = "auth_refresh"
    authentication_classes = []

    def post(self, request):
        ser = RefreshSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        raw = request.COOKIES.get(REFRESH_COOKIE_NAME) or ser.validated_data.get("refresh")
        if not raw:
            return Response(
                {"detail": "نشست شما تمام شده. دوباره وارد شوید."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            old = RefreshToken(raw)
            user_id = old.payload.get("user_id")
            old.blacklist()
            from django.contrib.auth import get_user_model

            User = get_user_model()
            user = User.objects.filter(pk=user_id, is_active=True).first()
            if user is None:
                raise TokenError("no user")
            access, refresh = issue_tokens(user)
        except TokenError:
            response = Response(
                {"detail": "نشست شما تمام شده. دوباره وارد شوید."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_auth_cookies(response)
            return response

        body = {"access": access}
        response = Response(body)
        set_auth_cookies(response, access=access, refresh=refresh)
        return response


class MeView(APIView):
    permission_classes = [IsCustomerOrStaff]

    def get(self, request, *args, **kwargs):
        user = acting_user(request)
        return Response(UserMeSerializer().to_representation(user))

    def patch(self, request, *args, **kwargs):
        reject_foreign_identity(request.data)
        ser = ProfileUpdateSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        user = acting_user(request)
        try:
            user = update_profile(
                user,
                display_name=ser.validated_data.get("name"),
                phone=ser.validated_data.get("phone"),
            )
        except DjangoValidationError as exc:
            return _django_validation_response(exc)
        return Response(UserMeSerializer().to_representation(user))


class ChangePasswordView(APIView):
    permission_classes = [IsCustomerOrStaff]
    throttle_classes = [AuthLoginThrottle]
    throttle_scope = "auth_login"

    def post(self, request, *args, **kwargs):
        reject_foreign_identity(request.data)
        ser = ChangePasswordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = acting_user(request)
        try:
            change_password(
                user,
                current_password=ser.validated_data["current_password"],
                new_password=ser.validated_data["new_password"],
            )
        except AuthError as exc:
            return _auth_error_response(exc)
        except DjangoValidationError as exc:
            return _django_validation_response(exc)

        access, refresh = issue_tokens(user)
        body = {"detail": "رمز عوض شد.", "access": access}
        response = Response(body)
        set_auth_cookies(response, access=access, refresh=refresh)
        return response


class LogoutAllView(APIView):
    permission_classes = [IsCustomerOrStaff]

    def post(self, request, *args, **kwargs):
        user = acting_user(request)
        blacklist_all_refresh_tokens(user)
        access, refresh = issue_tokens(user)
        body = {"detail": "از بقیه دستگاه‌ها خارج شدید.", "access": access}
        response = Response(body)
        set_auth_cookies(response, access=access, refresh=refresh)
        return response


class AddressListCreateView(APIView):
    permission_classes = [IsCustomerOrStaff]

    def get(self, request, *args, **kwargs):
        user = acting_user(request)
        addresses = CustomerAddress.objects.filter(user=user)
        if not addresses.exists():
            display_name = getattr(getattr(user, "customer_profile", None), "display_name", "") or user.get_full_name() or "کامیار جعفریان"
            phone = getattr(getattr(user, "customer_profile", None), "phone", "") or "۰۹۳۷۹۱۴۶۱۳۰"
            addr1 = CustomerAddress.objects.create(
                user=user,
                title="نشانی منزل",
                address_type=CustomerAddress.AddressType.HOME,
                province="تهران",
                city="تهران",
                district="زعفرانیه",
                address_line="خیابان آصف، کمالی، بنفشه، پلاک ۱۲",
                postal_code="۱۹۸۷۶۵۴۳۲۱",
                receiver_name=display_name,
                receiver_phone=phone,
                is_default=True,
            )
            addr2 = CustomerAddress.objects.create(
                user=user,
                title="نشانی دفتر",
                address_type=CustomerAddress.AddressType.WORK,
                province="تهران",
                city="تهران",
                district="فرمانیه",
                address_line="بلوار اندرزگو، سلیمی شمالی، ساختمان نگین",
                postal_code="۱۹۳۴۵۶۷۸۹۰",
                receiver_name=display_name,
                receiver_phone=phone,
                is_default=False,
            )
            addresses = [addr1, addr2]
        serializer = CustomerAddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        reject_foreign_identity(request.data)
        ser = CustomerAddressWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = acting_user(request)
        is_default = ser.validated_data.get("is_default", False)
        if is_default:
            CustomerAddress.objects.filter(user=user).update(is_default=False)
        address = CustomerAddress.objects.create(
            user=user,
            title=ser.validated_data.get("title", "نشانی تحویل"),
            address_type=ser.validated_data.get("address_type", CustomerAddress.AddressType.HOME),
            province=ser.validated_data.get("province", "تهران"),
            city=ser.validated_data.get("city", "تهران"),
            district=ser.validated_data.get("district", ""),
            address_line=ser.validated_data["address_line"],
            postal_code=ser.validated_data.get("postal_code", ""),
            receiver_name=ser.validated_data.get("receiver_name", ""),
            receiver_phone=ser.validated_data.get("receiver_phone", ""),
            is_default=is_default,
        )
        return Response(CustomerAddressSerializer(address).data, status=status.HTTP_201_CREATED)


class AddressDetailView(APIView):
    permission_classes = [IsCustomerOrStaff]

    def patch(self, request, pk, *args, **kwargs):
        reject_foreign_identity(request.data)
        ser = CustomerAddressWriteSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        user = acting_user(request)
        try:
            address = CustomerAddress.objects.get(pk=pk, user=user)
        except CustomerAddress.DoesNotExist:
            return Response({"detail": "نشانی یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        is_default = ser.validated_data.get("is_default")
        if is_default is True:
            CustomerAddress.objects.filter(user=user).exclude(pk=pk).update(is_default=False)

        for attr, val in ser.validated_data.items():
            setattr(address, attr, val)
        address.save()
        return Response(CustomerAddressSerializer(address).data)

    def delete(self, request, pk, *args, **kwargs):
        user = acting_user(request)
        try:
            address = CustomerAddress.objects.get(pk=pk, user=user)
        except CustomerAddress.DoesNotExist:
            return Response({"detail": "نشانی یافت نشد."}, status=status.HTTP_404_NOT_FOUND)
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
