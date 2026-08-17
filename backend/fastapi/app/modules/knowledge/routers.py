"""knowledge routers.

RAG / Qdrant brand+product knowledge layer
"""

from fastapi import APIRouter

router = APIRouter(prefix="/knowledge", tags=["knowledge"])
