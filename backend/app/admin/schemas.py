from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.common.enums import UserRole, RiskLevel

class AdminUserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., description="User email address")
    role: UserRole
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    is_active: bool = True

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class AdminUserStatusUpdate(BaseModel):
    is_active: bool

class AdminUserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PlatformStatsResponse(BaseModel):
    total_patients: int
    total_consultations: int
    pending_doctor_requests: int
    completed_consultations: int
    active_doctors: int
    total_users_by_role: Dict[str, int]
    system_health: str = "HEALTHY"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ServiceComponentStatus(BaseModel):
    name: str
    status: str # ONLINE, DEGRADED, OFFLINE
    response_time_ms: float
    details: Optional[str] = None

class SystemStatusResponse(BaseModel):
    overall_status: str # ONLINE, DEGRADED, OFFLINE
    environment: str
    version: str = "1.0.0"
    components: List[ServiceComponentStatus]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ClinicalProtocolCreate(BaseModel):
    title: str = Field(..., description="Protocol name e.g. Rural Fever & Hypoxia Protocol")
    version: str = Field(..., description="Semantic version e.g. v1.2")
    category: str = Field("TRIAGE", description="TRIAGE, RISK, CLINICAL_ESC")
    threshold_rules: Dict[str, Any] = Field(default_factory=dict)
    guidelines_summary: str = Field(..., description="Actionable clinical guidelines text")
    is_active: bool = True

class ClinicalProtocolResponse(ClinicalProtocolCreate):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AuditLogQueryFilter(BaseModel):
    action: Optional[str] = None
    performed_by: Optional[UUID] = None
    target_resource: Optional[str] = None
    limit: int = Field(50, ge=1, le=200)
    offset: int = Field(0, ge=0)

class AuditLogItem(BaseModel):
    timestamp: str
    action: str
    performed_by: str
    target_resource: Optional[str] = None
    resource_id: Optional[str] = None
    details: Optional[Any] = None

class AuditLogListResponse(BaseModel):
    logs: List[AuditLogItem]
    total: int


# ===========================================================================
# Doctor Specialist Management Schemas
# ===========================================================================

from app.common.enums import DoctorAvailabilityStatus

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

