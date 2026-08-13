from uuid import UUID
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field

class DoctorInHospital(BaseModel):
    name: str
    specialty: str
    qualifications: Optional[str] = "MBBS, MD"
    availability_status: Optional[str] = "Available"

class HospitalResponse(BaseModel):
    id: UUID
    name: str
    code: str
    village_area: str
    district: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_number: str
    total_beds: int
    occupied_beds: int
    available_beds: int
    availability_status: str
    doctors_available_count: int
    doctor_specialties: List[DoctorInHospital] = Field(default_factory=list)
    distance_km: Optional[float] = 3.5
    last_updated_at: datetime

    class Config:
        from_attributes = True

class MedicineResponse(BaseModel):
    id: UUID
    medicine_name: str
    purpose: str
    quantity: int
    availability_status: str
    supplier_name: str
    supplier_address: str
    contact_number: str
    village_area: str
    order_status: str
    expected_delivery: Optional[str] = None
    last_updated_at: datetime

    class Config:
        from_attributes = True

class MedicineCreateUpdate(BaseModel):
    medicine_name: str = Field(..., min_length=2)
    purpose: str = Field(..., min_length=2)
    quantity: int = Field(..., ge=0)
    availability_status: str = Field("In Stock", description="'In Stock', 'Limited Stock', 'Out of Stock', 'In Transit'")
    supplier_name: str = Field(..., min_length=2)
    supplier_address: str = Field(..., min_length=3)
    contact_number: str = Field(..., min_length=5)
    village_area: str = Field("Ambikapur", min_length=2)
    order_status: str = Field("In Stock & Available")
    expected_delivery: Optional[str] = Field("In Stock")

class HospitalBedUpdate(BaseModel):
    total_beds: int = Field(..., ge=1)
    occupied_beds: int = Field(..., ge=0)
    doctors_available_count: Optional[int] = Field(None, ge=0)
