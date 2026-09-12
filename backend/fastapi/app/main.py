from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.modules.support.hub import support_hub


@asynccontextmanager
async def lifespan(app: FastAPI):
    await support_hub.startup()
    try:
        yield
    finally:
        await support_hub.shutdown()


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.get("/")
    def root():
        return {
            "service": settings.APP_NAME,
            "env": settings.ENV,
            "docs": "/docs",
            "support_ws": f"{settings.API_V1_PREFIX}/support/ws",
        }

    return app


app = create_app()
