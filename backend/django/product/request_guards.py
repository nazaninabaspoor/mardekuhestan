"""محافظ‌های درخواست API کاتالوگ — اعتبارسنجی پارامترها قبل از DB."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError

from product import validators as product_validators
from product.constants import CategoryKind, ProductStatus
from product.utils import resolve_product_domain
from sec.validators import validate_query_param, validate_request_query_string

if TYPE_CHECKING:
    from django.http import HttpRequest


@dataclass(frozen=True)
class CatalogListFilters:
    domain: str | None
    category_slug: str | None
    kind: str | None
    status: str | None


def _raise_drf(exc: DjangoValidationError) -> None:
    if hasattr(exc, "message_dict") and exc.message_dict:
        raise ValidationError(exc.message_dict) from exc
    raise ValidationError(list(exc.messages)) from exc


def _run(validator, value) -> None:
    try:
        validator(value)
    except DjangoValidationError as exc:
        _raise_drf(exc)


def guard_catalog_request(request: HttpRequest) -> None:
    """بررسی‌های عمومی روی هر درخواست کاتالوگ."""
    try:
        validate_request_query_string(request)
    except DjangoValidationError as exc:
        _raise_drf(exc)


def parse_public_list_filters(request: HttpRequest) -> CatalogListFilters:
    guard_catalog_request(request)

    domain_raw = request.query_params.get("domain")
    domain = None
    if domain_raw:
        domain = validate_query_param(domain_raw, field_label="domain")
        resolved = resolve_product_domain(domain) or domain
        _run(product_validators.validate_product_domain, resolved)
        domain = resolved

    category_raw = request.query_params.get("category")
    category_slug = None
    if category_raw:
        category_slug = validate_query_param(category_raw, field_label="category")
        _run(product_validators.validate_category_slug, category_slug)

    kind_raw = request.query_params.get("kind")
    kind = None
    if kind_raw:
        kind = validate_query_param(kind_raw, field_label="kind")
        _run(product_validators.validate_category_kind, kind)
        if kind not in {c[0] for c in CategoryKind.CHOICES}:
            raise ValidationError({"kind": "نوع دسته معتبر نیست."})

    return CatalogListFilters(
        domain=domain,
        category_slug=category_slug,
        kind=kind,
        status=None,
    )


def parse_admin_list_filters(request: HttpRequest) -> CatalogListFilters:
    filters = parse_public_list_filters(request)
    status_raw = request.query_params.get("status")
    status = None
    if status_raw:
        status = validate_query_param(status_raw, field_label="status")
        _run(product_validators.validate_product_status, status)
    return CatalogListFilters(
        domain=filters.domain,
        category_slug=filters.category_slug,
        kind=filters.kind,
        status=status,
    )


def validate_detail_slug(slug: str) -> str:
    slug = validate_query_param(slug, field_label="slug")
    _run(product_validators.validate_product_slug, slug)
    return slug


def validate_category_path_slug(slug: str) -> str:
    slug = validate_query_param(slug, field_label="slug")
    _run(product_validators.validate_category_slug, slug)
    return slug
