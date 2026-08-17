"""integrations routers.

Clients to Django APIs and external providers
"""

from fastapi import APIRouter

router = APIRouter(prefix="/integrations", tags=["integrations"])
