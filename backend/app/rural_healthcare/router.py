import uuid
import math
import logging
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.common.responses import APIResponse
from app.common.exceptions import BadRequestException, NotFoundException
from app.common.enums import UserRole
from app.users.models import User
from app.rural_healthcare.models import RuralHospital, RuralMedicineAvailability
from app.rural_healthcare.schemas import (
    HospitalResponse,
    MedicineResponse,
    MedicineCreateUpdate,
    HospitalBedUpdate,
    DoctorInHospital
)
from app.audit.service import log_audit_event

logger = logging.getLogger("virtual_clinic.rural_healthcare")

router = APIRouter(prefix="/rural-healthcare", tags=["Rural Healthcare Infrastructure"])

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km between two geographical coordinates."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def ensure_initial_seed_data(db: Session):
    """Seed initial hospitals and medicine inventory if table is empty."""
    if db.query(RuralHospital).count() == 0:
        hospitals = [
            RuralHospital(
                id=uuid.uuid4(),
                name="District Civil Hospital Ambikapur",
                code="HOSP-SURGUJA-01",
                village_area="Ambikapur",
                district="Surguja",
                address="Hospital Road, Near Clock Tower, Ambikapur, Chhattisgarh 497001",
                latitude=23.1205,
                longitude=83.1970,
                contact_number="+91 7774 223401",
                total_beds=120,
                occupied_beds=84,
                available_beds=36,
                availability_status="Beds Available",
                doctors_available_count=12,
                doctor_specialties=[
                    {"name": "Dr. Rajesh Verma", "specialty": "Cardiologist (Heart Specialist)", "qualifications": "MBBS, MD", "availability_status": "Available"},
                    {"name": "Dr. Sunita Rao", "specialty": "Pulmonologist (Chest & Respiratory)", "qualifications": "MBBS, DNB", "availability_status": "Available"},
                    {"name": "Dr. Ananya Sharma", "specialty": "General Physician / Family Doctor", "qualifications": "MBBS, MD", "availability_status": "Available"},
                    {"name": "Dr. Priya Patel", "specialty": "Pediatrician (Child Specialist)", "qualifications": "MBBS, DCH", "availability_status": "Available"},
                    {"name": "Dr. Alok Gupta", "specialty": "Orthopedic (Bone & Joint)", "qualifications": "MBBS, MS", "availability_status": "Available"}
                ]
            ),
            RuralHospital(
                id=uuid.uuid4(),
                name="Surguja Sub-Divisional Health Centre",
                code="HOSP-LAKHANPUR-02",
                village_area="Lakhanpur",
                district="Surguja",
                address="Main Highway Block 4, Lakhanpur, Surguja, Chhattisgarh 497116",
                latitude=23.0102,
                longitude=83.0805,
                contact_number="+91 7774 288102",
                total_beds=40,
                occupied_beds=35,
                available_beds=5,
                availability_status="Limited",
                doctors_available_count=4,
                doctor_specialties=[
                    {"name": "Dr. Manoj Kumar", "specialty": "General Physician / Family Doctor", "qualifications": "MBBS", "availability_status": "Available"},
                    {"name": "Dr. Ritu Singh", "specialty": "Gynecologist / Maternal Specialist", "qualifications": "MBBS, DGO", "availability_status": "Available"}
                ]
            ),
            RuralHospital(
                id=uuid.uuid4(),
                name="Udaipur Rural Community Hospital",
                code="HOSP-UDAIPUR-03",
                village_area="Udaipur",
                district="Surguja",
                address="Sub-Center Road, Udaipur, Surguja, Chhattisgarh 497116",
                latitude=22.9510,
                longitude=83.1200,
                contact_number="+91 7774 290111",
                total_beds=30,
                occupied_beds=30,
                available_beds=0,
                availability_status="Full",
                doctors_available_count=2,
                doctor_specialties=[
                    {"name": "Dr. S. K. Biswas", "specialty": "General Physician / Family Doctor", "qualifications": "MBBS", "availability_status": "Available"}
                ]
            ),
            RuralHospital(
                id=uuid.uuid4(),
                name="Surajpur Referral Health Complex",
                code="HOSP-SURAJPUR-04",
                village_area="Surajpur",
                district="Surajpur",
                address="Station Road, Surajpur, Chhattisgarh 497229",
                latitude=23.2190,
                longitude=82.8650,
                contact_number="+91 7775 220090",
                total_beds=80,
                occupied_beds=45,
                available_beds=35,
                availability_status="Beds Available",
                doctors_available_count=8,
                doctor_specialties=[
                    {"name": "Dr. Vikram Sharma", "specialty": "Neurologist (Brain & Nerve)", "qualifications": "MBBS, DM", "availability_status": "Available"},
                    {"name": "Dr. Smita Das", "specialty": "Dermatologist (Skin Specialist)", "qualifications": "MBBS, MD", "availability_status": "Available"}
                ]
            )
        ]
        db.add_all(hospitals)
        db.commit()

    if db.query(RuralMedicineAvailability).count() == 0:
        medicines = [
            RuralMedicineAvailability(
                id=uuid.uuid4(),
                medicine_name="Amoxicillin 500mg Capsules",
                purpose="Bacterial Respiratory & Throat Infections",
                quantity=450,
                availability_status="In Stock",
                supplier_name="Jan Aushadhi Kendra Ambikapur Main Market",
                supplier_address="Clock Tower Market, Ambikapur",
                contact_number="+91 98271 44012",
                village_area="Ambikapur",
                order_status="Delivered & Stocked",
                expected_delivery="In Stock Now"
            ),
            RuralMedicineAvailability(
                id=uuid.uuid4(),
                medicine_name="Anti-Snake Venom (ASV) Injectable Vials",
                purpose="Emergency Snakebite Neutralization",
                quantity=15,
                availability_status="Limited Stock",
                supplier_name="District Hospital Emergency Pharmacy",
                supplier_address="Emergency Ward, District Hospital Ambikapur",
                contact_number="+91 7774 223405",
                village_area="Ambikapur",
                order_status="Dispatched - In Transit",
                expected_delivery="Today, 6:00 PM"
            ),
            RuralMedicineAvailability(
                id=uuid.uuid4(),
                medicine_name="Metformin 500mg Tablets",
                purpose="Type-2 Diabetes Glycemic Control",
                quantity=800,
                availability_status="In Stock",
                supplier_name="Jan Aushadhi Kendra Lakhanpur",
                supplier_address="Block Hospital Complex, Lakhanpur",
                contact_number="+91 94252 88910",
                village_area="Lakhanpur",
                order_status="Delivered & Stocked",
                expected_delivery="In Stock Now"
            ),
            RuralMedicineAvailability(
                id=uuid.uuid4(),
                medicine_name="Paracetamol 650mg Tablets",
                purpose="High Fever & Acute Body Pain Relief",
                quantity=1200,
                availability_status="In Stock",
                supplier_name="Sub-Health Centre Pharmacy Hub",
                supplier_address="Main Road, Udaipur",
                contact_number="+91 91110 33455",
                village_area="Udaipur",
                order_status="Delivered & Stocked",
                expected_delivery="In Stock Now"
            ),
            RuralMedicineAvailability(
                id=uuid.uuid4(),
                medicine_name="Insulin Isophane 100IU/ml Vial",
                purpose="Insulin-Dependent Diabetes Management",
                quantity=0,
                availability_status="Out of Stock",
                supplier_name="Surajpur Central Medical Depot",
                supplier_address="Depot Chowk, Surajpur",
                contact_number="+91 7775 221004",
                village_area="Surajpur",
                order_status="Order Placed - In Transit",
                expected_delivery="15 Aug 2026, 11:00 AM"
            )
        ]
        db.add_all(medicines)
        db.commit()


