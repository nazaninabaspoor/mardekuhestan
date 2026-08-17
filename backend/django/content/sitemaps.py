from django.contrib.sitemaps import Sitemap

from content.selectors import get_indexable_articles


class ArticleSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8
    protocol = "https"

    def items(self):
        return get_indexable_articles()

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f"/articles/{obj.slug}/"
