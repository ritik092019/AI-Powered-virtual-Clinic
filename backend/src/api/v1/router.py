from fastapi import APIRouter
from src.api.v1.endpoints import (
    auth,
    users,
    patients,
    consultations,
    symptoms,
    vitals,
    ai,
    doctor_requests,
    notifications,
    emergency,
    patient_summary,
    health,
    websocket,
)

api_v1_router = APIRouter()

api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router)
api_v1_router.include_router(users.router)
api_v1_router.include_router(patients.router)
api_v1_router.include_router(consultations.router)
api_v1_router.include_router(symptoms.router)
api_v1_router.include_router(vitals.router)
api_v1_router.include_router(ai.router)
api_v1_router.include_router(doctor_requests.router)
api_v1_router.include_router(notifications.router)
api_v1_router.include_router(emergency.router)
api_v1_router.include_router(patient_summary.router)
api_v1_router.include_router(websocket.router)