@router.get("/hospitals", status_code=status.HTTP_200_OK)
def list_rural_hospitals(
    village_area: Optional[str] = Query(None, description="Filter by village/sub-center area e.g. Ambikapur"),
    specialty: Optional[str] = Query(None, description="Filter by available doctor specialty"),
    bed_status: Optional[str] = Query(None, description="'Beds Available', 'Limited', 'Full'"),
    search: Optional[str] = Query(None, description="Search by hospital name or address"),
    user_lat: Optional[float] = Query(23.1205, description="Patient/Worker latitude for distance calculation"),
    user_lng: Optional[float] = Query(83.1970, description="Patient/Worker longitude for distance calculation"),
    db: Session = Depends(get_db)
):
    """Retrieve location-based rural hospitals with bed availability, doctor specialties, and calculated distance."""
    ensure_initial_seed_data(db)

    query = db.query(RuralHospital)

    if village_area and village_area.lower() != "all":
        query = query.filter(RuralHospital.village_area.ilike(f"%{village_area}%"))

    if bed_status and bed_status.lower() != "all":
        query = query.filter(RuralHospital.availability_status.ilike(f"%{bed_status}%"))

    if search:
        query = query.filter(
            (RuralHospital.name.ilike(f"%{search}%")) |
            (RuralHospital.address.ilike(f"%{search}%"))
        )

    hospitals = query.all()

    results = []
    for h in hospitals:
        # Calculate distance
        dist = 3.5
        if h.latitude and h.longitude and user_lat and user_lng:
            dist = calculate_haversine_distance(user_lat, user_lng, h.latitude, h.longitude)

        # Filter by specialty if requested
        specs = h.doctor_specialties or []
        if specialty and specialty.lower() != "all":
            matching = [s for s in specs if specialty.lower() in s.get("specialty", "").lower()]
            if not matching:
                continue

        doc_objs = [
            DoctorInHospital(
                name=d.get("name", "Doctor"),
                specialty=d.get("specialty", "General Medicine"),
                qualifications=d.get("qualifications", "MBBS, MD"),
                availability_status=d.get("availability_status", "Available")
            )
            for d in specs
        ]

        res = HospitalResponse(
            id=h.id,
            name=h.name,
            code=h.code,
            village_area=h.village_area,
            district=h.district,
            address=h.address,
            latitude=h.latitude,
            longitude=h.longitude,
            contact_number=h.contact_number,
            total_beds=h.total_beds,
            occupied_beds=h.occupied_beds,
            available_beds=h.available_beds,
            availability_status=h.availability_status,
            doctors_available_count=h.doctors_available_count,
            doctor_specialties=doc_objs,
            distance_km=dist,
            last_updated_at=h.last_updated_at
        )
        results.append(res)

    # Sort by distance
    results.sort(key=lambda x: x.distance_km or 0.0)

    return APIResponse.success(data=results, message="Rural hospitals retrieved successfully")


