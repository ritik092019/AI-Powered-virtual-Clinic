import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.logger import logger
from app.core.redis import init_redis, close_redis
from app.common.exceptions import (
    AppException,
    app_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)

# Import domain routers
from app.core.health import router as health_router
from app.core.websocket import ws_router
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.patients.router import router as patients_router
from app.consultations.router import router as consultations_router, symptoms_router, vitals_router
from app.ai.router import router as ai_router
from app.triage.router import router as triage_router
from app.doctors.router import router as doctors_router
from app.doctors.websocket import doctor_ws_router
from app.notifications.router import router as notifications_router
from app.notifications.websocket import notif_ws_router
from app.speech.router import router as speech_router
from app.ocr.router import router as ocr_router
from app.documents.router import router as documents_router
from app.images.router import router as images_router
from app.risk.router import router as risk_router
from app.protocols.router import router as protocols_router
from app.admin.router import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Context Manager.
    Handles startup & shutdown initialization for Redis pools, Celery brokers, and DB engines.
    """
    logger.info("Initializing AI-Powered Rural Virtual Clinic Backend Application...")
    await init_redis()
    logger.info("Backend Application ready to accept requests.")
    yield
    logger.info("Shutting down Application services...")
    await close_redis()
    logger.info("Application shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Modular FastAPI + PostgreSQL + Redis + Celery + WebSocket Backend for Rural Healthcare Virtual Clinic",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan
)

# 1. Configure CORS Middleware
origins = settings.get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Register Global Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# 3. Logging & Execution Time Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    logger.debug(f"{request.method} {request.url.path} - Completed in {process_time:.2f}ms")
    return response

# 4. Mount Domain Routers under API_V1_PREFIX
api_v1_prefix = settings.API_V1_PREFIX

app.include_router(health_router, prefix=api_v1_prefix)
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(users_router, prefix=api_v1_prefix)
app.include_router(patients_router, prefix=api_v1_prefix)
app.include_router(consultations_router, prefix=api_v1_prefix)
app.include_router(symptoms_router, prefix=api_v1_prefix)
app.include_router(vitals_router, prefix=api_v1_prefix)
app.include_router(ai_router, prefix=api_v1_prefix)
app.include_router(triage_router, prefix=api_v1_prefix)
app.include_router(doctors_router, prefix=api_v1_prefix)
app.include_router(notifications_router, prefix=api_v1_prefix)
app.include_router(speech_router, prefix=api_v1_prefix)
app.include_router(ocr_router, prefix=api_v1_prefix)
app.include_router(documents_router, prefix=api_v1_prefix)
app.include_router(images_router, prefix=api_v1_prefix)
app.include_router(risk_router, prefix=api_v1_prefix)
app.include_router(protocols_router, prefix=api_v1_prefix)
app.include_router(admin_router, prefix=api_v1_prefix)
app.include_router(ws_router, prefix=api_v1_prefix)
app.include_router(doctor_ws_router, prefix=api_v1_prefix)
app.include_router(notif_ws_router, prefix=api_v1_prefix)

@app.get("/", tags=["Root"])
def read_root():
    return {
        "title": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "documentation": f"{settings.API_V1_PREFIX}/docs",
        "health_check": f"{settings.API_V1_PREFIX}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
