from rest_framework import generics
from rest_framework.permissions import AllowAny

from content.models import Category, ContentPillar, Tag, TopicCluster
from content.selectors import get_published_article_by_slug, get_published_articles
from content.serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
    CategorySerializer,
    ContentPillarSerializer,
    TagSerializer,
    TopicClusterSerializer,
)


class ArticleListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ArticleListSerializer

    def get_queryset(self):
        qs = get_published_articles().prefetch_related("categories", "tags")
        category = self.request.query_params.get("category")
        tag = self.request.query_params.get("tag")
        pillar = self.request.query_params.get("pillar")
        cluster = self.request.query_params.get("cluster")
        if category:
            qs = qs.filter(categories__slug=category)
        if tag:
            qs = qs.filter(tags__slug=tag)
        if pillar:
            qs = qs.filter(pillar__slug=pillar)
        if cluster:
            qs = qs.filter(cluster__slug=cluster)
        return qs.distinct()


class ArticleDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ArticleDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return get_published_articles().prefetch_related("categories", "tags")

    def get_object(self):
        article = get_published_article_by_slug(self.kwargs[self.lookup_field])
        if article is None:
            from rest_framework.exceptions import NotFound

            raise NotFound("Article not found.")
        return article


class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    queryset = Category.objects.filter(is_active=True)


class TagListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TagSerializer
    queryset = Tag.objects.all()


class ContentPillarListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ContentPillarSerializer
    queryset = ContentPillar.objects.filter(is_active=True).prefetch_related("clusters")


class TopicClusterListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TopicClusterSerializer

    def get_queryset(self):
        qs = TopicCluster.objects.filter(is_active=True).select_related("pillar")
        pillar = self.request.query_params.get("pillar")
        if pillar:
            qs = qs.filter(pillar__slug=pillar)
        return qs
