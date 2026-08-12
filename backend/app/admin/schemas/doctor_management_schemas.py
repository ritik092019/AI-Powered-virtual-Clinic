from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from app.common.enums import UserRole, DoctorAvailabilityStatus

def ensure_dr_prefix(v: Optional[str]) -> Optional[str]:
    if not v:
        return v
    v_clean = v.strip()
    if not (v_clean.lower().startswith("dr.") or v_clean.lower().startswith("dr ")):
        return f"Dr. {v_clean}"
    return v_clean

class DoctorSpecialistCreate(BaseModel):
    name: str = Field(..., description="Doctor full name with title e.g. Dr. Rajesh Verma")
    email: str = Field(..., description="Doctor official login email")
    password: str = Field(..., min_length=6, description="Account password")
    phone: Optional[str] = Field(None, description="Contact phone number")
    specialization: str = Field(..., description="Primary medical specialty e.g. Cardiology")
    qualifications: str = Field(..., description="Degrees & qualifications e.g. MBBS, MD (Cardiology)")
    experience_years: int = Field(..., ge=0, description="Years of clinical experience")
    license_number: str = Field(..., description="Medical Council registration / license number")
    address: Optional[str] = Field(None, description="Clinic / Hospital practice address")
    city_state: Optional[str] = Field(None, description="City and State")
    languages: List[str] = Field(default_factory=lambda: ["English", "Hindi"], description="Languages spoken")
    availability_status: DoctorAvailabilityStatus = Field(default=DoctorAvailabilityStatus.AVAILABLE)
    is_active: bool = Field(default=True, description="Account active status")

    @field_validator("name", mode="before")
    @classmethod
    def validate_doctor_name(cls, v: str) -> str:
        return ensure_dr_prefix(v) or v

class DoctorSpecialistUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = Field(None, ge=0)
    license_number: Optional[str] = None
    address: Optional[str] = None
    city_state: Optional[str] = None
    languages: Optional[List[str]] = None
    availability_status: Optional[DoctorAvailabilityStatus] = None
    is_active: Optional[bool] = None

    @field_validator("name", mode="before")
    @classmethod
    def validate_doctor_name(cls, v: Optional[str]) -> Optional[str]:
        return ensure_dr_prefix(v)

class DoctorStatusUpdate(BaseModel):
    is_active: bool = Field(..., description="Active status toggle")

class DoctorSpecialistResponse(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str] = None
    role: UserRole = UserRole.DOCTOR
    is_active: bool
    specialization: str
    qualifications: str
    experience_years: int
    license_number: str
    address: Optional[str] = None
    city_state: Optional[str] = None
    languages: List[str]
    availability_status: DoctorAvailabilityStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DoctorSpecialistListResponse(BaseModel):
    doctors: List[DoctorSpecialistResponse]
    total: int
    page: int
    limit: int
