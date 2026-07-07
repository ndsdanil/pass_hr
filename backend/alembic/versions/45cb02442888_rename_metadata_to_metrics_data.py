"""rename_metadata_to_metrics_data

Revision ID: 45cb02442888
Revises: 4bf84d66ba14
Create Date: 2025-03-17 23:11:10.843747

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '45cb02442888'
down_revision: Union[str, None] = '4bf84d66ba14'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add metrics_data column to tuned_resumes table
    op.add_column('tuned_resumes', sa.Column('metrics_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Drop metrics_data column from tuned_resumes table
    op.drop_column('tuned_resumes', 'metrics_data')
