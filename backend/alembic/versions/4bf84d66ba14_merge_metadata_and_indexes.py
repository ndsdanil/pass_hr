"""merge_metadata_and_indexes

Revision ID: 4bf84d66ba14
Revises: add_indexes_for_performance, 0b7289f2cb12
Create Date: 2025-03-17 23:10:47.674487

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4bf84d66ba14'
down_revision: Union[str, None] = ('add_indexes_for_performance', '0b7289f2cb12')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
