from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.redis import check_redis_health
from app.core.celery import celery_app
from app.core.config import settings
from app.common.responses import APIResponse

router = APIRouter(prefix="/health", tags=["Health & Monitoring"])

@router.get("")
async def deep_health_check(db: Session = Depends(get_db)):
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {e}"

    redis_res = await check_redis_health()

    celery_status = "healthy"
    try:
        broker_url = settings.CELERY_BROKER_URL
        celery_status = f"healthy (broker: {broker_url.split('@')[-1]})"
    except Exception as e:
        celery_status = f"unhealthy: {e}"

    is_overall_healthy = (db_status == "healthy") and (redis_res.get("status") == "healthy")

    health_data = {
        "status": "healthy" if is_overall_healthy else "degraded",
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "redis": redis_res.get("status"),
        "celery": celery_status,
        "details": {
            "project_name": settings.PROJECT_NAME,
            "version": "1.0.0",
            "redis_details": redis_res
        }
    }
    return APIResponse.success(data=health_data, message="Health check performed")
