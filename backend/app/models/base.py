from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime
from typing import Any

from app.core.config import get_settings

settings = get_settings()

class Base(DeclarativeBase):
    def __init__(self, **kwargs: Any):
        for key, value in kwargs.items():
            setattr(self, key, value)
        # Не устанавливаем значения по умолчанию для полей created_at и updated_at
        # Они будут установлены на уровне базы данных через server_default и onupdate

# Добавляем настройки пула соединений для решения проблемы с конкурентными запросами
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=False,  # Отключаем логирование SQL для производительности
    pool_size=50,  # Увеличиваем размер пула соединений для большого числа пользователей
    max_overflow=50,  # Разрешаем больше дополнительных соединений при пиковой нагрузке
    pool_timeout=60,  # Увеличиваем таймаут ожидания соединения
    pool_recycle=1800,  # Переиспользуем соединения каждые 30 минут
    pool_pre_ping=True,  # Проверяем соединение перед использованием
    pool_use_lifo=True,  # Используем LIFO вместо FIFO для лучшей производительности при высокой нагрузке
    max_identifier_length=63  # Максимальная длина идентификатора в PostgreSQL
)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session 