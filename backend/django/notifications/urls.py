from django.urls import path

from notifications.views import (
    AiInternalConsumeView,
    AiQuotaView,
    WaitlistRegisterView,
)

app_name = "notifications"

urlpatterns = [
    path("waitlist/", WaitlistRegisterView.as_view(), name="waitlist"),
    path("ai/quota/", AiQuotaView.as_view(), name="ai-quota"),
    path("ai/internal/", AiInternalConsumeView.as_view(), name="ai-internal"),
]
