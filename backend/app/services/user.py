from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User

class UserService:
    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        """Получить пользователя по email"""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
        """Получить пользователя по ID"""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(db: AsyncSession, email: str, hashed_password: str) -> User:
        """Создать нового пользователя"""
        user = User(email=email, hashed_password=hashed_password)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user 