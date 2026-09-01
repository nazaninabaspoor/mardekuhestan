from django.urls import path

from sec.views import ClientIpStatusView, SystemHealthView, SystemReadinessView

app_name = "sec"

urlpatterns = [
    path("health/", SystemHealthView.as_view(), name="health"),
    path("ready/", SystemReadinessView.as_view(), name="ready"),
    path("ip-status/", ClientIpStatusView.as_view(), name="ip_status"),
]
