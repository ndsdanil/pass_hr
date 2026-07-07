from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
from app.models.base import get_db
from app.models.user import User
from app.models.resume import TuningStatus
from app.services.resume import ResumeService
from app.services.billing import BillingService
from app.services.openai_service import openai_service
from app.schemas.resume import (
    Resume,
    ResumeCreate,
    ResumeUpdate,
    JobDescription,
    JobDescriptionCreate,
    TunedResume,
    TunedResumeCreate,
    ResumeWithDescriptions,
    ResumeNormalizeRequest,
    ResumeNormalizeResponse,
    ResumeStats
)
from app.api.v1.auth import get_current_user
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
import logging
from app.core.exceptions import InsufficientTokensError, NotFoundError, ForbiddenError
from pydantic import BaseModel
import json

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/normalize", response_model=ResumeNormalizeResponse)
async def normalize_resume_text(
    request: ResumeNormalizeRequest
):
    """Нормализует форматирование текста резюме с помощью GPT-4."""
    try:
        normalized_text = await openai_service.normalize_resume_text(request.text)
        return ResumeNormalizeResponse(normalized_text=normalized_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при нормализации текста резюме: {str(e)}"
        )


@router.post("/", response_model=Resume)
async def create_resume(
    resume: ResumeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Загрузить новое резюме"""
    try:
        logger.info(f"Processing new resume upload for user {current_user.id}")
        
        # Определяем название резюме
        title = resume.title
        if not title:
            if resume.filename:
                # Если есть имя файла - используем его без расширения
                title = resume.filename.rsplit('.', 1)[0]
                logger.info(f"Using filename as title: {title}")
            else:
                # Если нет ни названия, ни имени файла - генерируем через ChatGPT
                logger.info("Generating title using OpenAI")
                title = await openai_service.generate_resume_title(resume.original_text)
                logger.info(f"Generated title: {title}")
        
        # Создаем резюме
        created_resume = await ResumeService.create_resume(
            db,
            current_user.id,
            resume.original_text,
            title
        )
        
        logger.info(f"Successfully created resume {created_resume.id} for user {current_user.id}")
        return created_resume
    
    except Exception as e:
        logger.error(f"Error creating resume for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create resume"
        )


@router.get("/", response_model=List[ResumeWithDescriptions])
async def get_user_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить список всех резюме пользователя"""
    return await ResumeService.get_user_resumes_with_descriptions(db, current_user.id)


@router.get("/stats", response_model=ResumeStats)
async def get_resume_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить статистику по резюме пользователя"""
    try:
        # Получаем ID пользователя
        user_id = current_user.id
        
        # Используем один запрос с агрегацией для получения всей статистики
        from app.models.resume import Resume, JobDescription, TunedResume
        from sqlalchemy import func, select
        
        # Создаем подзапрос для получения ID резюме пользователя
        resume_subquery = select(Resume.id).where(Resume.user_id == user_id).subquery()
        
        # Выполняем один запрос с агрегацией для получения всех счетчиков
        stats_query = select(
            func.count(func.distinct(Resume.id)).label("resumes_count"),
            func.count(func.distinct(JobDescription.id)).label("job_descriptions_count"),
            func.count(func.distinct(TunedResume.id)).label("tuned_resumes_count")
        ).select_from(
            Resume
            .outerjoin(JobDescription, JobDescription.resume_id == Resume.id)
            .outerjoin(TunedResume, TunedResume.resume_id == Resume.id)
        ).where(Resume.user_id == user_id)
        
        # Выполняем запрос
        result = await db.execute(stats_query)
        stats = result.fetchone()
        
        if stats:
            return ResumeStats(
                resumes_count=stats.resumes_count or 0,
                job_descriptions_count=stats.job_descriptions_count or 0,
                tuned_resumes_count=stats.tuned_resumes_count or 0
            )
        else:
            return ResumeStats(
                resumes_count=0,
                job_descriptions_count=0,
                tuned_resumes_count=0
            )
    except Exception as e:
        logger.error(f"Failed to get resume statistics: {str(e)}")
        # Возвращаем нулевую статистику вместо ошибки для обеспечения стабильности
        return ResumeStats(
            resumes_count=0,
            job_descriptions_count=0,
            tuned_resumes_count=0
        )


@router.get("/tuning/{tuned_resume_id}", response_model=TunedResume)
async def get_tuning_status(
    tuned_resume_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить статус и результат тюнинга резюме"""
    tuned_resume = await ResumeService.get_tuning_status(db, tuned_resume_id)
    if not tuned_resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tuned resume not found"
        )
    return tuned_resume


