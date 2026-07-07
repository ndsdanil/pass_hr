"""replace metrics_data with gap_analysis_and_score and tokens_used

Revision ID: a1b2c3d4e5f6
Revises: 3886092ee488
Create Date: 2026-07-05 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '3886092ee488'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns
    op.add_column(
        'tuned_resumes',
        sa.Column('gap_analysis_and_score', sa.Text(), nullable=True)
    )
    op.add_column(
        'tuned_resumes',
        sa.Column('tokens_used', sa.Integer(), nullable=True)
    )
    # Drop the old JSONB metrics column
    op.drop_column('tuned_resumes', 'metrics_data')


def downgrade() -> None:
    op.add_column(
        'tuned_resumes',
        sa.Column('metrics_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    )
    op.drop_column('tuned_resumes', 'tokens_used')
    op.drop_column('tuned_resumes', 'gap_analysis_and_score')
