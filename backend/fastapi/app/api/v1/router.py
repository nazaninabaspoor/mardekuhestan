from fastapi import APIRouter

from app.api.v1 import health
from app.modules.assistant.routers import router as assistant_router
from app.modules.automation.routers import router as automation_router
from app.modules.integrations.routers import router as integrations_router
from app.modules.knowledge.routers import router as knowledge_router
from app.modules.recommendations.routers import router as recommendations_router

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(assistant_router)
api_router.include_router(recommendations_router)
api_router.include_router(knowledge_router)
api_router.include_router(automation_router)
api_router.include_router(integrations_router)
