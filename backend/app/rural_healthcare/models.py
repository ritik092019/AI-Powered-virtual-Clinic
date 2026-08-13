import uuid
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base

class RuralHospital(Base):
    __tablename__ = "rural_hospitals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(100), nullable=False, unique=True, index=True)
    village_area = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, default="Surguja")
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    contact_number = Column(String(50), nullable=False)
    
    total_beds = Column(Integer, nullable=False, default=50)
    occupied_beds = Column(Integer, nullable=False, default=30)
    available_beds = Column(Integer, nullable=False, default=20)
    availability_status = Column(String(50), nullable=False, default="Beds Available")
    
    doctors_available_count = Column(Integer, nullable=False, default=5)
    doctor_specialties = Column(JSONB, server_default='[]', nullable=False)
    
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index('idx_rural_hospitals_village', 'village_area'),
        Index('idx_rural_hospitals_status', 'availability_status'),
    )

    def __repr__(self):
        return f"<RuralHospital(name='{self.name}', village='{self.village_area}', status='{self.availability_status}')>"


class RuralMedicineAvailability(Base):
    __tablename__ = "rural_medicine_availability"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medicine_name = Column(String(255), nullable=False, index=True)
    purpose = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False, default=100)
    availability_status = Column(String(50), nullable=False, default="In Stock")
    
    supplier_name = Column(String(255), nullable=False)
    supplier_address = Column(Text, nullable=False)
    contact_number = Column(String(50), nullable=False)
    village_area = Column(String(100), nullable=False, index=True)
    
    order_status = Column(String(100), nullable=False, default="In Stock & Available")
    expected_delivery = Column(String(100), nullable=True)
    
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index('idx_rural_meds_village', 'village_area'),
        Index('idx_rural_meds_status', 'availability_status'),
    )

    def __repr__(self):
        return f"<RuralMedicineAvailability(medicine='{self.medicine_name}', quantity={self.quantity}, status='{self.availability_status}')>"
