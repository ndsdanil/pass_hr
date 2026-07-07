from datetime import datetime, timedelta
from typing import Optional, Tuple
from jose import JWTError, jwt, ExpiredSignatureError
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger
from app.core.config import get_settings
from app.models.user import User
from app.schemas.user import TokenPayload
from app.core.exceptions import InvalidTokenError, RefreshTokenError

settings = get_settings()
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
    bcrypt__ident="2b"
)


def create_access_token(subject: int) -> str:
    """
    Создает JWT access token для пользователя.
    
    Args:
        subject: ID пользователя
        
    Returns:
        str: Закодированный JWT токен
    """
    # Устанавливаем время истечения токена
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    # Создаем данные для токена
    to_encode = {
        "exp": expire,  # Время истечения
        "sub": str(subject),  # ID пользователя
        "type": "access"  # Тип токена
    }
    # Кодируем токен с помощью секретного ключа
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: int) -> str:
    """
    Создает JWT refresh token для пользователя.
    
    Args:
        subject: ID пользователя
        
    Returns:
        str: Закодированный JWT refresh токен
    """
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"  # Помечаем токен как refresh
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str, token_type: str = "access") -> TokenPayload:
    """
    Проверяет JWT токен и возвращает данные из него.
    
    Args:
        token: JWT токен для проверки
        token_type: Тип токена ("access" или "refresh")
        
    Returns:
        TokenPayload: Данные из токена
        
    Raises:
        InvalidTokenError: Если токен невалидный
        RefreshTokenError: Если refresh токен невалидный
    """
    try:
        # Декодируем токен
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Проверяем тип токена
        if payload.get("type") != token_type:
            raise InvalidTokenError()
        
        # Извлекаем ID пользователя
        token_data = TokenPayload(
            sub=int(payload.get("sub")),
            exp=payload.get("exp")
        )
        
        # Проверяем срок действия
        if datetime.fromtimestamp(token_data.exp) < datetime.utcnow():
            raise InvalidTokenError()
            
        return token_data
        
    except ExpiredSignatureError:
        logger.warning(f"Попытка использования просроченного {token_type} токена")
        if token_type == "refresh":
            raise RefreshTokenError()
        raise InvalidTokenError()
        
    except JWTError as e:
        logger.error(f"Ошибка при проверке {token_type} токена: {str(e)}")
        if token_type == "refresh":
            raise RefreshTokenError()
        raise InvalidTokenError()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Проверяет соответствие пароля его хешу.
    
    Args:
        plain_password: Пароль в открытом виде
        hashed_password: Хеш пароля
        
    Returns:
        bool: True если пароль соответствует хешу
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Создает хеш пароля.
    
    Args:
        password: Пароль в открытом виде
        
    Returns:
        str: Хеш пароля
    """
    return pwd_context.hash(password)


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Получает пользователя по email.
    
    Args:
        db: Сессия базы данных
        email: Email пользователя
        
    Returns:
        Optional[User]: Пользователь или None
    """
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """
    Получает пользователя по ID.
    
    Args:
        db: Сессия базы данных
        user_id: ID пользователя
        
    Returns:
        Optional[User]: Пользователь или None
    """
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str
) -> Tuple[Optional[User], Optional[str]]:
    """
    Аутентифицирует пользователя и возвращает токены.
    
    Args:
        db: Сессия базы данных
        email: Email пользователя
        password: Пароль пользователя
        
    Returns:
        Tuple[Optional[User], Optional[str]]: Пользователь и сообщение об ошибке
    """
    user = await get_user_by_email(db, email)
    if not user:
        logger.warning(f"Попытка входа с несуществующим email: {email}")
        return None, "Неверный email или пароль"
        
    if not verify_password(password, user.hashed_password):
        logger.warning(f"Неверный пароль для пользователя: {email}")
        return None, "Неверный email или пароль"
        
    logger.info(f"Успешная аутентификация пользователя: {email}")
    return user, None 