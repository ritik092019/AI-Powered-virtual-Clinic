# 🗄️ Database Package - AI-Powered Rural Virtual Clinic

All PostgreSQL database models, migration scripts, DDL initializers, seeders, and verification tools are centralized in this dedicated `database/` directory.

---

## 📂 Folder Structure

```
backend/database/
├── alembic/              # Alembic migration environment & versions
│   ├── env.py
│   └── versions/
│       └── 001_initial_rural_clinic_schema.py
├── models/               # SQLAlchemy 2.0 Models & PostgreSQL Enums
│   ├── __init__.py
│   ├── ai_assessment.py
│   ├── consultation.py
│   ├── doctor_request.py
│   ├── enums.py
│   ├── notification.py
│   ├── patient.py
│   └── user.py
├── alembic.ini           # Migration configuration
├── base.py               # DeclarativeBase foundation
├── docker-compose.yml    # PostgreSQL 16 container service
├── init_db.sql           # Raw PostgreSQL DDL with triggers & indexes
├── seed.py               # Fictional demo data populator
├── session.py            # Database engine & SessionLocal factory
├── setup_db.py           # 1-step automated DB setup runner
└── verify_db.py          # Schema & constraint automated test runner
```

---

## 🚀 Usage Commands

From the `backend/` directory:

```bash
# 1. Automated 1-step setup (creates DB, tables, seeds data, verifies):
python database/setup_db.py

# 2. Run Alembic migrations:
alembic -c database/alembic.ini upgrade head

# 3. Seed demo data:
python database/seed.py

# 4. Run verification test suite:
python database/verify_db.py

# 5. Execute init_db.sql in psql:
psql -h localhost -U postgres -d virtual_clinic -f database/init_db.sql
```
