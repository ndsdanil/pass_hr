# syntax=docker/dockerfile:1.4
# Базовый образ с минимальной версией Node.js
FROM node:22-alpine AS base

# Обновляем npm и устанавливаем необходимые пакеты
RUN npm install -g npm@latest && \
    apk add --no-cache libc6-compat tzdata

# Рабочая директория
WORKDIR /app

# Stage 1: Зависимости
FROM base AS deps

# Копируем только файлы, нужные для установки зависимостей
COPY package.json package-lock.json* ./

# Устанавливаем зависимости с кэшированием слоев Docker
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Stage 2: Сборка
FROM base AS builder
WORKDIR /app

# Копируем зависимости из предыдущего этапа
COPY --from=deps /app/node_modules ./node_modules

# Копируем исходный код
COPY . .

# Устанавливаем переменные окружения для сборки
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_STANDALONE=true \
    NEXT_IGNORE_TS_ERRORS=true \
    NEXT_IGNORE_ESLINT=true

# Собираем приложение (standalone сборка для минимизации размера)
RUN npm run build

# Stage 3: Запуск - минимальный образ
FROM node:22-alpine AS runner
WORKDIR /app

# Устанавливаем только необходимые пакеты
RUN apk add --no-cache tzdata && \
    addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nextjs

# Устанавливаем переменные окружения
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    TZ=Europe/Moscow

# Копируем необходимые файлы из сборки
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Устанавливаем правильные права
RUN mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app/.next

# Переключаемся на непривилегированного пользователя
USER nextjs

# Открываем порт
EXPOSE 3000

# Проверка работоспособности приложения
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q -O- http://localhost:3000/ || exit 1

# Запускаем приложение
CMD ["node", "server.js"] 