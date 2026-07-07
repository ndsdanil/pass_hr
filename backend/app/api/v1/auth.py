from fastapi import APIRouter, Depends, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger
from app.models.base import get_db
from app.schemas.user import UserCreate, User, Token
from app.services.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    get_password_hash,
    get_user_by_email,
    get_user_by_id,
    verify_token
)
from app.models.user import User as UserModel, UserTokens
from app.core.exceptions import (
    DuplicateEmailError,
    InvalidTokenError,
    RefreshTokenError
)
from app.core.config import get_settings
from sqlalchemy import select

settings = get_settings()
router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    scheme_name="OAuth2",
    description="Используйте email в качестве username"
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Получает текущего пользователя по токену.
    Используется как dependency в защищенных эндпоинтах.
    
    Args:
        token: JWT токен
        db: Сессия базы данных
        
    Returns:
        User: Текущий пользователь
        
    Raises:
        InvalidTokenError: Если токен невалидный
    """
    # Проверяем токен и получаем данные
    token_data = verify_token(token)
    
    # Получаем пользователя из базы
    user = await get_user_by_id(db, token_data.sub)
    if not user:
        logger.warning(f"Пользователь с ID {token_data.sub} не найден")
        raise InvalidTokenError()
        
    return user


@router.post("/register", response_model=User)
async def register(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Регистрация нового пользователя.
    
    Args:
        user: Данные пользователя
        db: Сессия базы данных
        
    Returns:
        User: Созданный пользователь
        
    Raises:
        DuplicateEmailError: Если email уже зарегистрирован
    """
    # Проверяем, не занят ли email
    db_user = await get_user_by_email(db, user.email)
    if db_user:
        logger.warning(f"Попытка регистрации с существующим email: {user.email}")
        raise DuplicateEmailError()
    
    # Проверяем invite code и определяем количество токенов
    bonus_tokens = 0
    if user.invite_code and user.invite_code == "GORA":
        bonus_tokens = 50
        logger.info(f"Регистрация с валидным invite code: {user.email}")
    else:
        logger.info(f"Регистрация без invite code или с невалидным кодом: {user.email}")
    
    # Создаем нового пользователя
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        phone=user.phone,
        company=user.company,
        position=user.position,
        bio=user.bio,
        avatar_url=user.avatar_url
    )
    
    try:
        # Добавляем пользователя
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        
        # Создаем запись с токенами
        user_tokens = UserTokens(
            user_id=db_user.id,
            balance=bonus_tokens  # Начисляем токены только при валидном invite code
        )
        db.add(user_tokens)
        await db.commit()
        
        # Получаем свежие данные из базы
        result = await db.execute(
            select(UserModel).where(UserModel.id == db_user.id)
        )
        db_user = result.scalar_one()
        
        if bonus_tokens > 0:
            logger.info(f"Зарегистрирован новый пользователь: {user.email} с балансом {bonus_tokens} токенов")
        else:
            logger.info(f"Зарегистрирован новый пользователь: {user.email} без бонусных токенов")
        return db_user
    except Exception as e:
        await db.rollback()
        logger.error(f"Ошибка при регистрации пользователя {user.email}: {str(e)}")
        raise


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
    response: Response = None
):
    """
    Вход в систему.
    
    Args:
        form_data: Данные формы (username = email, password)
        db: Сессия базы данных
        response: HTTP Response для установки cookie
        
    Returns:
        Token: Токены доступа
        
    Raises:
        InvalidTokenError: Если данные неверны
    """
    # Аутентифицируем пользователя
    user, error_message = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise InvalidTokenError()
    
    # Создаем токены
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    # Устанавливаем HttpOnly cookie для refresh токена
    settings = get_settings()
    secure = settings.ENVIRONMENT == "production"
    domain = None
    same_site = "lax"
    
    # В production устанавливаем более строгие параметры
    if settings.ENVIRONMENT == "production":
        same_site = "strict"
    
    # Устанавливаем cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,  # Недоступен для JavaScript
        secure=secure,  # HTTPS only в production
        samesite=same_site,  # Защита от CSRF
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # в секундах
        domain=domain,
        path="/"
    )
    
    logger.info(f"Успешный вход пользователя: {user.email}")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,  # Оставляем для обратной совместимости
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    response: Response,
    token: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Обновление access токена с помощью refresh токена.
    
    Args:
        request: HTTP Request для получения cookie
        response: HTTP Response для обновления cookie
        token: Refresh токен (опционально, если не передан, берется из cookie)
        db: Сессия базы данных
        
    Returns:
        Token: Новые токены
        
    Raises:
        RefreshTokenError: Если refresh токен невалидный
    """
    try:
        # Получаем refresh токен из cookie, если не передан в параметрах
        if not token:
            token = request.cookies.get("refresh_token")
        
        if not token:
            raise RefreshTokenError()
        
        # Проверяем refresh токен
        token_data = verify_token(token, token_type="refresh")
        
        # Получаем пользователя
        user = await get_user_by_id(db, token_data.sub)
        if not user:
            raise RefreshTokenError()
            
        # Создаем новые токены
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        
        # Обновляем refresh токен в cookie
        settings = get_settings()
        secure = settings.ENVIRONMENT == "production"
        domain = None
        same_site = "lax"
        
        # В production устанавливаем более строгие параметры
        if settings.ENVIRONMENT == "production":
            same_site = "strict"
        
        # Устанавливаем обновленную cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=secure,
            samesite=same_site,
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            domain=domain,
            path="/"
        )
        
        logger.info(f"Обновлены токены для пользователя: {user.email}")
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,  # Оставляем для обратной совместимости
            "token_type": "bearer"
        }
        
    except Exception as e:
        logger.error(f"Ошибка при обновлении токенов: {str(e)}")
        raise RefreshTokenError()


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(response: Response):
    """
    Выход из системы (очистка cookie).
    
    Args:
        response: HTTP Response для удаления cookie
    """
    # Удаляем refresh токен из cookie с правильными параметрами
    response.delete_cookie(
        key="refresh_token",
        path="/",
        domain=None,
        secure=None,
        httponly=True,
        samesite="lax"
    )
    
    # Устанавливаем куку с истекшим сроком действия для большей надежности
    response.set_cookie(
        key="refresh_token",
        value="",
        max_age=0,
        expires="Thu, 01 Jan 1970 00:00:00 GMT",
        path="/",
        domain=None,
        secure=None,
        httponly=True,
        samesite="lax"
    )
    
    return {"message": "Успешный выход из системы"}


@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Получение информации о текущем пользователе.
    
    Args:
        current_user: Текущий пользователь (внедряется через dependency)
        
    Returns:
        User: Информация о пользователе
    """
    return current_user 