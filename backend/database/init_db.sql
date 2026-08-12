-- =====================================================================
-- AI-Powered Rural Virtual Clinic - Production PostgreSQL Schema DDL
-- =====================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Automatic Updated At Timestamp Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Create Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('HEALTH_WORKER', 'DOCTOR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE consultation_status AS ENUM (
        'DRAFT', 'PROCESSING', 'AI_REVIEW_READY', 
        'AWAITING_DOCTOR', 'DOCTOR_ACCEPTED', 
        'IN_CONSULTATION', 'REFERRED', 'COMPLETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('LOW', 'MODERATE', 'HIGH', 'IMMEDIATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ai_assessment_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE doctor_request_status AS ENUM ('REQUESTED', 'ACCEPTED', 'IN_CONSULTATION', 'COMPLETED', 'REFERRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'DOCTOR_REQUEST', 'CONSULTATION_UPDATE', 
        'DOCUMENT_PROCESSING', 'AI_ANALYSIS', 'WARNING', 'SYSTEM'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Create Tables

-- 4.1 USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(50),
    language VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.2 PATIENTS
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    age INT CONSTRAINT check_patient_age_valid CHECK (age IS NULL OR (age >= 0 AND age <= 150)),
    gender VARCHAR(50),
    phone VARCHAR(50),
    address TEXT,
    preferred_language VARCHAR(10),
    medical_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    allergies JSONB NOT NULL DEFAULT '[]'::jsonb,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.3 CONSULTATIONS
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    health_worker_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status consultation_status NOT NULL DEFAULT 'DRAFT',
    chief_complaint TEXT,
    symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    vitals JSONB NOT NULL DEFAULT '{}'::jsonb,
    voice_transcript TEXT,
    medical_notes TEXT,
    documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.4 AI_ASSESSMENTS
CREATE TABLE IF NOT EXISTS ai_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    summary TEXT,
    observations JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_information JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_level risk_level NOT NULL,
    risk_reason TEXT,
    recommendation TEXT,
    confidence NUMERIC(5, 2),
    model_name VARCHAR(100),
    status ai_assessment_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.5 DOCTOR_REQUESTS
CREATE TABLE IF NOT EXISTS doctor_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    priority risk_level NOT NULL,
    reason TEXT NOT NULL,
    status doctor_request_status NOT NULL DEFAULT 'REQUESTED',
    doctor_notes TEXT,
    instructions TEXT,
    referral JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4.6 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Triggers for Automatic updated_at
DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_patients_updated_at ON patients;
CREATE TRIGGER set_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_consultations_updated_at ON consultations;
CREATE TRIGGER set_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_ai_assessments_updated_at ON ai_assessments;
CREATE TRIGGER set_ai_assessments_updated_at BEFORE UPDATE ON ai_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_doctor_requests_updated_at ON doctor_requests;
CREATE TRIGGER set_doctor_requests_updated_at BEFORE UPDATE ON doctor_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Create Performance Indexes

-- users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_patient_code ON patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);

-- consultations indexes
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_health_worker_id ON consultations(health_worker_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at);
CREATE INDEX IF NOT EXISTS idx_consultations_hw_status ON consultations(health_worker_id, status);

-- ai_assessments indexes
CREATE INDEX IF NOT EXISTS idx_ai_assessments_consultation_id ON ai_assessments(consultation_id);
CREATE INDEX IF NOT EXISTS idx_ai_assessments_status ON ai_assessments(status);
CREATE INDEX IF NOT EXISTS idx_ai_assessments_risk_level ON ai_assessments(risk_level);

-- doctor_requests indexes
CREATE INDEX IF NOT EXISTS idx_doctor_requests_consultation_id ON doctor_requests(consultation_id);
CREATE INDEX IF NOT EXISTS idx_doctor_requests_patient_id ON doctor_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_requests_doctor_id ON doctor_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_requests_requested_by ON doctor_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_doctor_requests_status ON doctor_requests(status);
CREATE INDEX IF NOT EXISTS idx_doctor_requests_priority ON doctor_requests(priority);
CREATE INDEX IF NOT EXISTS idx_doctor_requests_doctor_status ON doctor_requests(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_doctor_requests_priority_status ON doctor_requests(priority, status);

-- notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
