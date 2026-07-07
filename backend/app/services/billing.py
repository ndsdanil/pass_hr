from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import UserTokens


class BillingService:
    TOKEN_PRICES = {
        "small": {"amount": 100, "price": 10},
        "medium": {"amount": 300, "price": 25},
        "large": {"amount": 1000, "price": 50}
    }

    @staticmethod
    async def get_token_balance(db: AsyncSession, user_id: int) -> Optional[UserTokens]:
        result = await db.execute(
            select(UserTokens)
            .where(UserTokens.user_id == user_id)
        )
        return result.scalars().first()

    @staticmethod
    async def add_tokens(db: AsyncSession, user_id: int, amount: int) -> UserTokens:
        # Получаем текущий баланс или создаем новый
        token_balance = await BillingService.get_token_balance(db, user_id)
        
        if token_balance:
            token_balance.balance += amount
        else:
            token_balance = UserTokens(
                user_id=user_id,
                balance=amount
            )
            db.add(token_balance)
        
        await db.commit()
        await db.refresh(token_balance)
        return token_balance

    @staticmethod
    async def spend_tokens(db: AsyncSession, user_id: int, amount: int) -> bool:
        token_balance = await BillingService.get_token_balance(db, user_id)
        
        if not token_balance or token_balance.balance < amount:
            return False

        token_balance.balance -= amount
        await db.commit()
        return True

    @staticmethod
    async def add_residual_tokens(db: AsyncSession, user_id: int, residual_amount: float) -> bool:
        """
        Добавляет остаточные токены пользователю после оптимизации резюме
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            residual_amount: Количество токенов для возврата (может быть дробным)
            
        Returns:
            bool: True если операция успешна, False в случае ошибки
        """
        try:
            token_balance = await BillingService.get_token_balance(db, user_id)
            
            if not token_balance:
                # Если записи нет, создаем новую
                token_balance = UserTokens(
                    user_id=user_id,
                    balance=residual_amount
                )
                db.add(token_balance)
            else:
                # Добавляем остаточные токены к существующему балансу
                token_balance.balance += residual_amount
            
            await db.commit()
            await db.refresh(token_balance)
            return True
            
        except Exception as e:
            await db.rollback()
            return False

    @staticmethod
    def get_token_packages():
        return list(BillingService.TOKEN_PRICES.values()) 