@router.get("/{resume_id}", response_model=ResumeWithDescriptions)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить резюме с описаниями вакансий и результатами тюнинга"""
    resume = await ResumeService.get_resume_with_descriptions(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    # Если у резюме нет описаний вакансий или результатов тюнинга, 
    # вернем пустые списки (они уже инициализированы в схеме)
    return resume


@router.post("/{resume_id}/job-descriptions", response_model=JobDescription)
async def add_job_description(
    resume_id: int,
    job_description: JobDescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Добавить описание вакансии к резюме"""
    # Проверяем, что резюме принадлежит пользователю
    resume = await ResumeService.get_resume_with_descriptions(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Используем resume_id из URL
    return await ResumeService.add_job_description(
        db,
        resume_id,
        job_description.description_text
    )


@router.post("/{resume_id}/tune", response_model=TunedResume)
async def start_tuning(
    resume_id: int,
    tuning_request: TunedResumeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Запустить процесс тюнинга резюме под конкретную вакансию"""
    # Проверяем, что резюме принадлежит пользователю
    resume = await ResumeService.get_resume_with_descriptions(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Проверяем наличие токенов и запускаем тюнинг
    tuned_resume = await ResumeService.start_tuning(
        db,
        current_user.id,
        resume_id,
        tuning_request.job_description_id
    )
    
    if not tuned_resume:
        raise InsufficientTokensError()
    
    return tuned_resume


@router.patch("/{resume_id}", response_model=Resume)
async def update_resume_title(
    resume_id: int,
    resume_update: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновить название резюме"""
    resume = await ResumeService.update_resume_title(
        db,
        resume_id,
        current_user.id,
        resume_update.title
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Резюме не найдено"
        )
    return resume


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить резюме"""
    deleted = await ResumeService.delete_resume(db, resume_id, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Резюме не найдено"
        )
    return None


@router.patch("/{resume_id}/job-descriptions/{job_description_id}", response_model=JobDescription)
async def update_job_description(
    resume_id: int,
    job_description_id: int,
    job_description: JobDescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновить описание вакансии"""
    # Проверяем, что резюме принадлежит пользователю
    resume = await ResumeService.get_resume_with_descriptions(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return await ResumeService.update_job_description(
        db,
        job_description_id,
        resume_id,
        job_description.description_text
    )


@router.delete("/{resume_id}/job-descriptions/{job_description_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_description(
    resume_id: int,
    job_description_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить описание вакансии"""
    # Проверяем, что резюме принадлежит пользователю
    resume = await ResumeService.get_resume_with_descriptions(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    deleted = await ResumeService.delete_job_description(db, job_description_id, resume_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found"
        )
    return None


class TuneResumeRequest(BaseModel):
    resume_id: int
    job_description_id: int
    use_rabbitmq: bool = True  # По умолчанию используем RabbitMQ

@router.post("/optimize-with-tuner", response_model=Dict[str, Any])
async def optimize_resume_with_tuner(
    request: TuneResumeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Оптимизирует резюме на основе описания вакансии с помощью resume-tuner API
    
    Args:
        request: Данные запроса с ID резюме и описания вакансии
        current_user: Текущий пользователь
        db: Сессия базы данных
        
    Returns:
        Dict[str, Any]: Результат оптимизации или статус отправки в очередь
    """
    try:
        # Получаем резюме по ID
        resume = await ResumeService.get_resume_by_id(db, request.resume_id, current_user.id)
        if not resume:
            raise NotFoundError("Резюме не найдено")
        
        # Получаем описание вакансии по ID
        job_description = await ResumeService.get_job_description_by_id(db, request.job_description_id)
        if not job_description:
            raise NotFoundError("Описание вакансии не найдено")
        
        # Проверяем, что описание вакансии принадлежит указанному резюме
        if job_description.resume_id != request.resume_id:
            raise ForbiddenError("Описание вакансии не принадлежит указанному резюме")
        
        # Если используется RabbitMQ, создаем запись с пустым оптимизированным текстом
        # и статусом "в обработке"
        if request.use_rabbitmq:
            # Создаем запись об оптимизированном резюме со статусом "в обработке"
            tuned_resume = TunedResumeCreate(
                job_description_id=request.job_description_id,
                status=TuningStatus.IN_PROGRESS  # Устанавливаем статус "в обработке"
            )
            
            # Сохраняем запись в базе данных с пустым текстом (будет заполнено позже)
            db_tuned_resume = await ResumeService.create_tuned_resume(
                db, 
                resume.id, 
                tuned_resume,
                ""  # Пустой текст, будет заполнен после обработки
            )
            
            # Оптимизируем резюме с помощью resume-tuner API, передавая ID созданной записи
            result = await openai_service.optimize_resume_with_tuner(
                resume.original_text,
                job_description.description_text,
                use_rabbitmq=request.use_rabbitmq,
                tuned_resume_id=db_tuned_resume.id
            )
            
            # Добавляем ID созданной записи в результат
            result["tuned_resume_id"] = db_tuned_resume.id
            
            return result
        else:
            # Если используется HTTP API
            # Оптимизируем резюме с помощью resume-tuner API
            result = await openai_service.optimize_resume_with_tuner(
                resume.original_text,
                job_description.description_text,
                use_rabbitmq=False
            )
            
            # Создаем запись об оптимизированном резюме
            tuned_resume = TunedResumeCreate(
                job_description_id=request.job_description_id
            )
            
            # Извлекаем метрики и другие данные из результата
            optimized_resume_text = result.get("optimized_resume", "")
            cover_letter = result.get("cover_letter")
            
            # Получаем residual_tokens для возврата пользователю
            residual_tokens = result.get("residual_tokens")
            
            # Сохраняем оптимизированное резюме в базе данных
            db_tuned_resume = await ResumeService.create_tuned_resume(
                db, 
                resume.id, 
                tuned_resume,
                optimized_resume_text
            )
            
            # Обновляем поле metrics_data в базе данных
            metrics = {
                'final_metrics': result.get('final_metrics', {}),
                'missing_keywords': result.get('missing_keywords', {}),
                'languages': result.get('languages', {})
            }
            
            if metrics:
                # Напрямую сохраняем словарь, т.к. поле JSONB принимает Python словарь
                db_tuned_resume.metrics_data = metrics
                db.add(db_tuned_resume)
                await db.commit()
                await db.refresh(db_tuned_resume)
                logging.info(f"Сохранены метрики для резюме с ID {db_tuned_resume.id}")
                
            # Если есть сопроводительное письмо, сохраняем его
            if cover_letter:
                db_tuned_resume.cover_letter = cover_letter
                db.add(db_tuned_resume)
                await db.commit()
                await db.refresh(db_tuned_resume)
                logging.info(f"Сохранено сопроводительное письмо для резюме с ID {db_tuned_resume.id}")
            
            # Возвращаем residual_tokens пользователю для HTTP API (use_rabbitmq=False)
            # Для RabbitMQ (use_rabbitmq=True) токены возвращаются в RabbitMQ Consumer
            if residual_tokens is not None and residual_tokens > 0:
                try:
                    from app.services.billing import BillingService
                    
                    success = await BillingService.add_residual_tokens(db, current_user.id, residual_tokens)
                    if success:
                        logging.info(f"Возвращено {residual_tokens} остаточных токенов пользователю {current_user.id} (HTTP API)")
                    else:
                        logging.error(f"Не удалось вернуть {residual_tokens} остаточных токенов пользователю {current_user.id}")
                        
                except Exception as token_error:
                    logging.error(f"Ошибка при возврате остаточных токенов пользователю {current_user.id}: {str(token_error)}")
                    # Не прерываем обработку, если не удалось вернуть токены
            
            # Возвращаем результаты оптимизации и ID созданной записи
            result["tuned_resume_id"] = db_tuned_resume.id
            
            return result
        
    except Exception as e:
        logging.error(f"Ошибка при оптимизации резюме: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/tuned/{tuned_resume_id}/metrics", response_model=Dict)
async def get_tuned_resume_metrics(
    tuned_resume_id: int,
    job_desc_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """Получение метрик для оптимизированного резюме"""
    # Загружаем информацию о скорректированном резюме
    tuned_resume = await db.get(TunedResume, tuned_resume_id)
    if not tuned_resume:
        raise HTTPException(status_code=404, detail="Tuned resume not found")

    # Получаем метрики из поля metrics_data, если они существуют
    metrics = {}
    if tuned_resume.metrics_data:
        # Значение metrics_data уже является словарём, не требуется json.loads
        metrics = tuned_resume.metrics_data
        logger.info(f"Получены метрики для tuned resume id {tuned_resume_id}")
    
    # Если указан ID описания вакансии, вычисляем процент соответствия для него
    if job_desc_id:
        # Загружаем описание вакансии
        job_desc = await db.get(JobDescription, job_desc_id)
        if not job_desc:
            raise HTTPException(status_code=404, detail="Job description not found")
            
        # Получаем ключевые слова из описания вакансии
        resume_service = ResumeService()
        job_desc_keywords = resume_service.extract_keywords(job_desc.text)
        
        # Вычисляем проценты сопоставления для указанного описания работы
        match_percentage = resume_service.calculate_match_percentage(
            resume_text=tuned_resume.tuned_text,
            job_desc_text=job_desc.text,
            job_desc_keywords=job_desc_keywords
        )
        
        # Добавляем результаты в метрики
        metrics['selected_job_desc_match'] = {
            'job_desc_id': job_desc_id,
            'match_percentage': match_percentage
        }
    
    return metrics 