@router.get("/hospitals/{hospital_id}", status_code=status.HTTP_200_OK)
def get_rural_hospital_details(
    hospital_id: uuid.UUID,
    user_lat: Optional[float] = Query(23.1205),
    user_lng: Optional[float] = Query(83.1970),
    db: Session = Depends(get_db)
):
    """Retrieve full details for a specific rural hospital."""
    h = db.query(RuralHospital).filter(RuralHospital.id == hospital_id).first()
    if not h:
        raise NotFoundException(f"Hospital with ID '{hospital_id}' not found.")

    dist = calculate_haversine_distance(user_lat, user_lng, h.latitude, h.longitude) if h.latitude and h.longitude else 3.5

    doc_objs = [
        DoctorInHospital(
            name=d.get("name", "Doctor"),
            specialty=d.get("specialty", "General Medicine"),
            qualifications=d.get("qualifications", "MBBS, MD"),
            availability_status=d.get("availability_status", "Available")
        )
        for d in (h.doctor_specialties or [])
    ]

    res = HospitalResponse(
        id=h.id,
        name=h.name,
        code=h.code,
        village_area=h.village_area,
        district=h.district,
        address=h.address,
        latitude=h.latitude,
        longitude=h.longitude,
        contact_number=h.contact_number,
        total_beds=h.total_beds,
        occupied_beds=h.occupied_beds,
        available_beds=h.available_beds,
        availability_status=h.availability_status,
        doctors_available_count=h.doctors_available_count,
        doctor_specialties=doc_objs,
        distance_km=dist,
        last_updated_at=h.last_updated_at
    )
    return APIResponse.success(data=res)


@router.get("/medicines", status_code=status.HTTP_200_OK)
def list_rural_medicines(
    village_area: Optional[str] = Query(None, description="Filter by village/area"),
    status_filter: Optional[str] = Query(None, description="'In Stock', 'Limited Stock', 'Out of Stock', 'In Transit'"),
    search: Optional[str] = Query(None, description="Search medicine name, purpose, or supplier"),
    db: Session = Depends(get_db)
):
    """Retrieve location-based medicine stock, pharmacy suppliers, and delivery order statuses."""
    ensure_initial_seed_data(db)

    query = db.query(RuralMedicineAvailability)

    if village_area and village_area.lower() != "all":
        query = query.filter(RuralMedicineAvailability.village_area.ilike(f"%{village_area}%"))

    if status_filter and status_filter.lower() != "all":
        query = query.filter(RuralMedicineAvailability.availability_status.ilike(f"%{status_filter}%"))

    if search:
        query = query.filter(
            (RuralMedicineAvailability.medicine_name.ilike(f"%{search}%")) |
            (RuralMedicineAvailability.purpose.ilike(f"%{search}%")) |
            (RuralMedicineAvailability.supplier_name.ilike(f"%{search}%"))
        )

    medicines = query.order_by(RuralMedicineAvailability.last_updated_at.desc()).all()
    results = [MedicineResponse.model_validate(m) for m in medicines]
    return APIResponse.success(data=results, message="Rural medicine availability retrieved successfully")


