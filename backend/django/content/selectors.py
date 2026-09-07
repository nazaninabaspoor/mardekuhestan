"""Read-side queries for article APIs."""

from django.db.models import Q

from content.models import Article


def get_published_articles():
    return Article.objects.published().select_related("author")


def get_indexable_articles():
    return Article.objects.indexable().select_related("author")


def get_published_article_by_slug(slug: str):
    return get_published_articles().filter(slug=slug).first()


def search_published_articles(qs, query: str):
    text = (query or "").strip()
    if not text:
        return qs
    return qs.filter(
        Q(title__icontains=text)
        | Q(excerpt__icontains=text)
        | Q(focus_keyword__icontains=text)
        | Q(seo_title__icontains=text)
        | Q(seo_description__icontains=text)
        | Q(slug__icontains=text)
    )


def get_related_articles(article: Article, limit: int = 4):
    qs = get_published_articles().exclude(pk=article.pk).prefetch_related("categories", "tags")
    category_ids = list(article.categories.values_list("pk", flat=True))
    if category_ids:
        related = qs.filter(categories__in=category_ids).distinct()[:limit]
        related = list(related)
        if len(related) >= limit:
            return related
        leftover = limit - len(related)
        extra = list(qs.exclude(pk__in=[item.pk for item in related])[:leftover])
        return related + extra
    if article.pillar_id:
        return list(qs.filter(pillar_id=article.pillar_id)[:limit])
    return list(qs[:limit])
