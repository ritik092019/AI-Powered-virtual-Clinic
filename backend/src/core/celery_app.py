import os
from src.core.config import settings

try:
    from celery import Celery
    celery_app = Celery(
        "virtual_clinic_celery",
        broker=settings.CELERY_BROKER_URL,
        backend=settings.CELERY_RESULT_BACKEND
    )
    celery_app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        task_track_started=True,
        task_time_limit=300,
    )
except ImportError:
    class MockCelery:
        broker_url = settings.CELERY_BROKER_URL
        backend_url = settings.CELERY_RESULT_BACKEND
        def task(self, *args, **kwargs):
            def decorator(f):
                return f
            return decorator
    celery_app = MockCelery()

@celery_app.task(name="tasks.ping")
def ping_celery_task():
    """Health check ping task for Celery."""
    return {"status": "pong", "message": "Celery worker is operational"}
