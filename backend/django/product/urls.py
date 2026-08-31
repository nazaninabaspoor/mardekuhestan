from django.urls import include, path
from rest_framework.routers import DefaultRouter

from product.views import (
    CatalogDomainListAPIView,
    CategoryAdminViewSet,
    CategoryDetailView,
    CategoryListView,
    CategoryTreeView,
    ProductAdminViewSet,
    ProductDetailView,
    ProductImageAdminViewSet,
    ProductListView,
    ProductVariantAdminViewSet,
)

app_name = "product"

admin_router = DefaultRouter()
admin_router.register("products", ProductAdminViewSet, basename="admin-product")
admin_router.register("categories", CategoryAdminViewSet, basename="admin-category")

urlpatterns = [
    # Staff panel — before public slug catch-all
    path("manage/", include(admin_router.urls)),
    path(
        "manage/products/<int:product_pk>/variants/",
        ProductVariantAdminViewSet.as_view({"get": "list", "post": "create"}),
        name="admin-variant-list",
    ),
    path(
        "manage/products/<int:product_pk>/variants/<int:pk>/",
        ProductVariantAdminViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="admin-variant-detail",
    ),
    path(
        "manage/products/<int:product_pk>/images/",
        ProductImageAdminViewSet.as_view({"get": "list", "post": "create"}),
        name="admin-image-list",
    ),
    path(
        "manage/products/<int:product_pk>/images/<int:pk>/",
        ProductImageAdminViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="admin-image-detail",
    ),
    # Storefront (public)
    path("domains/", CatalogDomainListAPIView.as_view(), name="domain-list"),
    path("categories/tree/", CategoryTreeView.as_view(), name="category-tree"),
    path(
        "categories/<slug:slug>/",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("", ProductListView.as_view(), name="product-list"),
    path("<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),
]
