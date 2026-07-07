"""update tuningstatus enum

Revision ID: 3886092ee488
Revises: 76d245e2676e
Create Date: 2025-05-24 21:25:37.604722

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3886092ee488'
down_revision: Union[str, None] = '76d245e2676e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
