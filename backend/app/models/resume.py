from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum


class TuningStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String(255), nullable=True)
    original_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Определяем отношения
    job_descriptions = relationship("JobDescription", back_populates="resume", cascade="all, delete-orphan")
    tuned_resumes = relationship("TunedResume", back_populates="resume", cascade="all, delete-orphan")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    description_text = Column(Text, nullable=False)
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Определяем отношение к Resume
    resume = relationship("Resume", back_populates="job_descriptions")
    # Определяем отношение к TunedResume
    tuned_resumes = relationship("TunedResume", back_populates="job_description", cascade="all, delete-orphan")


class TunedResume(Base):
    __tablename__ = "tuned_resumes"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), index=True)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), index=True)
    tuned_text = Column(Text)
    cover_letter = Column(Text, nullable=True)
    gap_analysis_and_score = Column(Text, nullable=True)
    tokens_used = Column(Integer, nullable=True)
    status = Column(Enum(TuningStatus), default=TuningStatus.PENDING, index=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Определяем отношения
    resume = relationship("Resume", back_populates="tuned_resumes")
    job_description = relationship("JobDescription", back_populates="tuned_resumes")
    
    # Добавляем составной индекс для часто используемых запросов
    __table_args__ = (
        # Индекс для поиска оптимизированных резюме по resume_id и job_description_id
        # Это ускорит запрос getTunedResumeForJobDesc
        Index('ix_tuned_resumes_resume_job_desc', 'resume_id', 'job_description_id'),
    ) 