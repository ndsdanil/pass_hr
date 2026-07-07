# HR Plus - Backend

## Описание

Backend-компонент системы HR Plus, основанный на FastAPI. Обеспечивает API для Frontend, взаимодействие с базой данных PostgreSQL и асинхронную обработку задач с использованием RabbitMQ.

## Технологии

- Python 3.11
- FastAPI - быстрый API-фреймворк
- SQLAlchemy - ORM для работы с базой данных
- Alembic - система миграций базы данных
- PostgreSQL - реляционная база данных
- RabbitMQ - очередь сообщений для асинхронной обработки
- JWT - для аутентификации и авторизации
- Pydantic - валидация данных и сериализация
- Loguru - расширенное логирование

## Переменные окружения

Для корректной работы backend необходимо настроить следующие переменные окружения:

```
# JWT Secret для аутентификации
SECRET_KEY=your_secret_key

# Настройки JWT
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# URL до базы данных
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/resume_tuner

# Режим работы (development/production)
ENVIRONMENT=development

# URL до сервиса резюме-тюнера
RESUME_TUNER_URL=http://resume-tuner:8001

# URL фронтенда для настройки CORS
FRONTEND_URL=http://frontend:3000

# API-ключ OpenAI
OPENAI_API_KEY=your_openai_api_key

# Настройки RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=admin
RABBITMQ_PASSWORD=admin123
RABBITMQ_QUEUE=resume_tuning_queue
RABBITMQ_RESULTS_QUEUE=resume_tuning_results_queue
```

## Установка и запуск

### Локальная разработка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/hr-plus-backend.git
cd hr-plus-backend
```

2. Создайте и активируйте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Настройте переменные окружения в файле `.env`

5. Запустите миграции базы данных:
```bash
alembic upgrade head
```

6. Запустите сервер для разработки:
```bash
uvicorn app.main:app --reload
```

Сервер будет доступен по адресу: [http://localhost:8000](http://localhost:8000)

Документация API: [http://localhost:8000/docs](http://localhost:8000/docs)

### Запуск с использованием Docker

Вы можете запустить backend как часть всей системы с использованием Docker Compose:

```bash
# В корневой директории проекта
cd infra
docker-compose up -d
```

Или собрать и запустить только образ backend:

```bash
docker build -t hr-plus-backend .
docker run -p 8000:8000 --env-file .env hr-plus-backend
```

## Структура проекта

```
backend/
├── app/
│   ├── api/                  # API endpoints
│   │   ├── v1/
│   │   │   ├── auth.py       # Аутентификация и регистрация
│   │   │   ├── resumes.py    # Работа с резюме
│   │   │   ├── vacancies.py  # Работа с вакансиями
│   │   │   └── tuning.py     # API тюнинга резюме
│   ├── core/                 # Базовая конфигурация
│   │   ├── config.py         # Конфигурация приложения
│   │   └── security.py       # Безопасность и JWT
│   ├── db/
│   │   ├── base.py           # Базовые классы
│   │   ├── session.py        # Сессия БД
│   │   └── init_db.py        # Инициализация БД
│   ├── models/               # SQLAlchemy модели
│   ├── schemas/              # Pydantic модели
│   ├── crud/                 # CRUD операции
│   ├── services/             # Бизнес-логика
│   │   └── rabbitmq.py       # Работа с RabbitMQ
│   └── main.py               # Точка входа приложения
├── alembic/                  # Миграции базы данных
├── tests/                    # Модульные и интеграционные тесты
├── alembic.ini               # Конфигурация Alembic
├── requirements.txt          # Зависимости проекта
└── Dockerfile                # Сборка Docker-контейнера
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход пользователя, получение токенов
- `POST /api/auth/refresh` - Обновление токена доступа
- `POST /api/auth/logout` - Выход из системы

### Профиль пользователя
- `GET /api/users/me` - Получение профиля пользователя
- `PUT /api/users/me` - Обновление профиля

### Резюме и вакансии
- `POST /api/resumes/` - Создание резюме
- `GET /api/resumes/` - Получение списка резюме пользователя
- `GET /api/resumes/{id}` - Получение резюме по ID
- `PUT /api/resumes/{id}` - Обновление резюме
- `DELETE /api/resumes/{id}` - Удаление резюме

- `POST /api/vacancies/` - Создание вакансии
- `GET /api/vacancies/` - Получение списка вакансий
- `GET /api/vacancies/{id}` - Получение вакансии по ID
- `PUT /api/vacancies/{id}` - Обновление вакансии
- `DELETE /api/vacancies/{id}` - Удаление вакансии

### Тюнинг резюме
- `POST /api/tuning/start` - Запуск процесса оптимизации резюме
- `GET /api/tuning/{id}` - Проверка статуса оптимизации
- `GET /api/tuning/{id}/result` - Получение результата оптимизации

## База данных

Для управления схемой базы данных используется Alembic:

```bash
# Создание новой миграции
alembic revision --autogenerate -m "описание миграции"

# Применение миграций
alembic upgrade head

# Откат миграции
alembic downgrade -1
```

## Запуск тестов

```bash
pytest
```

## Логирование

Логирование настроено с использованием Loguru. В production логи отправляются в stdout для сбора контейнерным оркестратором. 