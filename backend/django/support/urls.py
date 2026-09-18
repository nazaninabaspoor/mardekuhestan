from django.urls import path

from support.views import SupportConversationView, SupportMessageCreateView

app_name = "support"

urlpatterns = [
    path("conversation/", SupportConversationView.as_view(), name="conversation"),
    path("messages/", SupportMessageCreateView.as_view(), name="messages"),
]
