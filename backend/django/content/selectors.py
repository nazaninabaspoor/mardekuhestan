"""Read-side queries for article APIs."""

from content.models import Article


def get_published_articles():
    return Article.objects.published().select_related("author")


def get_indexable_articles():
    return Article.objects.indexable().select_related("author")


def get_published_article_by_slug(slug: str):
    return get_published_articles().filter(slug=slug).first()
