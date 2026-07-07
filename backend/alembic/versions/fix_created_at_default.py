"""Fix created_at default value

Revision ID: fix_created_at_default
Revises: eb9002c751c0
Create Date: 2025-03-16 01:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func


# revision identifiers, used by Alembic.
revision = 'fix_created_at_default'
down_revision = 'eb9002c751c0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add default value for created_at columns."""
    # Добавляем значение по умолчанию для created_at в таблице resumes
    op.alter_column('resumes', 'created_at',
                    server_default=sa.text('CURRENT_TIMESTAMP'),
                    existing_type=sa.DateTime(timezone=True),
                    nullable=True)
    
    # Добавляем значение по умолчанию для created_at в таблице job_descriptions
    op.alter_column('job_descriptions', 'created_at',
                    server_default=sa.text('CURRENT_TIMESTAMP'),
                    existing_type=sa.DateTime(timezone=True),
                    nullable=True)
    
    # Добавляем значение по умолчанию для created_at в таблице tuned_resumes
    op.alter_column('tuned_resumes', 'created_at',
                    server_default=sa.text('CURRENT_TIMESTAMP'),
                    existing_type=sa.DateTime(timezone=True),
                    nullable=True)
    
    # Добавляем значение по умолчанию для created_at в таблице users
    op.alter_column('users', 'created_at',
                    server_default=sa.text('CURRENT_TIMESTAMP'),
                    existing_type=sa.DateTime(timezone=True),
                    nullable=True)
    
    # Добавляем значение по умолчанию для created_at в таблице user_tokens
    op.alter_column('user_tokens', 'created_at',
                    server_default=sa.text('CURRENT_TIMESTAMP'),
                    existing_type=sa.DateTime(timezone=True),
                    nullable=True)


def downgrade() -> None:
    """Remove default value for created_at columns."""
    # Удаляем значение по умолчанию для created_at в таблице resumes
    op.alter_column('resumes', 'created_at',
                    server_default=None,
                    existing_type=sa.DateTime(timezone=True),
                    nullable=True)
    
    # Удаляем значение по умолчанию для created_at в таблице job_descriptions
    op.alter_column('job_descriptions', 'created_at',
                    server_default=None,
                    existing_type=sa.DateTime(timezone=True),
                    nullable=True)
    
    # Удаляем значение по умолчанию для created_at в таблице tuned_resumes
    op.alter_column('tuned_resumes', 'created_at',
                    server_default=None,
                    existing_type=sa.DateTime(timezone=True),
                    nullable=True)
    
    # Удаляем значение по умолчанию для created_at в таблице users
    op.alter_column('users', 'created_at',
                    server_default=None,
                    existing_type=sa.DateTime(timezone=True),
                    nullable=True)
    
    # Удаляем значение по умолчанию для created_at в таблице user_tokens
    op.alter_column('user_tokens', 'created_at',
                    server_default=None,
                    existing_type=sa.DateTime(timezone=True),
                    nullable=True) 