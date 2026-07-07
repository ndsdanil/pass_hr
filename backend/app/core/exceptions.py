from fastapi import HTTPException, status

class AuthError(HTTPException):
    """Базовый класс для ошибок аутентификации"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )

class InvalidTokenError(AuthError):
    """Исключение для невалидного токена"""
    def __init__(self):
        super().__init__("Недействительный или просроченный токен")

class RefreshTokenError(AuthError):
    """Исключение для ошибок refresh токена"""
    def __init__(self):
        super().__init__("Недействительный refresh токен")

class InsufficientTokensError(HTTPException):
    """Исключение для недостаточного количества токенов"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Недостаточно токенов для выполнения операции"
        )

class SubscriptionError(HTTPException):
    """Исключение для ошибок подписки"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )

class ResourceNotFoundError(HTTPException):
    """Исключение для отсутствующих ресурсов"""
    def __init__(self, resource_name: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource_name} не найден"
        )

class NotFoundError(HTTPException):
    """Исключение для отсутствующих ресурсов"""
    def __init__(self, detail: str = "Ресурс не найден"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )

class ForbiddenError(HTTPException):
    """Исключение для запрещенных действий"""
    def __init__(self, detail: str = "Доступ запрещен"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )

class DuplicateEmailError(HTTPException):
    """Исключение для дублирующегося email"""
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        ) 