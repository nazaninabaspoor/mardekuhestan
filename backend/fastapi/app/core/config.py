from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "MardeKuhestan AI Service"
    ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    REDIS_URL: str = "redis://127.0.0.1:6379/0"
    CELERY_BROKER_URL: str = "amqp://mardekoohestan:change-me@127.0.0.1:5672//"
    CELERY_RESULT_BACKEND: str = "redis://127.0.0.1:6379/1"

    DJANGO_BASE_URL: str = "http://127.0.0.1:8000"
    JWT_SECRET: str = "change-me"

    KAFKA_BOOTSTRAP_SERVERS: str = "127.0.0.1:9092"
    OPENSEARCH_HOST: str = "127.0.0.1"
    OPENSEARCH_PORT: int = 9200
    QDRANT_URL: str = "http://127.0.0.1:6333"

    MINIO_ENDPOINT_URL: str = "http://127.0.0.1:9010"
    MINIO_ROOT_USER: str = "mardekoohestan"
    MINIO_ROOT_PASSWORD: str = "change-me-minio-strong"
    MINIO_BUCKET_NAME: str = "mardekoohestan"

    OPENAI_API_KEY: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
