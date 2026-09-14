from django.urls import path

from content.views import (
    ArticleDetailView,
    ArticleListView,
    CategoryListView,
    ContentPillarListView,
    MagazinePageView,
    TagListView,
    TopicClusterListView,
)

app_name = "content"

urlpatterns = [
    path("articles/", ArticleListView.as_view(), name="article-list"),
    path("articles/<path:slug>/", ArticleDetailView.as_view(), name="article-detail"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("magazine-page/", MagazinePageView.as_view(), name="magazine-page"),
    path("tags/", TagListView.as_view(), name="tag-list"),
    path("pillars/", ContentPillarListView.as_view(), name="pillar-list"),
    path("clusters/", TopicClusterListView.as_view(), name="cluster-list"),
]
