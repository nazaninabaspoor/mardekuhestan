"""ویجت‌های اختصاصی استودیو محتوا."""

from django.forms import MultiWidget
from unfold.widgets import (
    UnfoldAdminDateWidget,
    UnfoldAdminSplitDateTimeWidget,
    UnfoldAdminTimeWidget,
)


class StudioSplitDateTimeWidget(UnfoldAdminSplitDateTimeWidget):
    """تاریخ/ساعت با لیبل فارسی بیرون از اینپوت تا با آیکون قاطی نشود."""

    template_name = "content/widgets/studio_split_datetime.html"

    def __init__(self, attrs=None) -> None:
        widgets = [
            UnfoldAdminDateWidget(
                attrs={
                    "placeholder": "مثلاً 2026-08-17",
                    "aria-label": "تاریخ انتشار",
                    "autocomplete": "off",
                }
            ),
            UnfoldAdminTimeWidget(
                attrs={
                    "placeholder": "مثلاً 14:30",
                    "aria-label": "ساعت انتشار",
                    "autocomplete": "off",
                }
            ),
        ]
        MultiWidget.__init__(self, widgets, attrs)
