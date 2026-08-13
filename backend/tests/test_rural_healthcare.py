import pytest
import uuid
from app.core.database import SessionLocal, Base, engine
from app.common.enums import UserRole
from app.users.models import User
from app.rural_healthcare.models import RuralHospital, RuralMedicineAvailability
from app.rural_healthcare.schemas import MedicineCreateUpdate, HospitalBedUpdate

def test_rural_healthcare_models_and_queries():
    import app.users.models
    import app.rural_healthcare.models
    Base.metadata.create_all(bind=engine)

    db_session = SessionLocal()
    try:
        # Create hospital
        h_id = uuid.uuid4()
        hospital = RuralHospital(
            id=h_id,
            name="District Civil Hospital Ambikapur Test",
            code=f"HOSP-TEST-{h_id.hex[:4]}",
            village_area="Ambikapur",
            district="Surguja",
            address="Hospital Road, Ambikapur",
            latitude=23.1205,
            longitude=83.1970,
            contact_number="+91 7774 223401",
            total_beds=100,
            occupied_beds=70,
            available_beds=30,
            availability_status="Beds Available",
            doctors_available_count=8,
            doctor_specialties=[{"name": "Dr. Test Doctor", "specialty": "Cardiology", "qualifications": "MBBS, MD"}]
        )
        db_session.add(hospital)

        # Create medicine stock
        m_id = uuid.uuid4()
        med = RuralMedicineAvailability(
            id=m_id,
            medicine_name="Anti-Snake Venom (ASV) Test",
            purpose="Emergency Snakebite Neutralization",
            quantity=25,
            availability_status="In Stock",
            supplier_name="District Pharmacy Depot",
            supplier_address="Ambikapur Main Market",
            contact_number="+91 98271 00000",
            village_area="Ambikapur",
            order_status="Delivered & Stocked",
            expected_delivery="In Stock Now"
        )
        db_session.add(med)
        db_session.commit()

        # Query hospital and medicine
        fetched_h = db_session.query(RuralHospital).filter(RuralHospital.id == h_id).first()
        assert fetched_h is not None
        assert fetched_h.available_beds == 30
        assert fetched_h.availability_status == "Beds Available"

        fetched_m = db_session.query(RuralMedicineAvailability).filter(RuralMedicineAvailability.id == m_id).first()
        assert fetched_m is not None
        assert fetched_m.quantity == 25
        assert fetched_m.availability_status == "In Stock"

    finally:
        db_session.close()
