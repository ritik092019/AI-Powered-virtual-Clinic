import os
import json
from typing import List, Union, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Rural Virtual Clinic"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production_1234567890")
    API_V1_PREFIX: str = "/api/v1"
    
    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "*"
    ]

    @property
    def postgres_password(self) -> str:
        return os.getenv("POSTGRES_PASSWORD", "postgres")

    @property
    def postgres_user(self) -> str:
        return os.getenv("POSTGRES_USER", "postgres")

    @property
    def postgres_host(self) -> str:
        return os.getenv("POSTGRES_HOST", "127.0.0.1")

    @property
    def postgres_port(self) -> str:
        return os.getenv("POSTGRES_PORT", "5432")

    @property
    def postgres_db(self) -> str:
        return os.getenv("POSTGRES_DB", "virtual_clinic")

    @property
    def database_url(self) -> str:
        from urllib.parse import quote_plus
        if os.getenv("DATABASE_URL"):
            return os.getenv("DATABASE_URL")
        pwd = quote_plus(self.postgres_password)
        return f"postgresql://{self.postgres_user}:{pwd}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "127.0.0.1")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "virtual_clinic")
    DATABASE_URL: str = ""

    # Redis Settings
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    REDIS_URL: str = os.getenv("REDIS_URL", f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', '6379')}/0")

    # Celery Settings
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', '6379')}/1")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", f"redis://{os.getenv('REDIS_HOST', 'localhost')}:{os.getenv('REDIS_PORT', '6379')}/2")

    # JWT Security Settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    ALGORITHM: str = "HS256"

    # AI & Speech & OCR Provider Configurations
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock") # mock, openai, gemini
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    STT_PROVIDER: str = os.getenv("STT_PROVIDER", "mock") # mock, whisper
    OCR_PROVIDER: str = os.getenv("OCR_PROVIDER", "mock") # mock, paddleocr, tesseract
    WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "base")

    def get_cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            try:
                return json.loads(self.CORS_ORIGINS)
            except Exception:
                return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
        extra = "ignore"

settings = Settings()
