"""Add indexes for performance optimization

Revision ID: add_indexes_for_performance
Revises: fix_created_at_default
Create Date: 2023-06-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_indexes_for_performance'
down_revision: Union[str, None] = 'fix_created_at_default'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add indexes for performance optimization with high load."""
    # Индекс для user_id в таблице resumes
    op.create_index(op.f('ix_resumes_user_id'), 'resumes', ['user_id'], unique=False)
    
    # Индекс для created_at в таблице resumes (для сортировки)
    op.create_index(op.f('ix_resumes_created_at'), 'resumes', ['created_at'], unique=False)
    
    # Индекс для resume_id в таблице job_descriptions
    op.create_index(op.f('ix_job_descriptions_resume_id'), 'job_descriptions', ['resume_id'], unique=False)
    
    # Индексы для resume_id и job_description_id в таблице tuned_resumes
    op.create_index(op.f('ix_tuned_resumes_resume_id'), 'tuned_resumes', ['resume_id'], unique=False)
    op.create_index(op.f('ix_tuned_resumes_job_description_id'), 'tuned_resumes', ['job_description_id'], unique=False)
    
    # Индекс для status в таблице tuned_resumes
    op.create_index(op.f('ix_tuned_resumes_status'), 'tuned_resumes', ['status'], unique=False)
    
    # Составной индекс для resume_id и job_description_id в таблице tuned_resumes
    op.create_index('ix_tuned_resumes_resume_job_desc', 'tuned_resumes', ['resume_id', 'job_description_id'], unique=False)


def downgrade() -> None:
    """Remove indexes added for performance optimization."""
    # Удаляем составной индекс
    op.drop_index('ix_tuned_resumes_resume_job_desc', table_name='tuned_resumes')
    
    # Удаляем индекс для status
    op.drop_index(op.f('ix_tuned_resumes_status'), table_name='tuned_resumes')
    
    # Удаляем индексы для resume_id и job_description_id
    op.drop_index(op.f('ix_tuned_resumes_job_description_id'), table_name='tuned_resumes')
    op.drop_index(op.f('ix_tuned_resumes_resume_id'), table_name='tuned_resumes')
    
    # Удаляем индекс для resume_id в job_descriptions
    op.drop_index(op.f('ix_job_descriptions_resume_id'), table_name='job_descriptions')
    
    # Удаляем индексы в таблице resumes
    op.drop_index(op.f('ix_resumes_created_at'), table_name='resumes')
    op.drop_index(op.f('ix_resumes_user_id'), table_name='resumes') 