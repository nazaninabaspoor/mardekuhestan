"""WebSocket URL routing for product catalog."""

from django.urls import path

from product import consumers

websocket_urlpatterns = [
    path("ws/catalog/", consumers.ProductCatalogConsumer.as_asgi()),
    path("ws/catalog/admin/", consumers.ProductAdminConsumer.as_asgi()),
    path("ws/products/<int:product_id>/", consumers.ProductDetailConsumer.as_asgi()),
]
