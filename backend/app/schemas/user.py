from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str
    invite_code: Optional[str] = None


class UserUpdate(UserBase):
    pass


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: int
    exp: int


class SubscriptionBase(BaseModel):
    plan_name: str
    tokens_balance: int
    start_date: datetime
    end_date: datetime


class SubscriptionCreate(SubscriptionBase):
    user_id: int


class Subscription(SubscriptionBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenBalance(BaseModel):
    balance: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenPurchase(BaseModel):
    amount: int  # количество токенов для покупки


class ContactMessage(BaseModel):
    name: Optional[str] = None
    email: str
    message: str


class ContactMessageResponse(BaseModel):
    success: bool
    detail: str


class TokenRequest(BaseModel):
    package_id: str        # "starter" | "professional" | "expert"
    contact: Optional[str] = None   # telegram / телефон пользователя
    message: Optional[str] = None   # произвольное сообщение


class TokenRequestResponse(BaseModel):
    success: bool
    detail: str 