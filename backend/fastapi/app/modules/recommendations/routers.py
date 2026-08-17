"""recommendations routers.

Meal/basket recommendations grounded in real catalog
"""

from fastapi import APIRouter

router = APIRouter(prefix="/recommendations", tags=["recommendations"])
