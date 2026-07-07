# Docker инструкция для HR.plus Frontend

## Локальная разработка

Для локальной разработки с поддержкой hot-reload:

```bash
# Запуск контейнера для разработки
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка контейнера
docker-compose down
```

## Сборка production образа

```bash
# Сборка образа
docker build -t hr-plus-frontend:latest .

# Запуск контейнера
docker run -p 3000:3000 hr-plus-frontend:latest
```

## Конфигурация через переменные окружения

Dockerfile и Next.js настроены для использования переменных окружения:

| Переменная | Описание | Значение по умолчанию |
|------------|----------|------------------------|
| `NEXT_STANDALONE` | Включает режим standalone в Next.js | `true` в production |
| `NEXT_IGNORE_TS_ERRORS` | Игнорирует ошибки TypeScript при сборке | `true` в production |
| `NEXT_IGNORE_ESLINT` | Игнорирует ошибки ESLint при сборке | `true` в production |
| `ENABLE_TURBO` | Включает экспериментальный режим Turbo | `false` |

Пример запуска с переопределением переменных:

```bash
docker run -p 3000:3000 -e NEXT_IGNORE_TS_ERRORS=false hr-plus-frontend:latest
```

## Многоэтапная сборка

Dockerfile поддерживает следующие этапы сборки:

- `base` - базовый образ с Node.js
- `deps` - этап установки зависимостей
- `builder` - этап сборки приложения
- `runner` - финальный образ для запуска

Вы можете использовать их для оптимизации процесса сборки:

```bash
# Сборка только до этапа зависимостей (для разработки)
docker build --target deps -t hr-plus-frontend:deps .

# Сборка только до этапа builder (для CI/CD)
docker build --target builder -t hr-plus-frontend:builder .
```

## Оптимизация и безопасность

Образ оптимизирован для production с помощью:

1. Использования конфигурации через переменные окружения
2. Правильной настройки webpack для работы с canvas и PDF.js
3. Многоэтапной сборки для минимизации размера
4. Запуска от непривилегированного пользователя (nextjs:nodejs)
5. Настройки проверки работоспособности (HEALTHCHECK)

## CI/CD интеграция

Пример команды для CI/CD:

```bash
# Сборка и публикация образа
docker buildx build --platform linux/amd64,linux/arm64 -t your-registry.com/hr-plus-frontend:latest --push .
```

## Советы для оптимизации

- Используйте `docker-compose` для локальной разработки
- Для production всегда используйте тег с конкретной версией (`hr-plus-frontend:1.0.0`)
- Правильно настраивайте `.dockerignore` для уменьшения контекста сборки
- Используйте BuildKit для параллельной сборки: `DOCKER_BUILDKIT=1 docker build .` 