from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.schemas.resume import (
    ResumeCreate, 
    ResumeResponse, 
    ResumeWithDescriptions, 
    ResumeNormalizeRequest, 
    ResumeNormalizeResponse,
    JobDescriptionCreate,
    TunedResumeCreate
)
from app.crud.resume import resume as resume_crud
from app.services.openai_service import openai_service
from app.services.resume_service import ResumeService
from app.models import User

router = APIRouter()

@router.post("/normalize", response_model=ResumeNormalizeResponse)
async def normalize_resume_text(
    request: ResumeNormalizeRequest,
) -> ResumeNormalizeResponse:
    """
    Нормализует форматирование текста резюме с помощью GPT-4.
    """
    try:
        normalized_text = await openai_service.normalize_resume_text(request.text)
        return ResumeNormalizeResponse(normalized_text=normalized_text)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при нормализации текста резюме: {str(e)}"
        )

@router.get("/", response_model=List[ResumeWithDescriptions])
def get_resumes(
    db: Session = Depends(deps.get_db),
    current_user_id: int = Depends(deps.get_current_user_id)
) -> List[ResumeWithDescriptions]:
    """
    Получить все резюме текущего пользователя.
    """
    return resume_crud.get_multi_by_user(db, user_id=current_user_id)

@router.get("/{resume_id}/tuned/{tuned_resume_id}", response_model=TunedResumeCreate)
async def get_tuned_resume(
    resume_id: int,
    tuned_resume_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Получает оптимизированное резюме по ID
    """
    # Проверяем, что резюме принадлежит пользователю
    resume = await ResumeService.get_resume_with_descriptions(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Проверяем, что оптимизированное резюме принадлежит указанному резюме
    tuned_resume = None
    for tr in resume.tuned_resumes:
        if tr.id == tuned_resume_id:
            tuned_resume = tr
            break
    
    if not tuned_resume:
        raise HTTPException(status_code=404, detail="Tuned resume not found")
    
    return tuned_resume

# ... остальные эндпоинты ... 