@router.post("/medicines", status_code=status.HTTP_201_CREATED)
def create_medicine_stock(
    med_in: MedicineCreateUpdate,
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Authorized Health Workers or Admins add a new medicine stock record or supply order."""
    med = RuralMedicineAvailability(
        id=uuid.uuid4(),
        medicine_name=med_in.medicine_name,
        purpose=med_in.purpose,
        quantity=med_in.quantity,
        availability_status=med_in.availability_status,
        supplier_name=med_in.supplier_name,
        supplier_address=med_in.supplier_address,
        contact_number=med_in.contact_number,
        village_area=med_in.village_area,
        order_status=med_in.order_status,
        expected_delivery=med_in.expected_delivery,
    )
    db.add(med)
    db.commit()
    db.refresh(med)

    log_audit_event(
        action="MEDICINE_STOCK_ADDED",
        performed_by=current_user.id,
        target_resource="MEDICINE_STOCK",
        resource_id=med.id,
        details={"medicine_name": med.medicine_name, "quantity": med.quantity}
    )

    res = MedicineResponse.model_validate(med)
    return APIResponse.created(data=res, message="Medicine stock record added successfully")


@router.put("/medicines/{medicine_id}", status_code=status.HTTP_200_OK)
def update_medicine_stock(
    medicine_id: uuid.UUID,
    med_in: MedicineCreateUpdate,
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Authorized Health Workers or Admins update existing medicine quantity, status, and delivery info."""
    med = db.query(RuralMedicineAvailability).filter(RuralMedicineAvailability.id == medicine_id).first()
    if not med:
        raise NotFoundException(f"Medicine record '{medicine_id}' not found.")

    med.medicine_name = med_in.medicine_name
    med.purpose = med_in.purpose
    med.quantity = med_in.quantity
    med.availability_status = med_in.availability_status
    med.supplier_name = med_in.supplier_name
    med.supplier_address = med_in.supplier_address
    med.contact_number = med_in.contact_number
    med.village_area = med_in.village_area
    med.order_status = med_in.order_status
    med.expected_delivery = med_in.expected_delivery
    med.last_updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(med)

    log_audit_event(
        action="MEDICINE_STOCK_UPDATED",
        performed_by=current_user.id,
        target_resource="MEDICINE_STOCK",
        resource_id=med.id,
        details={"medicine_name": med.medicine_name, "quantity": med.quantity}
    )

    res = MedicineResponse.model_validate(med)
    return APIResponse.success(data=res, message="Medicine stock updated successfully")


@router.put("/hospitals/{hospital_id}/beds", status_code=status.HTTP_200_OK)
def update_hospital_beds(
    hospital_id: uuid.UUID,
    bed_in: HospitalBedUpdate,
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Authorized Health Workers or Admins update bed counts and doctor availability for a hospital."""
    h = db.query(RuralHospital).filter(RuralHospital.id == hospital_id).first()
    if not h:
        raise NotFoundException(f"Hospital with ID '{hospital_id}' not found.")

    if bed_in.occupied_beds > bed_in.total_beds:
        raise BadRequestException("Occupied beds cannot exceed total beds.")

    h.total_beds = bed_in.total_beds
    h.occupied_beds = bed_in.occupied_beds
    h.available_beds = bed_in.total_beds - bed_in.occupied_beds

    if h.available_beds == 0:
        h.availability_status = "Full"
    elif h.available_beds <= 10:
        h.availability_status = "Limited"
    else:
        h.availability_status = "Beds Available"

    if bed_in.doctors_available_count is not None:
        h.doctors_available_count = bed_in.doctors_available_count

    h.last_updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(h)

    log_audit_event(
        action="HOSPITAL_BEDS_UPDATED",
        performed_by=current_user.id,
        target_resource="RURAL_HOSPITAL",
        resource_id=h.id,
        details={"available_beds": h.available_beds, "status": h.availability_status}
    )

    res = HospitalResponse.model_validate(h)
    return APIResponse.success(data=res, message="Hospital bed counts updated successfully")
