"""ادمین Unfold برای گفتگو و پاسخ فوری به مشتری."""

from __future__ import annotations

from django.contrib import admin, messages
from django.utils import timezone
from unfold.admin import ModelAdmin, TabularInline

from support.constants import CONVERSATION_STATUS_OPEN, SENDER_STAFF
from support.models import SupportConversation, SupportMessage
from support.services import publish_staff_reply


class SupportMessageInline(TabularInline):
    model = SupportMessage
    extra = 1
    fields = ("sender_role", "sender_user", "body", "created_at", "whatsapp_notified_at")
    readonly_fields = ("created_at", "whatsapp_notified_at", "sender_user")
    ordering = ("created_at",)
    show_change_link = True

    def has_change_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("sender_user")


@admin.register(SupportConversation)
class SupportConversationAdmin(ModelAdmin):
    list_display = (
        "id_short",
        "customer",
        "status",
        "assigned_staff",
        "last_message_at",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("customer__email", "customer__username", "id")
    readonly_fields = ("id", "created_at", "updated_at", "last_message_at")
    autocomplete_fields = ()
    raw_id_fields = ("customer", "assigned_staff")
    inlines = (SupportMessageInline,)
    ordering = ("-last_message_at", "-created_at")
    list_per_page = 40

    @admin.display(description="شناسه")
    def id_short(self, obj: SupportConversation) -> str:
        return str(obj.id)[:8]

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for obj in formset.deleted_objects:
            obj.delete()
        for instance in instances:
            if isinstance(instance, SupportMessage) and not instance.pk:
                if not instance.sender_role:
                    instance.sender_role = SENDER_STAFF
                if instance.sender_role == SENDER_STAFF:
                    instance.sender_user = request.user
                instance.save()
                conversation = instance.conversation
                conversation.last_message_at = timezone.now()
                conversation.status = CONVERSATION_STATUS_OPEN
                if not conversation.assigned_staff_id:
                    conversation.assigned_staff = request.user
                conversation.staff_last_read_at = timezone.now()
                conversation.save(
                    update_fields=[
                        "last_message_at",
                        "status",
                        "assigned_staff",
                        "staff_last_read_at",
                        "updated_at",
                    ]
                )
                if instance.sender_role == SENDER_STAFF:
                    try:
                        publish_staff_reply(instance)
                    except Exception as exc:  # noqa: BLE001 — ادمین نباید گیر کند
                        messages.warning(
                            request,
                            f"پیام ذخیره شد؛ پخش زنده موقتاً ناموفق بود: {exc}",
                        )
                    else:
                        messages.success(request, "پاسخ برای مشتری ارسال شد.")
            else:
                instance.save()
        formset.save_m2m()


@admin.register(SupportMessage)
class SupportMessageAdmin(ModelAdmin):
    list_display = ("id_short", "conversation", "sender_role", "body_preview", "created_at")
    list_filter = ("sender_role",)
    search_fields = ("body", "conversation__id", "sender_user__email")
    readonly_fields = ("id", "created_at", "whatsapp_notified_at")
    autocomplete_fields = ()
    raw_id_fields = ("conversation", "sender_user")
    ordering = ("-created_at",)

    @admin.display(description="شناسه")
    def id_short(self, obj: SupportMessage) -> str:
        return str(obj.id)[:8]

    @admin.display(description="متن")
    def body_preview(self, obj: SupportMessage) -> str:
        return obj.body[:80]
