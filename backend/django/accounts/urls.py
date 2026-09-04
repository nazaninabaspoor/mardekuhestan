from django.urls import path

from accounts.views import (
    AddressDetailView,
    AddressListCreateView,
    ChangePasswordView,
    LoginView,
    LogoutAllView,
    LogoutView,
    MeView,
    RefreshView,
    RegisterView,
    TokenPairView,
)

app_name = "accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("logout-all/", LogoutAllView.as_view(), name="logout_all"),
    path("token/", TokenPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", RefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("password/", ChangePasswordView.as_view(), name="change_password"),
    path("addresses/", AddressListCreateView.as_view(), name="address_list_create"),
    path("addresses/<int:pk>/", AddressDetailView.as_view(), name="address_detail"),
]
