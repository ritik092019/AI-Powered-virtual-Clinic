import uuid
import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.admin.repositories.doctor_management_repository import DoctorManagementRepository
from app.admin.schemas import (
    DoctorSpecialistCreate,
    DoctorSpecialistUpdate,
    DoctorSpecialistResponse,
    DoctorSpecialistListResponse,
    DoctorStatusUpdate
)
from app.core.security import get_password_hash
from app.common.enums import DoctorAvailabilityStatus
from app.common.exceptions import NotFoundException, BadRequestException
from app.audit.service import log_audit_event

logger = logging.getLogger("virtual_clinic.doctor_management_service")

class DoctorManagementService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = DoctorManagementRepository(db)

    def list_doctors(
        self,
        page: int = 1,
        limit: int = 50,
        search: Optional[str] = None,
        specialization: Optional[str] = None,
        availability: Optional[DoctorAvailabilityStatus] = None,
        is_active: Optional[bool] = None
    ) -> DoctorSpecialistListResponse:
        skip = (page - 1) * limit
        doctors_data, total = self.repo.list_doctors(
            skip=skip,
            limit=limit,
            search=search,
            specialization=specialization,
            availability=availability,
            is_active=is_active
        )
        res_items = [DoctorSpecialistResponse.model_validate(d) for d in doctors_data]
        return DoctorSpecialistListResponse(
            doctors=res_items,
            total=total,
            page=page,
            limit=limit
        )

    def get_doctor(self, doctor_id: uuid.UUID) -> DoctorSpecialistResponse:
        doctor_user = self.repo.get_by_id(doctor_id)
        if not doctor_user:
            raise NotFoundException(f"Doctor with ID '{doctor_id}' not found.")

        meta = doctor_user.profile_metadata or {}
        doc_dict = {
            "id": doctor_user.id,
            "name": doctor_user.name,
            "email": doctor_user.email,
            "phone": doctor_user.phone,
            "role": doctor_user.role,
            "is_active": doctor_user.is_active,
            "specialization": meta.get("specialization", "General Medicine"),
            "qualifications": meta.get("qualifications", "MBBS"),
            "experience_years": meta.get("experience_years", 5),
            "license_number": meta.get("license_number", "MCI-00000"),
            "address": meta.get("address", ""),
            "city_state": meta.get("city_state", ""),
            "languages": meta.get("languages", ["English", "Hindi"]),
            "availability_status": meta.get("availability_status", DoctorAvailabilityStatus.AVAILABLE),
            "created_at": doctor_user.created_at,
            "updated_at": doctor_user.updated_at
        }
        return DoctorSpecialistResponse.model_validate(doc_dict)

    def create_doctor(self, doc_in: DoctorSpecialistCreate, admin_id: uuid.UUID) -> DoctorSpecialistResponse:
        existing = self.repo.get_by_email(doc_in.email)
        if existing:
            raise BadRequestException(f"User with email '{doc_in.email}' already exists.")

        hashed_password = get_password_hash(doc_in.password)
        created_dict = self.repo.create_doctor(
            name=doc_in.name,
            email=doc_in.email,
            hashed_password=hashed_password,
            phone=doc_in.phone,
            specialization=doc_in.specialization,
            qualifications=doc_in.qualifications,
            experience_years=doc_in.experience_years,
            license_number=doc_in.license_number,
            address=doc_in.address,
            city_state=doc_in.city_state,
            languages=doc_in.languages,
            availability_status=doc_in.availability_status,
            is_active=doc_in.is_active
        )

        log_audit_event(
            action="ADMIN_DOCTOR_CREATED",
            performed_by=admin_id,
            target_resource="USER_DOCTOR",
            resource_id=created_dict["id"],
            details={"email": doc_in.email, "specialization": doc_in.specialization}
        )
        logger.info(f"Admin '{admin_id}' registered new doctor specialist '{doc_in.name}' ({doc_in.email}).")
        return DoctorSpecialistResponse.model_validate(created_dict)

    def update_doctor(
        self,
        doctor_id: uuid.UUID,
        update_in: DoctorSpecialistUpdate,
        admin_id: uuid.UUID
    ) -> DoctorSpecialistResponse:
        existing = self.repo.get_by_id(doctor_id)
        if not existing:
            raise NotFoundException(f"Doctor with ID '{doctor_id}' not found.")

        update_fields = update_in.model_dump(exclude_unset=True)
        updated_dict = self.repo.update_doctor(doctor_id, update_fields)
        if not updated_dict:
            raise NotFoundException(f"Doctor with ID '{doctor_id}' not found.")

        log_audit_event(
            action="ADMIN_DOCTOR_UPDATED",
            performed_by=admin_id,
            target_resource="USER_DOCTOR",
            resource_id=doctor_id,
            details=update_fields
        )
        logger.info(f"Admin '{admin_id}' updated doctor specialist '{doctor_id}'.")
        return DoctorSpecialistResponse.model_validate(updated_dict)

    def toggle_doctor_status(
        self,
        doctor_id: uuid.UUID,
        status_in: DoctorStatusUpdate,
        admin_id: uuid.UUID
    ) -> DoctorSpecialistResponse:
        existing = self.repo.get_by_id(doctor_id)
        if not existing:
            raise NotFoundException(f"Doctor with ID '{doctor_id}' not found.")

        updated_dict = self.repo.update_doctor(doctor_id, {"is_active": status_in.is_active})
        if not updated_dict:
            raise NotFoundException(f"Doctor with ID '{doctor_id}' not found.")

        log_audit_event(
            action="ADMIN_DOCTOR_STATUS_TOGGLED",
            performed_by=admin_id,
            target_resource="USER_DOCTOR",
            resource_id=doctor_id,
            details={"is_active": status_in.is_active}
        )
        logger.info(f"Admin '{admin_id}' set doctor '{doctor_id}' is_active={status_in.is_active}.")
        return DoctorSpecialistResponse.model_validate(updated_dict)
