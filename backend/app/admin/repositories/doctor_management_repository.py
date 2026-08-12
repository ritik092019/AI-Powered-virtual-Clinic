from typing import Optional, List, Tuple, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.users.models import User
from app.doctors.models import DoctorAvailability
from app.common.enums import UserRole, DoctorAvailabilityStatus

class DoctorManagementRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, doctor_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(
            User.id == doctor_id, 
            User.role == UserRole.DOCTOR
        ).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def list_doctors(
        self,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        specialization: Optional[str] = None,
        availability: Optional[DoctorAvailabilityStatus] = None,
        is_active: Optional[bool] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        query = self.db.query(User).filter(User.role == UserRole.DOCTOR)

        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        doctors_raw = query.order_by(User.created_at.desc()).all()
        formatted_list: List[Dict[str, Any]] = []

        for user in doctors_raw:
            meta = user.profile_metadata or {}
            
            # Check availability status from DoctorAvailability table or profile_metadata
            avail_row = self.db.query(DoctorAvailability).filter(DoctorAvailability.user_id == user.id).first()
            current_avail = avail_row.status if avail_row else meta.get("availability_status", DoctorAvailabilityStatus.AVAILABLE)

            doc_dict = {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "is_active": user.is_active,
                "specialization": meta.get("specialization", "General Medicine"),
                "qualifications": meta.get("qualifications", "MBBS"),
                "experience_years": meta.get("experience_years", 5),
                "license_number": meta.get("license_number", "MCI-00000"),
                "address": meta.get("address", ""),
                "city_state": meta.get("city_state", ""),
                "languages": meta.get("languages", ["English", "Hindi"]),
                "availability_status": current_avail,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }

            # Filter by search string if provided
            if search:
                s_lower = search.lower()
                matches_search = (
                    s_lower in user.name.lower() or
                    s_lower in user.email.lower() or
                    s_lower in (user.phone or "").lower() or
                    s_lower in doc_dict["specialization"].lower() or
                    s_lower in doc_dict["license_number"].lower() or
                    s_lower in doc_dict["qualifications"].lower()
                )
                if not matches_search:
                    continue

            # Filter by specialization if provided
            if specialization and specialization.lower() != "all":
                if specialization.lower() not in doc_dict["specialization"].lower():
                    continue

            # Filter by availability status if provided
            if availability:
                if doc_dict["availability_status"] != availability:
                    continue

            formatted_list.append(doc_dict)

        total = len(formatted_list)
        paginated = formatted_list[skip:skip + limit]
        return paginated, total

    def create_doctor(
        self,
        name: str,
        email: str,
        hashed_password: str,
        phone: Optional[str],
        specialization: str,
        qualifications: str,
        experience_years: int,
        license_number: str,
        address: Optional[str],
        city_state: Optional[str],
        languages: List[str],
        availability_status: DoctorAvailabilityStatus,
        is_active: bool
    ) -> Dict[str, Any]:
        meta = {
            "specialization": specialization,
            "qualifications": qualifications,
            "experience_years": experience_years,
            "license_number": license_number,
            "address": address or "",
            "city_state": city_state or "",
            "languages": languages,
            "availability_status": availability_status
        }

        user = User(
            name=name,
            email=email,
            password=hashed_password,
            role=UserRole.DOCTOR,
            phone=phone,
            is_active=is_active,
            profile_metadata=meta
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # Upsert DoctorAvailability table entry
        avail = self.db.query(DoctorAvailability).filter(DoctorAvailability.user_id == user.id).first()
        if not avail:
            avail = DoctorAvailability(
                user_id=user.id,
                status=availability_status,
                specialty=specialization
            )
            self.db.add(avail)
        else:
            avail.status = availability_status
            avail.specialty = specialization
        self.db.commit()

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "is_active": user.is_active,
            "specialization": specialization,
            "qualifications": qualifications,
            "experience_years": experience_years,
            "license_number": license_number,
            "address": address or "",
            "city_state": city_state or "",
            "languages": languages,
            "availability_status": availability_status,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }

    def update_doctor(
        self,
        doctor_id: UUID,
        update_fields: dict
    ) -> Optional[Dict[str, Any]]:
        user = self.get_by_id(doctor_id)
        if not user:
            return None

        meta = dict(user.profile_metadata or {})

        # Top-level user column updates
        if "name" in update_fields and update_fields["name"] is not None:
            user.name = update_fields["name"]
        if "phone" in update_fields and update_fields["phone"] is not None:
            user.phone = update_fields["phone"]
        if "is_active" in update_fields and update_fields["is_active"] is not None:
            user.is_active = update_fields["is_active"]

        # Profile metadata updates
        metadata_keys = [
            "specialization", "qualifications", "experience_years",
            "license_number", "address", "city_state", "languages", "availability_status"
        ]
        for key in metadata_keys:
            if key in update_fields and update_fields[key] is not None:
                meta[key] = update_fields[key]

        user.profile_metadata = meta
        self.db.commit()
        self.db.refresh(user)

        # Update DoctorAvailability if status or specialty changed
        if "availability_status" in update_fields or "specialization" in update_fields:
            avail = self.db.query(DoctorAvailability).filter(DoctorAvailability.user_id == user.id).first()
            if not avail:
                avail = DoctorAvailability(
                    user_id=user.id,
                    status=meta.get("availability_status", DoctorAvailabilityStatus.AVAILABLE),
                    specialty=meta.get("specialization", "General Medicine")
                )
                self.db.add(avail)
            else:
                if "availability_status" in update_fields and update_fields["availability_status"] is not None:
                    avail.status = update_fields["availability_status"]
                if "specialization" in update_fields and update_fields["specialization"] is not None:
                    avail.specialty = update_fields["specialization"]
            self.db.commit()

        avail_row = self.db.query(DoctorAvailability).filter(DoctorAvailability.user_id == user.id).first()
        current_avail = avail_row.status if avail_row else meta.get("availability_status", DoctorAvailabilityStatus.AVAILABLE)

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "is_active": user.is_active,
            "specialization": meta.get("specialization", "General Medicine"),
            "qualifications": meta.get("qualifications", "MBBS"),
            "experience_years": meta.get("experience_years", 5),
            "license_number": meta.get("license_number", "MCI-00000"),
            "address": meta.get("address", ""),
            "city_state": meta.get("city_state", ""),
            "languages": meta.get("languages", ["English", "Hindi"]),
            "availability_status": current_avail,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
