"""ادمین Unfold — پاسخ به مشتری از صفحهٔ گفتگو."""

from __future__ import annotations

from django.contrib import admin, messages
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html
from unfold.admin import ModelAdmin, StackedInline

from support.constants import CONVERSATION_STATUS_OPEN, SENDER_STAFF
from support.models import SupportConversation, SupportMessage
from support.services import publish_staff_reply


class SupportMessageInline(StackedInline):
    model = SupportMessage
    extra = 1
    fields = ("body", "sender_user", "created_at")
    readonly_fields = ("created_at", "sender_user")
    ordering = ("created_at",)
    show_change_link = False
    verbose_name = "پیام"
    verbose_name_plural = (
        "تاریخچه گفتگو — برای پاسخ، در ردیف خالی پایین «پاسخ شما به مشتری» را بنویسید و ذخیره کنید"
    )

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        body = formset.form.base_fields.get("body")
        if body is not None:
            body.label = "پاسخ شما به مشتری"
            body.widget.attrs.update(
                {
                    "rows": 4,
                    "placeholder": "پاسخ خود را اینجا بنویسید…",
                    "style": "width:100%;min-height:96px;",
                }
            )
        return formset

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

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
    readonly_fields = ("id", "created_at", "updated_at", "last_message_at", "reply_help")
    raw_id_fields = ("customer", "assigned_staff")
    inlines = (SupportMessageInline,)
    ordering = ("-last_message_at", "-created_at")
    list_per_page = 40
    fieldsets = (
        (
            "راهنمای پاسخ",
            {
                "fields": ("reply_help",),
                "description": "پاسخ ادمین فقط از همین صفحه انجام می‌شود.",
            },
        ),
        (
            "گفتگو",
            {
                "fields": (
                    "customer",
                    "status",
                    "assigned_staff",
                    "last_message_at",
                    "id",
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )

    @admin.display(description="شناسه")
    def id_short(self, obj: SupportConversation) -> str:
        return str(obj.id)[:8]

    @admin.display(description="چطور پاسخ بدهم؟")
    def reply_help(self, obj: SupportConversation) -> str:
        return format_html(
            "<div style='line-height:1.8;padding:8px 0'>"
            "<strong>۱.</strong> پایین صفحه، در بخش پیام‌ها، ردیف خالی را پیدا کنید.<br>"
            "<strong>۲.</strong> متن پاسخ را در فیلد «پاسخ شما به مشتری» بنویسید.<br>"
            "<strong>۳.</strong> دکمهٔ سبز «ذخیره» را بزنید — پیام همان لحظه برای کاربر در چت‌بات می‌رود."
            "</div>"
        )

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for obj in formset.deleted_objects:
            obj.delete()
        for instance in instances:
            if isinstance(instance, SupportMessage) and not instance.pk:
                instance.sender_role = SENDER_STAFF
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
                try:
                    publish_staff_reply(instance)
                except Exception as exc:  # noqa: BLE001
                    messages.warning(
                        request,
                        f"پیام ذخیره شد؛ پخش زنده موقتاً ناموفق بود: {exc}",
                    )
                else:
                    messages.success(request, "پاسخ برای مشتری در چت‌بات ارسال شد.")
            elif instance.pk:
                instance.save()
        formset.save_m2m()


@admin.register(SupportMessage)
class SupportMessageAdmin(ModelAdmin):
    list_display = ("id_short", "conversation_link", "sender_role", "body_preview", "created_at")
    list_filter = ("sender_role",)
    search_fields = ("body", "conversation__id", "sender_user__email")
    readonly_fields = (
        "id",
        "conversation",
        "sender_role",
        "sender_user",
        "body",
        "client_message_id",
        "created_at",
        "whatsapp_notified_at",
        "open_conversation",
    )
    ordering = ("-created_at",)
    fieldsets = (
        (
            "پاسخ از اینجا نوشته نمی‌شود",
            {
                "fields": ("open_conversation",),
                "description": (
                    "این صفحه فقط جزئیات یک پیام است. "
                    "برای جواب دادن به کاربر، گفتگو را باز کنید."
                ),
            },
        ),
        (
            "جزئیات پیام",
            {
                "fields": (
                    "conversation",
                    "sender_role",
                    "sender_user",
                    "body",
                    "client_message_id",
                    "id",
                    "created_at",
                    "whatsapp_notified_at",
                ),
            },
        ),
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return True  # view + link only; fields readonly

    @admin.display(description="شناسه")
    def id_short(self, obj: SupportMessage) -> str:
        return str(obj.id)[:8]

    @admin.display(description="متن")
    def body_preview(self, obj: SupportMessage) -> str:
        return obj.body[:80]

    @admin.display(description="گفتگو")
    def conversation_link(self, obj: SupportMessage) -> str:
        url = reverse(
            "admin:support_supportconversation_change",
            args=[obj.conversation_id],
        )
        return format_html('<a href="{}">باز کردن گفتگو برای پاسخ</a>', url)

    @admin.display(description="پاسخ به مشتری")
    def open_conversation(self, obj: SupportMessage) -> str:
        url = reverse(
            "admin:support_supportconversation_change",
            args=[obj.conversation_id],
        )
        return format_html(
            '<a class="button" style="display:inline-block;padding:10px 16px;'
            "background:#005B48;color:#F4F0E8;border-radius:8px;text-decoration:none;"
            'font-weight:700" href="{}">'
            "← برو به گفتگو و پاسخ بده"
            "</a>",
            url,
        )
