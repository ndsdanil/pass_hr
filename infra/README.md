# HR Plus - Инфраструктура

## Описание

Инфраструктурный компонент системы HR Plus, отвечающий за настройку и развертывание всех компонентов проекта с использованием Docker и Docker Compose. Централизованная конфигурация позволяет запустить все компоненты системы в контейнерах с правильными настройками и взаимодействием между ними.

## Компоненты системы

Инфраструктура объединяет следующие компоненты системы HR Plus:
- **Frontend** (Next.js) - Веб-интерфейс для пользователей
- **Backend** (FastAPI) - Серверная часть системы с основной бизнес-логикой
- **Resume-tuner** (Python) - Сервис для оптимизации резюме
- **PostgreSQL** - База данных для хранения информации
- **RabbitMQ** - Система очередей для асинхронной обработки

## Структура каталога

```
infra/
├── docker-compose.yml    # Основной файл Docker Compose
├── .env                  # Файл с переменными окружения
└── README.md             # Документация инфраструктуры
```

## Требования для развертывания

- Docker Engine (версия 20.10+)
- Docker Compose (версия 2.0+)
- 4 ГБ RAM минимум (рекомендуется 8+ ГБ)
- 10 ГБ свободного дискового пространства
- Интернет-соединение (для загрузки образов)

## Переменные окружения

Перед запуском системы необходимо настроить файл `.env` со следующими параметрами:

```
# JWT Secret для backend
SECRET_KEY=your_secret_key

# URL до API resume-tuner для backend
RESUME_TUNER_URL=http://resume-tuner:8001

# URL до frontend для CORS в backend
FRONTEND_URL=http://frontend:3000

# Настройки JWT
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# URL до базы данных
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/resume_tuner

# Режим работы (development/production)
ENVIRONMENT=production

# API-ключ OpenAI (крайне важен для работы системы)
OPENAI_API_KEY=your_openai_api_key

# Настройки RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=admin
RABBITMQ_PASSWORD=admin123
RABBITMQ_QUEUE=resume_tuning_queue
RABBITMQ_RESULTS_QUEUE=resume_tuning_results_queue


# URL до API для frontend
NEXT_PUBLIC_API_URL=http://backend:8000/api
```

> **ВАЖНО**: Замените `your_secret_key` на надежный секретный ключ и `your_openai_api_key` на действительный API-ключ OpenAI.

## Развертывание системы

### Первый запуск

1. Клонируйте репозитории всех компонентов:
```bash
# Клонирование репозиториев (если они не клонированы)
git clone https://github.com/yourusername/hr-plus-frontend.git frontend
git clone https://github.com/yourusername/hr-plus-backend.git backend
git clone https://github.com/yourusername/hr-plus-resume-tuner.git resume-tuner
git clone https://github.com/yourusername/hr-plus-infra.git infra
```

2. Перейдите в каталог инфраструктуры:
```bash
cd infra
```

3. Настройте файл `.env` с необходимыми переменными окружения

4. Запустите систему с помощью Docker Compose:
```bash
docker-compose up -d
```

5. Проверьте статус запущенных контейнеров:
```bash
docker-compose ps
```

### Остановка системы

```bash
docker-compose down
```

Для полной очистки, включая тома (удалит все данные):
```bash
docker-compose down -v
```

### Обновление компонентов

Для обновления компонентов системы:

```bash
# Остановка текущих контейнеров
docker-compose down

# Обновление исходного кода
cd ../frontend && git pull
cd ../backend && git pull
cd ../resume-tuner && git pull
cd ../infra && git pull

# Пересборка и перезапуск контейнеров
docker-compose up -d --build
```

## Доступ к сервисам

После запуска системы будут доступны следующие сервисы:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Backend API Docs**: http://localhost:8000/docs
- **Resume-tuner API**: http://localhost:8001 (если запущен в режиме HTTP)
- **RabbitMQ Management**: http://localhost:15672 (login: admin, password: admin123)
- **PostgreSQL**: localhost:5432 (user: postgres, password: postgres)

## Мониторинг и логи

### Просмотр логов контейнеров

```bash
# Логи всех сервисов
docker-compose logs

# Логи конкретного сервиса
docker-compose logs backend
docker-compose logs frontend
docker-compose logs resume-tuner

# Логи в реальном времени
docker-compose logs -f
```

### Проверка статуса контейнеров

```bash
docker-compose ps
```

## Управление данными

### Резервное копирование базы данных

```bash
docker-compose exec postgres pg_dump -U postgres resume_tuner > backup_$(date +%Y%m%d).sql
```

### Восстановление базы данных

```bash
cat backup_file.sql | docker-compose exec -T postgres psql -U postgres resume_tuner
```

## Решение проблем

### Контейнер не запускается или останавливается

Проверьте логи:
```bash
docker-compose logs <service_name>
```

### RabbitMQ не запускается

Убедитесь, что тома RabbitMQ имеют правильные разрешения:
```bash
docker-compose down -v
docker-compose up -d
```

### Проблемы доступа к API

Проверьте настройки CORS в файле `.env` и корректность URL-адресов.

## Производительность и масштабирование

Для улучшения производительности в production-среде, рекомендуется:

1. Использовать внешнюю базу данных PostgreSQL с репликацией
2. Настроить балансировщик нагрузки перед frontend и backend
3. Запустить несколько экземпляров resume-tuner для параллельной обработки
4. Настроить кластер RabbitMQ для отказоустойчивости 