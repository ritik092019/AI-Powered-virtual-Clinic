# AI-Powered Rural Virtual Clinic - Database & Backend Layer

This directory contains the production-ready **PostgreSQL database schema**, **SQLAlchemy 2.0 ORM models**, **Alembic migration system**, **seed script**, and **verification tools** for the AI-Powered Rural Virtual Clinic.

---

## 🏛️ Database Architecture Overview

The database is built on **PostgreSQL 16** and comprises **exactly 6 core tables**:

1. **`users`**: Contains health workers, doctors, and administrators differentiated by the `role` enum.
2. **`patients`**: Stores patient demographics and medical history with unique patient codes (`PAT-000001`) and JSONB arrays.
3. **`consultations`**: Central entity linking patients, health workers, and optional assigned doctors. Uses JSONB for symptoms, vitals, document references, and image references.
4. **`ai_assessments`**: Stores AI triage suggestions, risk levels (`LOW`, `MODERATE`, `HIGH`, `IMMEDIATE`), observations, and missing info lists.
5. **`doctor_requests`**: Manages doctor escalation requests, priority levels, doctor notes, instructions, and structured referrals.
6. **`notifications`**: Tracks system and workflow alerts per user with unread indexing.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **PostgreSQL 16+** (or Docker Desktop)

### 2. Environment Setup

Create a `.env` file inside `backend/` (or copy from `.env.example`):

```bash
cp .env.example .env
```

Default configuration for local PostgreSQL:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=virtual_clinic
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/virtual_clinic
```

### 3. Install Python Dependencies

```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

---

## 🐳 Option A: Running PostgreSQL via Docker Compose

Spin up a PostgreSQL 16 container with automatic schema initialization:

```bash
docker-compose up -d
```

This starts PostgreSQL on port `5432` and automatically runs `scripts/init_db.sql`.

---

## 🛠️ Option B: Running Alembic Migrations

If running a local PostgreSQL instance (or after creating the database), execute Alembic migrations:

```bash
# Run all up migrations to current head
alembic upgrade head
```

To rollback:

```bash
alembic downgrade -1
```

---

## 🌱 Seeding Fictional Demo Data

Populate the database with realistic, non-real demo data (2 health workers, 2 doctors, 1 admin, 5 patients, consultations, AI assessments, doctor requests, notifications):

```bash
python scripts/seed.py
```

---

## 🧪 Running Automated Database Verification

Run the comprehensive test script to verify table creation, enum values, check constraints, JSONB queryability, and foreign key rules:

```bash
python scripts/verify_db.py
```

---

## 🔍 Inspecting Schema & Database via `psql`

Connect using PostgreSQL interactive terminal:

```bash
psql -h localhost -U postgres -d virtual_clinic
```

Useful `psql` commands:

```sql
-- List all 6 core tables
\dt

-- Inspect table details & indexes
\d consultations
\d users
\d patients

-- Query patients with Diabetes from JSONB
SELECT patient_code, name, medical_history 
FROM patients 
WHERE medical_history @> '["Diabetes"]'::jsonb;

-- Query doctor requests by priority and status
SELECT id, priority, reason, status 
FROM doctor_requests 
WHERE priority = 'HIGH' AND status = 'REQUESTED';
```

---

## 📊 Entity Relationship Summary

```
                    USERS (role: HEALTH_WORKER, DOCTOR, ADMIN)
                      │
             ┌────────┴────────┐
             │                 │
          PATIENTS          DOCTORS
             │                 │
             └───────┬─────────┘
                     │
                     ▼
               CONSULTATIONS (status: DRAFT -> PROCESSING -> AI_REVIEW_READY -> ...)
                     │
             ┌───────┴────────┐
             ▼                ▼
      AI_ASSESSMENTS    DOCTOR_REQUESTS
                              │
                              ▼
                         NOTIFICATIONS
```
