"""اعتبارسنجی فیلدهای سئو و بهینه‌سازی برای هوش مصنوعی."""

from django.core.exceptions import ValidationError

from content.constants import (
    GEO_SUMMARY_MIN_LENGTH,
    SEO_DESCRIPTION_MAX_LENGTH,
    SEO_TITLE_MAX_LENGTH,
)


def _faq_question(item: dict) -> str:
    return (item.get("سوال") or item.get("question") or "").strip()


def _faq_answer(item: dict) -> str:
    return (item.get("پاسخ") or item.get("answer") or "").strip()


def validate_seo_title(value: str) -> None:
    if value and len(value) > SEO_TITLE_MAX_LENGTH:
        raise ValidationError(
            f"عنوان سئو حداکثر باید {SEO_TITLE_MAX_LENGTH} کاراکتر باشد."
        )


def validate_seo_description(value: str) -> None:
    if value and len(value) > SEO_DESCRIPTION_MAX_LENGTH:
        raise ValidationError(
            f"توضیحات سئو حداکثر باید {SEO_DESCRIPTION_MAX_LENGTH} کاراکتر باشد."
        )


def validate_geo_faq(value) -> None:
    if value in (None, ""):
        return
    if not isinstance(value, list):
        raise ValidationError("سوالات متداول باید لیستی از آیتم‌های سوال و پاسخ باشد.")
    for index, item in enumerate(value):
        if not isinstance(item, dict):
            raise ValidationError(f"آیتم شماره {index + 1} باید شامل سوال و پاسخ باشد.")
        if not _faq_question(item) or not _faq_answer(item):
            raise ValidationError(
                f"آیتم شماره {index + 1} باید هم «سوال» و هم «پاسخ» داشته باشد."
            )


def validate_string_list(value, field_name: str = "فیلد") -> None:
    if value in (None, ""):
        return
    if not isinstance(value, list):
        raise ValidationError(f"{field_name} باید لیستی از متن‌ها باشد.")
    for index, item in enumerate(value):
        if not isinstance(item, str) or not item.strip():
            raise ValidationError(
                f"آیتم شماره {index + 1} در {field_name} باید متن غیرخالی باشد."
            )


def validate_geo_summary_quality(value: str) -> None:
    text = (value or "").strip()
    if text and len(text) < GEO_SUMMARY_MIN_LENGTH:
        raise ValidationError(
            f"خلاصه برای هوش مصنوعی بهتر است حداقل {GEO_SUMMARY_MIN_LENGTH} کاراکتر باشد."
        )
