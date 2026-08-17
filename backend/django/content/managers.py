"""Query helpers for article retrieval."""

from django.db import models
from django.utils import timezone

from content.constants import ArticleStatus


class ArticleQuerySet(models.QuerySet):
    def published(self):
        return self.filter(
            status=ArticleStatus.PUBLISHED,
            published_at__isnull=False,
            published_at__lte=timezone.now(),
        )

    def indexable(self):
        return self.published().filter(robots_index=True)

    def drafts(self):
        return self.filter(status=ArticleStatus.DRAFT)


class ArticleManager(models.Manager.from_queryset(ArticleQuerySet)):
    pass
