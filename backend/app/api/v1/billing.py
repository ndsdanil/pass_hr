from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict
from app.models.base import get_db
from app.services.billing import BillingService
from app.schemas.user import TokenBalance, TokenPurchase, TokenRequest, TokenRequestResponse, ContactMessage, ContactMessageResponse
from app.api.v1.auth import get_current_user, oauth2_scheme
from app.models.user import User
from app.services.telegram_service import notify_token_request, notify_contact_message

router = APIRouter()

@router.get("/packages", response_model=List[Dict])
async def get_token_packages():
    """Получить список доступных пакетов токенов"""
    return BillingService.get_token_packages()

@router.get("/balance", response_model=TokenBalance)
async def get_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить текущий баланс токенов пользователя"""
    balance = await BillingService.get_token_balance(db, current_user.id)
    if not balance:
        # Если записи нет, создаем новую с нулевым балансом
        balance = await BillingService.add_tokens(db, current_user.id, 0)
    return balance

@router.post("/purchase", response_model=TokenBalance)
async def purchase_tokens(
    package_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Купить токены"""
    try:
        # Получаем информацию о пакете
        package = BillingService.TOKEN_PRICES.get(package_id)
        if not package:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid package ID"
            )
        
        # В будущем здесь будет интеграция с платежной системой
        # Сейчас просто добавляем токены
        balance = await BillingService.add_tokens(db, current_user.id, package["amount"])
        return balance
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


PACKAGE_LABELS = {
    "starter":      {"name": "Starter",      "tokens": 50,  "price": 5},
    "professional": {"name": "Professional", "tokens": 250, "price": 25},
    "expert":       {"name": "Expert",       "tokens": 500, "price": 50},
}


@router.post("/request-tokens", response_model=TokenRequestResponse)
async def request_tokens(
    body: TokenRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Отправляет заявку на покупку токенов администратору через Telegram.
    Токены зачисляются вручную после подтверждения оплаты.
    """
    pkg = PACKAGE_LABELS.get(body.package_id)
    if not pkg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown package_id"
        )

    sent = await notify_token_request(
        user_email=current_user.email,
        user_name=current_user.name,
        package_name=pkg["name"],
        package_tokens=pkg["tokens"],
        package_price=pkg["price"],
        contact=body.contact or "",
        message=body.message or "",
    )

    if sent:
        return TokenRequestResponse(
            success=True,
            detail="Request sent! We will contact you shortly."
        )
    else:
        return TokenRequestResponse(
            success=False,
            detail="Failed to send request. Please try again later."
        )


@router.post("/contact", response_model=ContactMessageResponse)
async def contact_us(body: ContactMessage):
    """
    Публичный эндпоинт — отправляет сообщение из формы обратной связи в Telegram.
    Авторизация не требуется.
    """
    if not body.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )

    sent = await notify_contact_message(
        name=body.name or "",
        email=body.email,
        message=body.message.strip(),
    )

    if sent:
        return ContactMessageResponse(
            success=True,
            detail="Your message has been sent! We'll get back to you soon."
        )
    else:
        return ContactMessageResponse(
            success=False,
            detail="Failed to send message. Please try again later."
        ) 