import logging
import sys
from typing import Any
from pathlib import Path
from loguru import logger
from app.core.config import get_settings

settings = get_settings()

# Создаем директорию для логов если её нет
log_path = Path("logs")
log_path.mkdir(exist_ok=True)

# Конфигурация логгера
config = {
    "handlers": [
        # Хендлер для записи всех логов в файл
        {
            "sink": "logs/app.log",
            "format": "{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
            "rotation": "10 MB",  # Создавать новый файл каждые 10MB
            "compression": "zip",  # Сжимать старые файлы
            "retention": "1 month",  # Хранить логи месяц
        },
        # Хендлер для вывода ошибок в консоль
        {
            "sink": sys.stderr,
            "format": "<red>{time:HH:mm:ss}</red> | <level>{level}</level> | <cyan>{message}</cyan>",
            "colorize": True,
            "level": "ERROR",
        },
        # Хендлер для вывода информационных сообщений в консоль
        {
            "sink": sys.stdout,
            "format": "<green>{time:HH:mm:ss}</green> | <level>{level}</level> | <cyan>{message}</cyan>",
            "colorize": True,
            "level": "INFO",
        },
    ],
}

# Класс для интеграции loguru с стандартным logging Python
class InterceptHandler(logging.Handler):
    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back  # type: ignore
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )

# Настройка логирования
def setup_logging() -> None:
    """
    Настраивает систему логирования приложения.
    - Настраивает loguru с разными хендлерами для файла и консоли
    - Перехватывает логи от стандартной библиотеки logging
    - Настраивает уровни логирования в зависимости от окружения
    """
    # Удаляем стандартный хендлер loguru
    logger.remove()
    
    # Применяем нашу конфигурацию
    for handler in config["handlers"]:
        logger.add(**handler)

    # Перехватываем логи от стандартной библиотеки logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    
    # Устанавливаем уровень логирования в зависимости от окружения
    if settings.ENVIRONMENT == "development":
        logger.enable("app")
    else:
        logger.disable("app")

    # Список модулей, для которых мы хотим перехватывать логи
    logging_modules = [
        "uvicorn",
        "fastapi",
        "sqlalchemy",
    ]
    
    for module in logging_modules:
        mod_logger = logging.getLogger(module)
        mod_logger.handlers = [InterceptHandler()] 