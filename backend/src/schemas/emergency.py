from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SOSCreate(BaseModel):
    action: str  # CALL_EMERGENCY, CALL_FAMILY, CALL_HEALTH_WORKER, CALL_DOCTOR
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_address: Optional[str] = None
    contact_number: Optional[str] = None
    notes: Optional[str] = None

class SOSResponse(BaseModel):
    sos_id: str
    patient_id: str
    action: str
    status: str = "TRIGGERED"
    location_shared: bool
    location_address: Optional[str] = None
    timestamp: datetime
    message: str

    model_config = ConfigDict(from_attributes=True)
