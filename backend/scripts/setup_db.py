import sys
import os
from sqlalchemy import create_engine, text

# Ensure src is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.config import settings
from src.db.base import Base
import src.models
from scripts.seed import seed_database
from scripts.verify_db import run_verification_tests

def setup_database():
    print("=====================================================")
    print("AI-Powered Rural Virtual Clinic Database Setup")
    print("=====================================================")

    # 1. Connect to default 'postgres' database to check/create 'virtual_clinic' DB
    postgres_default_url = (
        f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}"
        f"@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/postgres"
    )
    
    print(f"\n1. Connecting to PostgreSQL server at {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}...")
    try:
        engine_default = create_engine(postgres_default_url, isolation_level="AUTOCOMMIT")
        with engine_default.connect() as conn:
            # Check if virtual_clinic DB exists
            result = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :dbname"),
                {"dbname": settings.POSTGRES_DB}
            )
            exists = result.scalar() is not None
            
            if not exists:
                print(f"Creating database '{settings.POSTGRES_DB}'...")
                conn.execute(text(f'CREATE DATABASE "{settings.POSTGRES_DB}"'))
                print(f"[SUCCESS] Database '{settings.POSTGRES_DB}' created successfully!")
            else:
                print(f"[INFO] Database '{settings.POSTGRES_DB}' already exists.")
        engine_default.dispose()
    except Exception as e:
        print(f"[ERROR] Error connecting to PostgreSQL: {e}")
        print("\nPlease ensure your PostgreSQL service is running and credentials in .env are correct.")
        print(f"Current settings: Host={settings.POSTGRES_HOST}, User={settings.POSTGRES_USER}, DB={settings.POSTGRES_DB}")
        sys.exit(1)

    # 2. Connect to 'virtual_clinic' database and create core tables & extensions
    print(f"\n2. Initializing 6 Core Tables & Extensions in '{settings.POSTGRES_DB}'...")
    target_engine = create_engine(settings.DATABASE_URL)
    try:
        with target_engine.connect() as conn:
            conn.execution_options(isolation_level="AUTOCOMMIT")
            conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
            conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto";'))
        
        # Create all tables defined in SQLAlchemy models
        Base.metadata.create_all(bind=target_engine)
        print("[SUCCESS] All 6 tables created successfully!")
    except Exception as e:
        print(f"[ERROR] Table creation failed: {e}")
        sys.exit(1)

    # 3. Seed Demo Data
    print("\n3. Seeding Demo Data...")
    try:
        seed_database()
    except Exception as e:
        print(f"[ERROR] Seeding failed: {e}")
        sys.exit(1)

    # 4. Run Automated Verification Tests
    print("\n4. Running Automated Verification...")
    try:
        run_verification_tests()
    except Exception as e:
        print(f"[ERROR] Verification failed: {e}")
        sys.exit(1)

    print("\n=====================================================")
    print("[SUCCESS] ALL SET UP! DATABASE IS READY FOR USE")
    print("=====================================================")

if __name__ == "__main__":
    setup_database()
