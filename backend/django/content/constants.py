"""ثابت‌های دامنه محتوا، سئو و بهینه‌سازی برای هوش مصنوعی."""

SEO_TITLE_MAX_LENGTH = 70
SEO_DESCRIPTION_MAX_LENGTH = 160
FOCUS_KEYWORD_MAX_LENGTH = 80
ARTICLE_TITLE_MAX_LENGTH = 200
ARTICLE_SLUG_MAX_LENGTH = 220

GEO_FAQ_MIN_ITEMS_FOR_READY = 1
GEO_SUMMARY_MIN_LENGTH = 40
WORDS_PER_MINUTE = 200

# گروه‌های پنل اختصاصی محتوا/سئو
CONTENT_CREATOR_GROUP = "تولیدکنندگان محتوا"
SEO_SPECIALIST_GROUP = "کارشناسان سئو"
CONTENT_PANEL_GROUPS = (CONTENT_CREATOR_GROUP, SEO_SPECIALIST_GROUP)


class ArticleStatus:
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    PUBLISHED = "published"
    ARCHIVED = "archived"

    CHOICES = (
        (DRAFT, "پیش‌نویس"),
        (IN_REVIEW, "در حال بررسی"),
        (PUBLISHED, "منتشر شده"),
        (ARCHIVED, "بایگانی"),
    )


class SearchIntent:
    INFORMATIONAL = "informational"
    NAVIGATIONAL = "navigational"
    COMMERCIAL = "commercial"
    TRANSACTIONAL = "transactional"

    CHOICES = (
        (INFORMATIONAL, "می‌خواهد بداند"),
        (NAVIGATIONAL, "دنبال یک صفحه مشخص است"),
        (COMMERCIAL, "می‌خواهد مقایسه کند"),
        (TRANSACTIONAL, "می‌خواهد بخرد"),
    )


class ContentRole:
    PILLAR = "pillar"
    CLUSTER = "cluster"
    SUPPORTING = "supporting"
    STANDALONE = "standalone"

    CHOICES = (
        (PILLAR, "موضوع اصلی"),
        (CLUSTER, "زیرموضوع"),
        (SUPPORTING, "نوشته کمکی"),
        (STANDALONE, "نوشته جدا"),
    )
