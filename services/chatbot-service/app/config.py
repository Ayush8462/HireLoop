import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PORT: int = 5005
    ENVIRONMENT: str = "production"
    GEMINI_API_KEY: Optional[str] = None
    MODEL_NAME: str = "gemini-1.5-flash"
    SIMILARITY_THRESHOLD: float = 0.12
    TOP_K_CHUNKS: int = 4
    CORE_SERVICE_URL: str = "http://core-service:5002"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
