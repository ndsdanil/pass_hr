from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Resume Tuner API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    DATABASE_URL: str
    ENVIRONMENT: str
    OPENAI_API_KEY: str
    
    # URL фронтенда для CORS
    FRONTEND_URL: str
    
    # Настройки CORS - изменяем на строку для парсинга из .env
    CORS_ORIGINS: str = ""
    
    # Telegram уведомления (для заявок на покупку токенов)
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    # Настройки RabbitMQ
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USERNAME: str = "admin"
    RABBITMQ_PASSWORD: str = ""
    RABBITMQ_QUEUE: str = "resume_tuning_queue"
    RABBITMQ_RESULTS_QUEUE: str = "resume_tuning_results_queue"
    
    @property
    def SYNC_DATABASE_URI(self) -> str:
        """
        Возвращает URI для синхронного подключения к базе данных
        """
        return self.DATABASE_URL.replace("postgresql+asyncpg", "postgresql")
    
    @property
    def cors_origins_list(self) -> List[str]:
        """
        Возвращает список CORS origins, парся строку с запятыми
        """
        if not self.CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings() 