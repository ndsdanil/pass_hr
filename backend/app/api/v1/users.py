from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base import get_db
from app.models.user import User
from app.services.user import UserService
from app.schemas.user import UserUpdate, PasswordUpdate
from app.api.v1.auth import get_current_user
from app.services.auth import get_password_hash, verify_password
from sqlalchemy import select, delete

router = APIRouter()

@router.put("/me/password", status_code=status.HTTP_200_OK)
async def update_password(
    password_update: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновить пароль пользователя"""
    # Проверяем текущий пароль
    if not verify_password(password_update.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Обновляем пароль
    current_user.hashed_password = get_password_hash(password_update.new_password)
    db.add(current_user)
    await db.commit()
    return {"message": "Password updated successfully"}

@router.put("/me/email", status_code=status.HTTP_200_OK)
async def update_email(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновить email пользователя"""
    # Проверяем, не занят ли email
    if await UserService.get_user_by_email(db, user_update.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    current_user.email = user_update.email
    db.add(current_user)
    await db.commit()
    return {"message": "Email updated successfully"}

@router.delete("/me", status_code=status.HTTP_200_OK)
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить аккаунт пользователя"""
    try:
        # Получаем ID пользователя для логирования
        user_id = current_user.id
        
        # Сначала найдем все резюме пользователя
        from app.models.resume import Resume
        
        # Получаем список ID всех резюме пользователя
        resume_query = select(Resume.id).where(Resume.user_id == user_id)
        resume_ids = [row[0] for row in (await db.execute(resume_query)).all()]
        
        # Удаляем все tuned_resumes для этих резюме
        if resume_ids:
            from app.models.resume import TunedResume
            await db.execute(
                delete(TunedResume).where(TunedResume.resume_id.in_(resume_ids))
            )
            
            # Удаляем все job_descriptions для этих резюме
            from app.models.resume import JobDescription
            await db.execute(
                delete(JobDescription).where(JobDescription.resume_id.in_(resume_ids))
            )
            
            # Удаляем сами резюме
            await db.execute(
                delete(Resume).where(Resume.user_id == user_id)
            )
        
        # Удаляем подписки пользователя
        from app.models.user import Subscription
        await db.execute(
            delete(Subscription).where(Subscription.user_id == user_id)
        )
        
        # Удаляем токены пользователя
        from app.models.user import UserTokens
        await db.execute(
            delete(UserTokens).where(UserTokens.user_id == user_id)
        )
        
        # Наконец, удаляем самого пользователя
        await db.delete(current_user)
        await db.commit()
        
        return {"message": "Account and all related data deleted successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        ) 