from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.resume import TuningStatus

RESUME_MAX_CHARS = 25_000
JOB_DESC_MAX_CHARS = 17_000


class ResumeBase(BaseModel):
    original_text: str = Field(max_length=RESUME_MAX_CHARS)
    title: Optional[str] = None
    filename: Optional[str] = None


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(BaseModel):
    title: str


class Resume(ResumeBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JobDescriptionBase(BaseModel):
    description_text: str = Field(max_length=JOB_DESC_MAX_CHARS)
    title: Optional[str] = None


class JobDescriptionCreate(JobDescriptionBase):
    pass


class JobDescription(JobDescriptionBase):
    id: int
    resume_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TunedResumeBase(BaseModel):
    job_description_id: int


class TunedResumeCreate(TunedResumeBase):
    status: Optional[TuningStatus] = None


class TunedResume(TunedResumeBase):
    id: int
    resume_id: int
    tuned_text: Optional[str] = None
    cover_letter: Optional[str] = None
    gap_analysis_and_score: Optional[str] = None
    tokens_used: Optional[int] = None
    status: TuningStatus
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResumeWithDescriptions(Resume):
    job_descriptions: List[JobDescription] = []
    tuned_resumes: List[TunedResume] = []


class ResumeResponse(BaseModel):
    id: int
    original_text: str


class ResumeNormalizeRequest(BaseModel):
    text: str = Field(max_length=RESUME_MAX_CHARS)


class ResumeNormalizeResponse(BaseModel):
    normalized_text: str


class ResumeStats(BaseModel):
    resumes_count: int
    job_descriptions_count: int
    tuned_resumes_count: int

    class Config:
        from_attributes = True 