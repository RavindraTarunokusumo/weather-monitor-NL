"""Application settings for the API scaffold."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    app_name: str = "dutch-weather-intelligence"
    web_base_url: str = "http://localhost:3000"
    api_base_url: str = "http://localhost:8000"
    database_url: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/dutch_weather"
    )
    cors_allowed_origins: str = "http://localhost:3000"
    enable_mock_data: bool = True
    enable_ai_qna: bool = False
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
