from typing import Optional, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from sqlalchemy.orm import joinedload, selectinload
from app.models.resume import Resume, JobDescription, TunedResume, TuningStatus
from app.schemas.resume import TunedResumeCreate
from app.services.billing import BillingService
from app.services.openai_service import openai_service
import logging

logger = logging.getLogger(__name__)

class ResumeService:
    TOKENS_PER_TUNE = 5

    @staticmethod
    async def create_resume(
        db: AsyncSession,
        user_id: int,
        original_text: str,
        title: Optional[str] = None
    ) -> Resume:
        try:
            logger.info(f"Creating new resume for user {user_id}")
            resume = Resume(
                user_id=user_id,
                original_text=original_text,
                title=title
            )
            db.add(resume)
            await db.commit()
            await db.refresh(resume)
            # Убедимся, что created_at не None
            if resume.created_at is None:
                # Получаем текущее время из базы данных
                result = await db.execute(text("SELECT NOW()"))
                current_time = result.scalar()
                resume.created_at = current_time
                await db.commit()
                await db.refresh(resume)
            logger.info(f"Successfully created resume {resume.id} for user {user_id}")
            return resume
        except Exception as e:
            logger.error(f"Error creating resume for user {user_id}: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def update_resume_title(
        db: AsyncSession,
        resume_id: int,
        user_id: int,
        title: str
    ) -> Optional[Resume]:
        try:
            logger.info(f"Updating title for resume {resume_id}")
            result = await db.execute(
                select(Resume)
                .where(Resume.id == resume_id, Resume.user_id == user_id)
            )
            resume = result.scalar_one_or_none()
            if resume:
                resume.title = title
                await db.commit()
                await db.refresh(resume)
                logger.info(f"Successfully updated title for resume {resume_id}")
            else:
                logger.warning(f"Resume {resume_id} not found for user {user_id}")
            return resume
        except Exception as e:
            logger.error(f"Error updating resume title {resume_id}: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def delete_resume(
        db: AsyncSession,
        resume_id: int,
        user_id: int
    ) -> bool:
        result = await db.execute(
            select(Resume)
            .where(Resume.id == resume_id, Resume.user_id == user_id)
        )
        resume = result.scalar_one_or_none()
        if resume:
            await db.delete(resume)
            await db.commit()
            return True
        return False

    @staticmethod
    async def get_user_resumes(
        db: AsyncSession,
        user_id: int
    ) -> List[Resume]:
        result = await db.execute(
            select(Resume)
            .where(Resume.user_id == user_id)
            .order_by(Resume.created_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_resume_with_descriptions(
        db: AsyncSession,
        resume_id: int,
        user_id: int
    ) -> Optional[Resume]:
        try:
            # Используем selectinload вместо joinedload для более эффективной загрузки связанных данных
            # Добавляем кэширование запроса
            result = await db.execute(
                select(Resume)
                .options(
                    selectinload(Resume.job_descriptions),
                    selectinload(Resume.tuned_resumes)
                )
                .where(Resume.id == resume_id)
                .where(Resume.user_id == user_id)
                .execution_options(populate_existing=True)
            )
            
            # Добавляем unique() для предотвращения ошибки с коллекциями
            return result.unique().scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error in get_resume_with_descriptions for resume {resume_id}, user {user_id}: {str(e)}")
            return None

    @staticmethod
    async def add_job_description(
        db: AsyncSession,
        resume_id: int,
        description_text: str,
        title: Optional[str] = None
    ) -> JobDescription:
        # Если название не указано, генерируем его из первых 50 символов текста
        if not title:
            title = description_text[:50] + "..." if len(description_text) > 50 else description_text

        job_description = JobDescription(
            resume_id=resume_id,
            description_text=description_text,
            title=title
        )
        db.add(job_description)
        await db.commit()
        await db.refresh(job_description)
        return job_description

    @staticmethod
    async def start_tuning(
        db: AsyncSession,
        user_id: int,
        resume_id: int,
        job_description_id: int
    ) -> Optional[TunedResume]:
        try:
            # Проверяем баланс токенов
            if not await BillingService.spend_tokens(db, user_id, ResumeService.TOKENS_PER_TUNE):
                return None

            # Получаем резюме и описание вакансии из базы данных
            resume_result = await db.execute(
                select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id)
            )
            resume = resume_result.scalar_one_or_none()
            if not resume:
                raise Exception(f"Resume with ID {resume_id} not found")

            job_description_result = await db.execute(
                select(JobDescription).where(JobDescription.id == job_description_id)
            )
            job_description = job_description_result.scalar_one_or_none()
            if not job_description:
                raise Exception(f"Job description with ID {job_description_id} not found")

            # Создаем запись о тюнинге со статусом IN_PROGRESS
            tuned_resume = TunedResume(
                resume_id=resume_id,
                job_description_id=job_description_id,
                status=TuningStatus.IN_PROGRESS
            )
            db.add(tuned_resume)
            await db.commit()
            await db.refresh(tuned_resume)

            # Вызываем API resume-tuner через OpenAI сервис с использованием RabbitMQ
            try:
                result = await openai_service.optimize_resume_with_tuner(
                    resume.original_text,
                    job_description.description_text,
                    use_rabbitmq=True,  # Используем RabbitMQ для асинхронной обработки
                    tuned_resume_id=tuned_resume.id  # Передаем ID записи для обновления
                )
                
                # Не обновляем запись здесь, это будет сделано потребителем RabbitMQ
                # Просто возвращаем созданную запись
                
            except Exception as e:
                # Обрабатываем ошибку оптимизации
                logger.error(f"Error optimizing resume: {str(e)}")
                # Используем enum вместо строки
                tuned_resume.status = TuningStatus.FAILED
                tuned_resume.error_message = f"Не удалось оптимизировать резюме: {str(e)}"
                await db.commit()
                await db.refresh(tuned_resume)

            return tuned_resume
            
        except Exception as e:
            logger.error(f"Error in start_tuning: {str(e)}")
            await db.rollback()
            raise

    @staticmethod
    async def get_tuning_status(
        db: AsyncSession,
        tuned_resume_id: int
    ) -> Optional[TunedResume]:
        try:
            # Используем кэширование запроса
            result = await db.execute(
                select(TunedResume)
                .where(TunedResume.id == tuned_resume_id)
                .execution_options(populate_existing=True)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error in get_tuning_status for tuned_resume_id {tuned_resume_id}: {str(e)}")
            return None

    @staticmethod
    async def get_user_resumes_with_descriptions(
        db: AsyncSession,
        user_id: int
    ) -> List[Resume]:
        try:
            # Используем selectinload вместо joinedload для более эффективной загрузки связанных данных
            # selectinload выполняет отдельные запросы для связанных объектов, что эффективнее при большом количестве данных
            
            # Добавляем кэширование запроса с помощью опции execution_options
            result = await db.execute(
                select(Resume)
                .options(
                    selectinload(Resume.job_descriptions),
                    selectinload(Resume.tuned_resumes)
                )
                .where(Resume.user_id == user_id)
                .order_by(Resume.created_at.desc())
                .execution_options(populate_existing=True)
            )
            
            # Используем unique() для предотвращения дубликатов
            return result.unique().scalars().all()
        except Exception as e:
            logger.error(f"Error in get_user_resumes_with_descriptions for user {user_id}: {str(e)}")
            # Возвращаем пустой список вместо вызова исключения для обеспечения стабильности
            return []

    @staticmethod
    async def update_job_description(
        db: AsyncSession,
        job_description_id: int,
        resume_id: int,
        description_text: Optional[str] = None,
        title: Optional[str] = None
    ) -> Optional[JobDescription]:
        result = await db.execute(
            select(JobDescription)
            .where(
                JobDescription.id == job_description_id,
                JobDescription.resume_id == resume_id
            )
        )
        job_description = result.scalar_one_or_none()
        if job_description:
            if description_text is not None:
                job_description.description_text = description_text
            if title is not None:
                job_description.title = title
            await db.commit()
            await db.refresh(job_description)
        return job_description

    @staticmethod
    async def delete_job_description(
        db: AsyncSession,
        job_description_id: int,
        resume_id: int
    ) -> bool:
        result = await db.execute(
            select(JobDescription)
            .where(
                JobDescription.id == job_description_id,
                JobDescription.resume_id == resume_id
            )
        )
        job_description = result.scalar_one_or_none()
        if job_description:
            await db.delete(job_description)
            await db.commit()
            return True
        return False

    @staticmethod
    async def get_job_description_by_id(
        db: AsyncSession,
        job_description_id: int
    ) -> Optional[JobDescription]:
        """
        Получает описание вакансии по ID
        
        Args:
            db: Сессия базы данных
            job_description_id: ID описания вакансии
            
        Returns:
            Optional[JobDescription]: Описание вакансии или None
        """
        result = await db.execute(
            select(JobDescription)
            .where(JobDescription.id == job_description_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_tuned_resume(
        db: AsyncSession,
        resume_id: int,
        tuned_resume_data: TunedResumeCreate,
        tuned_text: str
    ) -> TunedResume:
        """
        Создает запись об оптимизированном резюме
        
        Args:
            db: Сессия базы данных
            resume_id: ID резюме
            tuned_resume_data: Данные для создания оптимизированного резюме
            tuned_text: Текст оптимизированного резюме
            
        Returns:
            TunedResume: Созданное оптимизированное резюме
        """
        # Если статус не указан, устанавливаем COMPLETED
        status = tuned_resume_data.status or TuningStatus.COMPLETED
        
        tuned_resume = TunedResume(
            resume_id=resume_id,
            job_description_id=tuned_resume_data.job_description_id,
            tuned_text=tuned_text,
            status=status
        )
        db.add(tuned_resume)
        await db.commit()
        await db.refresh(tuned_resume)
        
        return tuned_resume 