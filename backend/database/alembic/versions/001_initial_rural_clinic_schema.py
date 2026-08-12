"""Initial Rural Clinic Schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-12 16:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Enums
user_role_enum = postgresql.ENUM('HEALTH_WORKER', 'DOCTOR', 'ADMIN', name='user_role')
consultation_status_enum = postgresql.ENUM(
    'DRAFT', 'PROCESSING', 'AI_REVIEW_READY', 
    'AWAITING_DOCTOR', 'DOCTOR_ACCEPTED', 
    'IN_CONSULTATION', 'REFERRED', 'COMPLETED', 
    name='consultation_status'
)
risk_level_enum = postgresql.ENUM('LOW', 'MODERATE', 'HIGH', 'IMMEDIATE', name='risk_level')
ai_assessment_status_enum = postgresql.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', name='ai_assessment_status')
doctor_request_status_enum = postgresql.ENUM('REQUESTED', 'ACCEPTED', 'IN_CONSULTATION', 'COMPLETED', 'REFERRED', name='doctor_request_status')
notification_type_enum = postgresql.ENUM('DOCTOR_REQUEST', 'CONSULTATION_UPDATE', 'DOCUMENT_PROCESSING', 'AI_ANALYSIS', 'WARNING', 'SYSTEM', name='notification_type')

def upgrade() -> None:
    # Enable Extensions
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')

    # Create ENUMs
    user_role_enum.create(op.get_bind(), checkfirst=True)
    consultation_status_enum.create(op.get_bind(), checkfirst=True)
    risk_level_enum.create(op.get_bind(), checkfirst=True)
    ai_assessment_status_enum.create(op.get_bind(), checkfirst=True)
    doctor_request_status_enum.create(op.get_bind(), checkfirst=True)
    notification_type_enum.create(op.get_bind(), checkfirst=True)

    # 1. USERS
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('role', user_role_enum, nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False)
    )
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_role', 'users', ['role'])

    # 2. PATIENTS
    op.create_table(
        'patients',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('patient_code', sa.String(length=50), nullable=False, unique=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('gender', sa.String(length=50), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('preferred_language', sa.String(length=10), nullable=True),
        sa.Column('medical_history', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('allergies', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('medications', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('age IS NULL OR (age >= 0 AND age <= 150)', name='check_patient_age_valid')
    )
    op.create_index('idx_patients_patient_code', 'patients', ['patient_code'])
    op.create_index('idx_patients_name', 'patients', ['name'])

    # 3. CONSULTATIONS
    op.create_table(
        'consultations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patients.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('health_worker_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('doctor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('status', consultation_status_enum, server_default='DRAFT', nullable=False),
        sa.Column('chief_complaint', sa.Text(), nullable=True),
        sa.Column('symptoms', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('vitals', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('voice_transcript', sa.Text(), nullable=True),
        sa.Column('medical_notes', sa.Text(), nullable=True),
        sa.Column('documents', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('images', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False)
    )
    op.create_index('idx_consultations_patient_id', 'consultations', ['patient_id'])
    op.create_index('idx_consultations_health_worker_id', 'consultations', ['health_worker_id'])
    op.create_index('idx_consultations_doctor_id', 'consultations', ['doctor_id'])
    op.create_index('idx_consultations_status', 'consultations', ['status'])
    op.create_index('idx_consultations_created_at', 'consultations', ['created_at'])
    op.create_index('idx_consultations_hw_status', 'consultations', ['health_worker_id', 'status'])

    # 4. AI_ASSESSMENTS
    op.create_table(
        'ai_assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('consultation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('consultations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('observations', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('missing_information', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('risk_level', risk_level_enum, nullable=False),
        sa.Column('risk_reason', sa.Text(), nullable=True),
        sa.Column('recommendation', sa.Text(), nullable=True),
        sa.Column('confidence', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('model_name', sa.String(length=100), nullable=True),
        sa.Column('status', ai_assessment_status_enum, server_default='PENDING', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False)
    )
    op.create_index('idx_ai_assessments_consultation_id', 'ai_assessments', ['consultation_id'])
    op.create_index('idx_ai_assessments_status', 'ai_assessments', ['status'])
    op.create_index('idx_ai_assessments_risk_level', 'ai_assessments', ['risk_level'])

    # 5. DOCTOR_REQUESTS
    op.create_table(
        'doctor_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('consultation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('consultations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patients.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('doctor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('requested_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('priority', risk_level_enum, nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('status', doctor_request_status_enum, server_default='REQUESTED', nullable=False),
        sa.Column('doctor_notes', sa.Text(), nullable=True),
        sa.Column('instructions', sa.Text(), nullable=True),
        sa.Column('referral', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default=None),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False)
    )
    op.create_index('idx_doctor_requests_consultation_id', 'doctor_requests', ['consultation_id'])
    op.create_index('idx_doctor_requests_patient_id', 'doctor_requests', ['patient_id'])
    op.create_index('idx_doctor_requests_doctor_id', 'doctor_requests', ['doctor_id'])
    op.create_index('idx_doctor_requests_requested_by', 'doctor_requests', ['requested_by'])
    op.create_index('idx_doctor_requests_status', 'doctor_requests', ['status'])
    op.create_index('idx_doctor_requests_priority', 'doctor_requests', ['priority'])
    op.create_index('idx_doctor_requests_doctor_status', 'doctor_requests', ['doctor_id', 'status'])
    op.create_index('idx_doctor_requests_priority_status', 'doctor_requests', ['priority', 'status'])

    # 6. NOTIFICATIONS
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('type', notification_type_enum, nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('related_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False)
    )
    op.create_index('idx_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('idx_notifications_is_read', 'notifications', ['is_read'])
    op.create_index('idx_notifications_created_at', 'notifications', ['created_at'])
    op.create_index('idx_notifications_user_unread', 'notifications', ['user_id', 'is_read', sa.text('created_at DESC')])

def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('doctor_requests')
    op.drop_table('ai_assessments')
    op.drop_table('consultations')
    op.drop_table('patients')
    op.drop_table('users')

    notification_type_enum.drop(op.get_bind(), checkfirst=True)
    doctor_request_status_enum.drop(op.get_bind(), checkfirst=True)
    ai_assessment_status_enum.drop(op.get_bind(), checkfirst=True)
    risk_level_enum.drop(op.get_bind(), checkfirst=True)
    consultation_status_enum.drop(op.get_bind(), checkfirst=True)
    user_role_enum.drop(op.get_bind(), checkfirst=True)
