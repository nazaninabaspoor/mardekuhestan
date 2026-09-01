"""منطق کسب‌وکار مقالات، پیش‌فرض‌های سئو و تولید داده ساخت‌یافته."""

from __future__ import annotations

import re

from django.utils import timezone
from django.utils.text import slugify

from content.constants import (
    WORDS_PER_MINUTE,
    ArticleStatus,
    SEO_DESCRIPTION_MAX_LENGTH,
    SEO_TITLE_MAX_LENGTH,
)


def build_unique_slug(model_cls, title: str, *, instance_pk=None) -> str:
    base = slugify(title, allow_unicode=True) or "article"
    slug = base
    index = 2
    qs = model_cls.objects.all()
    if instance_pk:
        qs = qs.exclude(pk=instance_pk)
    while qs.filter(slug=slug).exists():
        slug = f"{base}-{index}"
        index += 1
    return slug


def strip_html(value: str) -> str:
    text = re.sub(r"<[^>]+>", " ", value or "")
    return " ".join(text.split())


def compute_reading_metrics(body: str) -> tuple[int, int]:
    words = [w for w in strip_html(body).split() if w]
    word_count = len(words)
    minutes = max(1, round(word_count / WORDS_PER_MINUTE)) if word_count else 0
    return word_count, minutes


def apply_seo_defaults(article) -> None:
    if not article.seo_title:
        article.seo_title = (article.title or "")[:SEO_TITLE_MAX_LENGTH]
    if not article.seo_description:
        source = article.excerpt or article.geo_summary or article.body or ""
        article.seo_description = strip_html(source)[:SEO_DESCRIPTION_MAX_LENGTH]
    if not article.og_title:
        article.og_title = article.seo_title
    if not article.og_description:
        article.og_description = article.seo_description
    if not article.breadcrumb_title:
        article.breadcrumb_title = (article.title or "")[:120]


def build_article_schema(article, *, site_url: str = "https://mardekuhestan.com") -> dict:
    page_url = article.canonical_url or f"{site_url.rstrip('/')}/articles/{article.slug}/"
    graph = [
        {
            "@type": "Article",
            "@id": f"{page_url}#article",
            "headline": article.seo_title or article.title,
            "description": article.seo_description or article.excerpt or article.geo_summary,
            "datePublished": article.published_at.isoformat() if article.published_at else None,
            "dateModified": article.updated_at.isoformat() if getattr(article, "updated_at", None) else None,
            "mainEntityOfPage": page_url,
            "author": {
                "@type": "Person",
                "name": (
                    getattr(article.author, "get_full_name", lambda: "")()
                    or getattr(article.author, "username", "مرد کوهستان")
                ),
            },
            "publisher": {
                "@type": "Organization",
                "name": "صنایع غذایی مرد کوهستان",
                "url": site_url,
            },
            "keywords": ", ".join(
                [
                    k
                    for k in [article.focus_keyword, *(article.secondary_keywords or [])]
                    if k
                ]
            ),
            "about": article.geo_entities or [],
            "abstract": article.geo_summary or article.excerpt or "",
            "wordCount": article.word_count or None,
            "articleSection": (
                article.pillar.title if getattr(article, "pillar_id", None) and article.pillar else None
            ),
        }
    ]

    faq_items = normalize_geo_faq(article.geo_faq or [])
    if faq_items:
        graph.append(
            {
                "@type": "FAQPage",
                "@id": f"{page_url}#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": item["question"],
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": item["answer"],
                        },
                    }
                    for item in faq_items
                ],
            }
        )

    return {"@context": "https://schema.org", "@graph": graph}


def normalize_geo_faq(value) -> list[dict]:
    """پذیرش کلیدهای فارسی یا انگلیسی و یکدست‌سازی به question/answer."""
    if not isinstance(value, list):
        return []
    normalized = []
    for item in value:
        if not isinstance(item, dict):
            continue
        question = (item.get("سوال") or item.get("question") or "").strip()
        answer = (item.get("پاسخ") or item.get("answer") or "").strip()
        if question and answer:
            normalized.append({"question": question, "answer": answer})
    return normalized


def normalize_internal_links(value) -> list[dict]:
    if not isinstance(value, list):
        return []
    normalized = []
    for item in value:
        if not isinstance(item, dict):
            continue
        title = (item.get("عنوان") or item.get("title") or "").strip()
        url = (item.get("آدرس") or item.get("url") or "").strip()
        if title and url:
            normalized.append({"title": title, "url": url})
    return normalized


def prepare_article_for_save(article) -> None:
    if not article.slug:
        article.slug = build_unique_slug(
            article.__class__,
            article.title,
            instance_pk=article.pk,
        )
    if article.geo_faq:
        article.geo_faq = normalize_geo_faq(article.geo_faq)
    if article.internal_links:
        article.internal_links = normalize_internal_links(article.internal_links)
    article.word_count, article.reading_time_minutes = compute_reading_metrics(article.body)
    apply_seo_defaults(article)
    article.schema_json = build_article_schema(article)


def publish_article(article, *, when=None):
    article.status = ArticleStatus.PUBLISHED
    article.published_at = when or timezone.now()
    prepare_article_for_save(article)
    article.save()
    return article


def unpublish_article(article):
    article.status = ArticleStatus.DRAFT
    prepare_article_for_save(article)
    article.save()
    return article


def seo_readiness_checklist(article) -> dict:
    checks = {
        "عنوان مقاله": bool((article.title or "").strip()),
        "آدرس صفحه": bool((article.slug or "").strip()),
        "عنوان در گوگل": bool((article.seo_title or "").strip()),
        "توضیح در گوگل": bool((article.seo_description or "").strip()),
        "کلمهٔ اصلی جستجو": bool((article.focus_keyword or "").strip()),
        "کلمه‌های نزدیک": bool(article.secondary_keywords),
        "خلاصه کوتاه": bool((article.excerpt or "").strip()),
        "متن مقاله": bool(strip_html(article.body or "")),
        "خلاصه برای پاسخ‌های اینترنتی": bool((article.geo_summary or "").strip()),
        "سوال و جواب": bool(article.geo_faq),
        "عکس بالای مقاله": bool(article.cover_image),
        "عکس شبکه‌های اجتماعی": bool(article.og_image or article.cover_image),
        "دسته‌بندی": bool(article.pk and article.categories.exists()),
        "موضوع اصلی وصل است یا نوشته جداست": bool(
            article.content_role == "standalone"
            or article.pillar_id
            or article.content_role == "pillar"
        ),
        "زیرموضوع در صورت نیاز وصل است": not (
            article.content_role == "cluster" and not article.cluster_id
        ),
        "در گوگل نشان داده می‌شود": bool(article.robots_index),
        "متن نوشته شده است": (article.word_count or 0) > 0,
    }
    checks["آماده برای انتشار"] = all(
        [
            checks["عنوان مقاله"],
            checks["عنوان در گوگل"],
            checks["توضیح در گوگل"],
            checks["کلمهٔ اصلی جستجو"],
            checks["متن مقاله"],
            checks["خلاصه برای پاسخ‌های اینترنتی"],
            checks["سوال و جواب"],
            checks["دسته‌بندی"],
            checks["موضوع اصلی وصل است یا نوشته جداست"],
            checks["زیرموضوع در صورت نیاز وصل است"],
            checks["متن نوشته شده است"],
        ]
    )
    return checks
