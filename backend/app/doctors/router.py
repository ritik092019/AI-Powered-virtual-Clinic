from fastapi import APIRouter
from app.doctors.routers.doctor_requests_router import router as doctor_requests_router
from app.doctors.routers.doctor_consultations_router import router as doctor_consultations_router

router = APIRouter()
router.include_router(doctor_requests_router)
router.include_router(doctor_consultations_router)

__all__ = ["router", "doctor_requests_router", "doctor_consultations_router"]
