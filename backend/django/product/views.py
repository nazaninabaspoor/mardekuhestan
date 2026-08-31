"""Catalog API — public storefront + staff management."""

from __future__ import annotations

from rest_framework import generics, status, viewsets
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from product.constants import DEFAULT_LIST_PAGE_SIZE, MAX_LIST_PAGE_SIZE, PRODUCT_DOMAIN_META
from product.models import Category, Product, ProductImage
from product.permissions import IsCatalogStaff
from product.selectors import (
    get_active_categories,
    get_admin_categories,
    get_admin_product_by_pk,
    get_admin_products,
    get_admin_variants,
    get_category_by_slug,
    get_category_navigation_tree,
    get_store_product_by_slug,
    get_store_products,
    resolve_domain_filter,
    sales_channel_from_request,
)
from product.serializers import (
    CategoryDetailSerializer,
    CategoryListSerializer,
    CategoryTreeSerializer,
    CategoryWriteSerializer,
    DomainIndexSerializer,
    ProductAdminDetailSerializer,
    ProductAdminListSerializer,
    ProductDetailSerializer,
    ProductImageSerializer,
    ProductImageWriteSerializer,
    ProductListSerializer,
    ProductVariantDetailSerializer,
    ProductVariantWriteSerializer,
    ProductWriteSerializer,
)
from product.utils import clamp_page_size, sort_domains


class CatalogPagination(PageNumberPagination):
    page_size = DEFAULT_LIST_PAGE_SIZE
    page_size_query_param = "page_size"
    max_page_size = MAX_LIST_PAGE_SIZE

    def get_page_size(self, request: Request) -> int:
        raw = request.query_params.get(self.page_size_query_param)
        if raw is None:
            return self.page_size
        try:
            return clamp_page_size(int(raw))
        except (TypeError, ValueError):
            return self.page_size


# ---------------------------------------------------------------------------
# Public — lightweight APIView for domain index
# ---------------------------------------------------------------------------


class CatalogDomainListAPIView(APIView):
    """GET /api/products/domains/ — vertical index for storefront filters."""

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        domains = sort_domains(list(PRODUCT_DOMAIN_META.keys()))
        payload = [
            {"domain": domain, **PRODUCT_DOMAIN_META[domain]}
            for domain in domains
        ]
        serializer = DomainIndexSerializer(payload, many=True)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Public — generics for catalog read (same style as content app)
# ---------------------------------------------------------------------------


class ProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = CatalogPagination

    def get_queryset(self):
        channel = sales_channel_from_request(self.request)
        domain = resolve_domain_filter(self.request.query_params.get("domain"))
        category = self.request.query_params.get("category")
        return get_store_products(
            channel,
            domain=domain,
            category_slug=category,
        )


class ProductDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"

    def get_object(self) -> Product:
        channel = sales_channel_from_request(self.request)
        product = get_store_product_by_slug(self.kwargs[self.lookup_field], channel)
        if product is None:
            raise NotFound("محصول یافت نشد.")
        return product


class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategoryListSerializer

    def get_queryset(self):
        domain = resolve_domain_filter(self.request.query_params.get("domain"))
        kind = self.request.query_params.get("kind")
        qs = get_active_categories(domain=domain)
        if kind:
            qs = qs.of_kind(kind)
        return qs


class CategoryDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategoryDetailSerializer
    lookup_field = "slug"

    def get_object(self) -> Category:
        category = get_category_by_slug(self.kwargs[self.lookup_field])
        if category is None:
            raise NotFound("دسته یافت نشد.")
        return category


class CategoryTreeView(generics.ListAPIView):
    """Navigation tree — roots with nested children (depth capped in serializer)."""

    permission_classes = [AllowAny]
    serializer_class = CategoryTreeSerializer

    def get_queryset(self):
        domain = resolve_domain_filter(self.request.query_params.get("domain"))
        return get_category_navigation_tree(domain=domain)

    def get_serializer_context(self) -> dict:
        context = super().get_serializer_context()
        context.setdefault("tree_depth", 0)
        context.setdefault("max_tree_depth", 4)
        return context


# ---------------------------------------------------------------------------
# Admin — ViewSets for CRUD (staff / product panel)
# ---------------------------------------------------------------------------


class ProductAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsCatalogStaff]
    pagination_class = CatalogPagination
    lookup_field = "pk"

    def get_queryset(self):
        qs = get_admin_products()
        domain = resolve_domain_filter(self.request.query_params.get("domain"))
        status_filter = self.request.query_params.get("status")
        if domain:
            qs = qs.for_domain(domain)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return ProductAdminListSerializer
        if self.action in {"create", "update", "partial_update"}:
            return ProductWriteSerializer
        return ProductAdminDetailSerializer

    def get_serializer_context(self) -> dict:
        context = super().get_serializer_context()
        context["sales_channel"] = sales_channel_from_request(self.request)
        return context

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        product = get_admin_product_by_pk(int(kwargs["pk"]))
        if product is None:
            raise NotFound("محصول یافت نشد.")
        serializer = self.get_serializer(product)
        return Response(serializer.data)


class CategoryAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsCatalogStaff]
    pagination_class = CatalogPagination
    lookup_field = "pk"

    def get_queryset(self):
        return get_admin_categories()

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return CategoryWriteSerializer
        return CategoryDetailSerializer


class ProductVariantAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsCatalogStaff]
    pagination_class = CatalogPagination

    def get_queryset(self):
        product_id = self.kwargs.get("product_pk")
        return get_admin_variants(product_id=int(product_id))

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ProductVariantWriteSerializer
        return ProductVariantDetailSerializer

    def perform_create(self, serializer) -> None:
        product = get_admin_product_by_pk(int(self.kwargs["product_pk"]))
        if product is None:
            raise NotFound("محصول یافت نشد.")
        serializer.save(product=product)


class ProductImageAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsCatalogStaff]
    parser_classes = viewsets.ModelViewSet.parser_classes

    def get_queryset(self):
        product_id = self.kwargs.get("product_pk")
        return ProductImage.objects.filter(product_id=product_id).order_by(
            "sort_order", "id"
        )

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ProductImageWriteSerializer
        return ProductImageSerializer

    def perform_create(self, serializer) -> None:
        product = get_admin_product_by_pk(int(self.kwargs["product_pk"]))
        if product is None:
            raise NotFound("محصول یافت نشد.")
        serializer.save(product=product)

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
