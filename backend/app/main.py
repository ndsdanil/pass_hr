from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, billing, resume, users
from app.core.config import get_settings
from app.models.base import Base, engine
from app.services.rabbitmq_consumer import rabbitmq_consumer
from typing import List

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": True,
    },
    swagger_ui_oauth2_redirect_url="/oauth2-redirect",
)

# Формируем список разрешенных источников для CORS
origins: List[str] = settings.cors_origins_list

# Если есть frontend_url, добавляем его в список
if settings.FRONTEND_URL:
    origins.append(settings.FRONTEND_URL)

# Всегда разрешаем запросы с localhost, даже в production
# Это нужно для разработки и тестирования с использованием Docker
origins.extend([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://frontend:3000"
])

# Если список пустой, разрешаем все источники (только для разработки!)
if not origins and settings.ENVIRONMENT == "development":
    origins = ["*"]

# Настройка CORS с поддержкой cookies
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Важно для работы с cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роуты
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"]
)
app.include_router(
    billing.router,
    prefix=f"{settings.API_V1_STR}/billing",
    tags=["billing"]
)
app.include_router(
    resume.router,
    prefix=f"{settings.API_V1_STR}/resume",
    tags=["resume"]
)
app.include_router(
    users.router,
    prefix=f"{settings.API_V1_STR}/users",
    tags=["users"]
)


@app.on_event("startup")
async def startup():
    # Создаем таблицы в базе данных
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Очищаем очереди RabbitMQ при запуске для экономии места на диске
    from app.services.rabbitmq_client import rabbitmq_client
    rabbitmq_client.purge_queues()
    
    # Запускаем потребителя RabbitMQ при старте приложения
    rabbitmq_consumer.start()


@app.on_event("shutdown")
async def shutdown():
    # Останавливаем потребителя RabbitMQ
    rabbitmq_consumer.stop()
    
    # Останавливаем клиент RabbitMQ
    from app.services.rabbitmq_client import rabbitmq_client
    rabbitmq_client.stop()


@app.get("/")
async def root():
    return {
        "message": "Welcome to Resume Tuner API",
        "version": settings.VERSION
    } 