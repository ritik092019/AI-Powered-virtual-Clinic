import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.base import Base

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from src.core.config import settings

try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=False
    )
    with engine.connect() as conn:
        pass
except Exception:
    engine = create_engine(
        "sqlite:///./virtual_clinic.db",
        connect_args={"check_same_thread": False},
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency for obtaining a database session in API routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
