"""
Сервис отправки уведомлений в Telegram.
Используется для уведомлений об заявках на покупку токенов.
"""
import logging
from datetime import datetime, timezone

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def send_telegram_message(text: str) -> bool:
    """
    Отправляет сообщение в Telegram-чат администратора через Bot API.
    Возвращает True при успехе, False при ошибке (не бросает исключений).
    """
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    if not token or not chat_id:
        logger.warning("Telegram не настроен (TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не указаны)")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                logger.info("Telegram message sent successfully")
                return True
            else:
                logger.error(
                    "Telegram API error: %s — %s",
                    response.status_code, response.text
                )
                return False
    except Exception as exc:
        logger.error("Failed to send Telegram message: %r", exc, exc_info=True)
        return False


async def notify_contact_message(
    name: str,
    email: str,
    message: str,
) -> bool:
    """Отправляет сообщение из формы обратной связи."""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    parts = [
        "📩 <b>Новое сообщение (Contact Us)</b>",
        "",
        f"<b>Имя:</b> {name or '—'}",
        f"<b>Email:</b> {email}",
        "",
        f"<b>Сообщение:</b>\n{message}",
        "",
        f"🕐 {now}",
    ]
    return await send_telegram_message("\n".join(parts))


async def notify_token_request(
    user_email: str,
    user_name: str | None,
    package_name: str,
    package_tokens: int,
    package_price: float,
    contact: str,
    message: str,
) -> bool:
    """
    Формирует и отправляет уведомление о заявке на покупку токенов.
    """
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    name_line = f"<b>Имя:</b> {user_name}" if user_name else ""
    contact_line = f"<b>Контакт:</b> {contact}" if contact else ""
    message_line = f"<b>Сообщение:</b> {message}" if message else ""

    parts = [
        "🔔 <b>Новая заявка на токены</b>",
        "",
        f"<b>Email:</b> {user_email}",
    ]
    if name_line:
        parts.append(name_line)
    if contact_line:
        parts.append(contact_line)
    parts += [
        "",
        f"<b>Пакет:</b> {package_name}",
        f"<b>Токены:</b> {package_tokens}",
        f"<b>Сумма:</b> ${package_price}",
    ]
    if message_line:
        parts += ["", message_line]
    parts += ["", f"🕐 {now}"]

    text = "\n".join(parts)
    return await send_telegram_message(text)
