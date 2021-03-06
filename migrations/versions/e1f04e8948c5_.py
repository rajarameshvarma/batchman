"""empty message

Revision ID: e1f04e8948c5
Revises: 126f0c58bf81
Create Date: 2019-11-16 22:23:50.237007

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e1f04e8948c5'
down_revision = '126f0c58bf81'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('task_execution', sa.Column('taskExitCode', sa.String(), nullable=True))
    op.add_column('task_execution', sa.Column('taskExitReason', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('task_execution', 'taskExitReason')
    op.drop_column('task_execution', 'taskExitCode')
    # ### end Alembic commands ###
