from rest_framework import serializers

from content.models import Article, Category, ContentPillar, Tag, TopicCluster
from content.services import seo_readiness_checklist


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "parent", "is_active")


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "slug")


class TopicClusterSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicCluster
        fields = (
            "id",
            "pillar",
            "title",
            "slug",
            "description",
            "target_keyword",
            "is_active",
        )


class ContentPillarSerializer(serializers.ModelSerializer):
    clusters = TopicClusterSerializer(many=True, read_only=True)

    class Meta:
        model = ContentPillar
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "primary_keyword",
            "is_active",
            "clusters",
        )


class ArticleListSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "focus_keyword",
            "seo_title",
            "seo_description",
            "content_role",
            "search_intent",
            "pillar",
            "cluster",
            "categories",
            "tags",
            "cover_image",
            "word_count",
            "reading_time_minutes",
            "published_at",
            "updated_at",
            "author_name",
        )

    def get_author_name(self, obj: Article) -> str:
        if not obj.author:
            return ""
        return obj.author.get_full_name() or obj.author.username


class ArticleDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    readiness = serializers.SerializerMethodField()
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    pillar_detail = ContentPillarSerializer(source="pillar", read_only=True)
    cluster_detail = TopicClusterSerializer(source="cluster", read_only=True)

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "body",
            "focus_keyword",
            "secondary_keywords",
            "seo_title",
            "seo_description",
            "breadcrumb_title",
            "canonical_url",
            "robots_index",
            "robots_follow",
            "og_title",
            "og_description",
            "og_image",
            "geo_summary",
            "geo_key_facts",
            "geo_entities",
            "geo_faq",
            "schema_json",
            "internal_links",
            "content_role",
            "search_intent",
            "pillar",
            "cluster",
            "pillar_detail",
            "cluster_detail",
            "categories",
            "tags",
            "cover_image",
            "word_count",
            "reading_time_minutes",
            "status",
            "published_at",
            "updated_at",
            "created_at",
            "author_name",
            "readiness",
        )

    def get_author_name(self, obj: Article) -> str:
        if not obj.author:
            return ""
        return obj.author.get_full_name() or obj.author.username

    def get_readiness(self, obj: Article) -> dict:
        return seo_readiness_checklist(obj)
