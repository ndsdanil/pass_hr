#!/usr/bin/env python3
"""
Скрипт для миграции данных из SQLite в PostgreSQL
"""
import asyncio
import sqlite3
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.core.config import get_settings
from app.models.user import User, UserTokens
from app.models.resume import Resume, TuningRequest

# Путь к файлу SQLite
SQLITE_DB_PATH = "./app.db"

# Получаем настройки для PostgreSQL
settings = get_settings()

async def migrate_data():
    """Миграция данных из SQLite в PostgreSQL"""
    print("Начинаем миграцию данных из SQLite в PostgreSQL...")
    
    # Проверяем существование файла SQLite
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"Файл базы данных SQLite не найден: {SQLITE_DB_PATH}")
        return
    
    # Подключаемся к SQLite
    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    
    # Создаем асинхронный движок для PostgreSQL
    pg_engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(pg_engine, class_=AsyncSession, expire_on_commit=False)
    
    # Создаем таблицы в PostgreSQL
    async with pg_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Мигрируем пользователей
    print("Миграция пользователей...")
    sqlite_cursor = sqlite_conn.cursor()
    sqlite_cursor.execute("SELECT * FROM users")
    users = sqlite_cursor.fetchall()
    
    async with async_session() as session:
        for user_row in users:
            user_dict = dict(user_row)
            user = User(**user_dict)
            session.add(user)
        await session.commit()
    
    # Мигрируем токены пользователей
    print("Миграция токенов пользователей...")
    sqlite_cursor.execute("SELECT * FROM user_tokens")
    tokens = sqlite_cursor.fetchall()
    
    async with async_session() as session:
        for token_row in tokens:
            token_dict = dict(token_row)
            token = UserTokens(**token_dict)
            session.add(token)
        await session.commit()
    
    # Мигрируем резюме
    print("Миграция резюме...")
    sqlite_cursor.execute("SELECT * FROM resumes")
    resumes = sqlite_cursor.fetchall()
    
    async with async_session() as session:
        for resume_row in resumes:
            resume_dict = dict(resume_row)
            resume = Resume(**resume_dict)
            session.add(resume)
        await session.commit()
    
    # Мигрируем запросы на оптимизацию
    print("Миграция запросов на оптимизацию...")
    sqlite_cursor.execute("SELECT * FROM tuning_requests")
    requests = sqlite_cursor.fetchall()
    
    async with async_session() as session:
        for request_row in requests:
            request_dict = dict(request_row)
            tuning_request = TuningRequest(**request_dict)
            session.add(tuning_request)
        await session.commit()
    
    # Закрываем соединение с SQLite
    sqlite_conn.close()
    
    print("Миграция данных завершена успешно!")

if __name__ == "__main__":
    asyncio.run(migrate_data()) 