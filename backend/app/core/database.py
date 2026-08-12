import logging
from sqlalchemy import create_engine, JSON
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB
from app.core.config import settings

logger = logging.getLogger("virtual_clinic.database")

@compiles(JSONB, 'sqlite')
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy declarative models."""
    pass

try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=False
    )
    # Test connection
    with engine.connect() as conn:
        pass
    logger.info("Successfully connected to primary PostgreSQL database.")
except Exception as e:
    logger.warning(f"Primary PostgreSQL database connection failed ({e}). Falling back to local SQLite database.")
    engine = create_engine(
        "sqlite:///./virtual_clinic.db",
        connect_args={"check_same_thread": False},
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Ensure all database models and tables are created and seeded."""
    import app.users.models  # noqa
    import app.patients.models  # noqa
    import app.consultations.models  # noqa
    import app.doctors.models  # noqa
    import app.triage.models  # noqa
    import app.notifications.models  # noqa
    Base.metadata.create_all(bind=engine)

    try:
        from app.core.seed import seed_initial_database
        seed_initial_database()
    except Exception as e:
        logger.warning(f"Database seed skipped or error: {e}")

# init_db()  # Run setup_db.py or explicit seeding instead of auto-running on import

def get_db():
    """Dependency for obtaining a database session in API routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

