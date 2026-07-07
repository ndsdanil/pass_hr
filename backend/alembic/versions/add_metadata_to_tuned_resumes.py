"""add metadata column to tuned_resumes

Revision ID: 0b7289f2cb12
Revises: 3eab35aca07b
Create Date: 2023-06-17 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0b7289f2cb12'
down_revision = '3eab35aca07b'
branch_labels = None
depends_on = None


def upgrade():
    # Добавляем столбец metadata в таблицу tuned_resumes
    op.add_column('tuned_resumes', sa.Column('metadata', sa.Text(), nullable=True))


def downgrade():
    # Удаляем столбец metadata из таблицы tuned_resumes
    op.drop_column('tuned_resumes', 'metadata') 