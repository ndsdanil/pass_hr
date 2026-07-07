"""Add account_type field to users table

Revision ID: add_account_type
Revises: 80c1a370a17f
Create Date: 2024-03-21 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_account_type'
down_revision: Union[str, None] = '80c1a370a17f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Добавляем колонку account_type
    op.add_column('users', sa.Column('account_type', sa.String(), nullable=True, server_default='applicant'))
    # Обновляем существующие записи
    op.execute("UPDATE users SET account_type = 'applicant' WHERE account_type IS NULL")


def downgrade() -> None:
    # Удаляем колонку account_type
    op.drop_column('users', 'account_type') 