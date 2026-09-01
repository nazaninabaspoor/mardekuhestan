"""Catalog API — public storefront + staff management (hardened)."""

from __future__ import annotations

from rest_framework import generics, status, viewsets
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from product.constants import DEFAULT_LIST_PAGE_SIZE, MAX_LIST_PAGE_SIZE, PRODUCT_DOMAIN_META
from product.mixins import (
    CatalogAdminMixin,
    CatalogDetailMixin,
    CatalogPublicReadMixin,
    CatalogSearchMixin,
)
from product.models import Category, Product, ProductImage
from product.request_guards import (
    parse_admin_list_filters,
    parse_public_list_filters,
    validate_category_path_slug,
    validate_detail_slug,
)
from product.selectors import (
    get_active_categories,
    get_admin_categories,
    get_admin_product_by_pk,
    get_admin_products,
    get_admin_variants,
    get_category_by_slug,
    get_category_navigation_tree,
    get_store_product_by_public_uuid,
    get_store_product_by_slug,
    get_store_products,
    sales_channel_from_request,
    search_store_products,
)
from product.serializers import (
    CatalogSearchQuerySerializer,
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


class CatalogDomainListAPIView(CatalogPublicReadMixin, APIView):
    """GET /api/products/domains/ — vertical index for storefront filters."""

    def get(self, request: Request) -> Response:
        domains = sort_domains(list(PRODUCT_DOMAIN_META.keys()))
        payload = [
            {"domain": domain, **PRODUCT_DOMAIN_META[domain]}
            for domain in domains
        ]
        serializer = DomainIndexSerializer(payload, many=True)
        return Response(serializer.data)


class ProductListView(CatalogPublicReadMixin, generics.ListAPIView):
    serializer_class = ProductListSerializer
    pagination_class = CatalogPagination

    def get_queryset(self):
        filters = parse_public_list_filters(self.request)
        channel = sales_channel_from_request(self.request)
        query = self.request.query_params.get("q")
        if query:
            params = CatalogSearchQuerySerializer(data={"q": query})
            params.is_valid(raise_exception=True)
            return search_store_products(
                params.validated_data["q"],
                channel,
                domain=filters.domain,
                category_slug=filters.category_slug,
            )
        qs = get_store_products(
            channel,
            domain=filters.domain,
            category_slug=filters.category_slug,
        )
        return qs


class ProductSearchView(CatalogSearchMixin, generics.ListAPIView):
    serializer_class = ProductListSerializer
    pagination_class = CatalogPagination

    def get_queryset(self):
        filters = parse_public_list_filters(self.request)
        params = CatalogSearchQuerySerializer(
            data={"q": self.request.query_params.get("q", "")}
        )
        params.is_valid(raise_exception=True)
        channel = sales_channel_from_request(self.request)
        return search_store_products(
            params.validated_data["q"],
            channel,
            domain=filters.domain,
            category_slug=filters.category_slug,
        )


class ProductDetailView(CatalogDetailMixin, generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"

    def get_object(self) -> Product:
        slug = validate_detail_slug(self.kwargs[self.lookup_field])
        channel = sales_channel_from_request(self.request)
        product = get_store_product_by_slug(slug, channel)
        if product is None:
            raise NotFound("محصول یافت نشد.")
        return product


class ProductDetailByUUIDView(CatalogDetailMixin, generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    lookup_field = "public_uuid"
    lookup_url_kwarg = "public_uuid"

    def get_object(self) -> Product:
        from django.core.exceptions import ValidationError as DjangoValidationError

        from product import validators as product_validators

        raw = str(self.kwargs[self.lookup_url_kwarg])
        try:
            product_validators.validate_public_uuid(raw)
        except DjangoValidationError as exc:
            raise ValidationError({"public_uuid": list(exc.messages)}) from exc
        channel = sales_channel_from_request(self.request)
        product = get_store_product_by_public_uuid(raw, channel)
        if product is None:
            raise NotFound("محصول یافت نشد.")
        return product


class CategoryListView(CatalogPublicReadMixin, generics.ListAPIView):
    serializer_class = CategoryListSerializer

    def get_queryset(self):
        filters = parse_public_list_filters(self.request)
        qs = get_active_categories(domain=filters.domain)
        if filters.kind:
            qs = qs.of_kind(filters.kind)
        return qs


class CategoryDetailView(CatalogDetailMixin, generics.RetrieveAPIView):
    serializer_class = CategoryDetailSerializer
    lookup_field = "slug"

    def get_object(self) -> Category:
        slug = validate_category_path_slug(self.kwargs[self.lookup_field])
        category = get_category_by_slug(slug)
        if category is None:
            raise NotFound("دسته یافت نشد.")
        return category


class CategoryTreeView(CatalogPublicReadMixin, generics.ListAPIView):
    serializer_class = CategoryTreeSerializer

    def get_queryset(self):
        filters = parse_public_list_filters(self.request)
        return get_category_navigation_tree(domain=filters.domain)

    def get_serializer_context(self) -> dict:
        context = super().get_serializer_context()
        context.setdefault("tree_depth", 0)
        context.setdefault("max_tree_depth", 4)
        return context


class ProductAdminViewSet(CatalogAdminMixin, viewsets.ModelViewSet):
    pagination_class = CatalogPagination
    lookup_field = "pk"

    def get_queryset(self):
        filters = parse_admin_list_filters(self.request)
        qs = get_admin_products()
        if filters.domain:
            qs = qs.for_domain(filters.domain)
        if filters.status:
            qs = qs.filter(status=filters.status)
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


class CategoryAdminViewSet(CatalogAdminMixin, viewsets.ModelViewSet):
    pagination_class = CatalogPagination
    lookup_field = "pk"

    def get_queryset(self):
        return get_admin_categories()

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return CategoryWriteSerializer
        return CategoryDetailSerializer


class ProductVariantAdminViewSet(CatalogAdminMixin, viewsets.ModelViewSet):
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

    def get_object(self):
        obj = super().get_object()
        if int(obj.product_id) != int(self.kwargs["product_pk"]):
            raise NotFound("پیدا نشد.")
        return obj


class ProductImageAdminViewSet(CatalogAdminMixin, viewsets.ModelViewSet):
    upload_throttle_on_create = True
    parser_classes = [JSONParser, FormParser, MultiPartParser]

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
