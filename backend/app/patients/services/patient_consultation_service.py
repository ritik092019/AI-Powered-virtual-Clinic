import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional
from app.patients.schemas import (
    PatientDoctorConsultationResponse,
    PatientAssignedDoctorInfo,
    PatientDoctorChatMessage,
    PatientDoctorChatMessageRequest,
)

logger = logging.getLogger("virtual_clinic.patient_consultation_service")

# In-memory chat store per consultation for real-time messaging demo
CHAT_MESSAGES_STORE: dict[str, List[PatientDoctorChatMessage]] = {}

class PatientConsultationService:
    """Service to process patient doctor consultations, assigned doctor profiles, live tele-consultation metadata, and real-time patient-doctor chat."""

    @classmethod
    def get_patient_doctor_consultations(cls, patient_id: uuid.UUID) -> List[PatientDoctorConsultationResponse]:
        doc_id = uuid.UUID("a9110000-0000-4000-a000-000000000001")
        doc_info = PatientAssignedDoctorInfo(
            doctor_id=doc_id,
            name="Dr. Rajesh Verma",
            specialization="Senior Tele-Consultant / General Medicine",
            qualifications="MBBS, MD (Internal Medicine)",
            experience_years=14,
            license_number="MCI-889021",
        )

        c1_id = uuid.UUID("c1111111-1111-4111-a111-111111111111")
        c1_messages = CHAT_MESSAGES_STORE.get(str(c1_id), [
            PatientDoctorChatMessage(
                id="msg-1",
                sender_id=doc_id,
                sender_name="Dr. Rajesh Verma",
                sender_role="DOCTOR",
                message_text="Namaste. I have reviewed your blood pressure and sugar logs. How are you feeling today?",
                timestamp=datetime.now(timezone.utc),
            ),
            PatientDoctorChatMessage(
                id="msg-2",
                sender_id=patient_id,
                sender_name="Patient",
                sender_role="PATIENT",
                message_text="Hello Doctor. Fever has reduced, but I still feel mild headache in the morning.",
                timestamp=datetime.now(timezone.utc),
            ),
        ])

        item1 = PatientDoctorConsultationResponse(
            consultation_id=c1_id,
            patient_id=patient_id,
            patient_name="Ramesh Patel",
            doctor=doc_info,
            status="In Consultation",
            chief_complaint="Elevated blood sugar and mild morning headache for 3 days",
            appointment_date_time="Today, 11:30 AM",
            follow_up_date="18 Aug 2026",
            doctor_notes="Patient responds well to Metformin 500mg. Continue morning dosage after breakfast. Hydrate with 3L warm water daily.",
            prescriptions=[
                "Metformin 500mg - 1 tablet twice daily (after meals)",
                "Teneligliptin 20mg - 1 tablet once daily before breakfast",
                "Paracetamol 650mg - 1 tablet SOS for headache",
            ],
            follow_up_instructions=[
                "1. Measure fasting blood sugar twice weekly.",
                "2. Maintain low-salt, low-sugar diet.",
                "3. Re-visit clinic in 7 days for follow-up review.",
            ],
            chat_messages=c1_messages,
            created_at=datetime.now(timezone.utc),
        )

        c2_id = uuid.UUID("c2222222-2222-4222-a222-222222222222")
        c2_messages = CHAT_MESSAGES_STORE.get(str(c2_id), [
            PatientDoctorChatMessage(
                id="msg-201",
                sender_id=doc_id,
                sender_name="Dr. Sunita Rao",
                sender_role="DOCTOR",
                message_text="Follow-up consultation complete. Chest breathlessness has cleared.",
                timestamp=datetime.now(timezone.utc),
            )
        ])

        doc_info2 = PatientAssignedDoctorInfo(
            doctor_id=uuid.UUID("a9110000-0000-4000-a000-000000000002"),
            name="Dr. Sunita Rao",
            specialization="Pulmonology Specialist",
            qualifications="MBBS, DNB (Respiratory Diseases)",
            experience_years=10,
            license_number="MCI-441209",
        )

        item2 = PatientDoctorConsultationResponse(
            consultation_id=c2_id,
            patient_id=patient_id,
            patient_name="Ramesh Patel",
            doctor=doc_info2,
            status="Completed",
            chief_complaint="Chest congestion follow-up",
            appointment_date_time="10 Aug 2026, 03:00 PM",
            follow_up_date="25 Aug 2026",
            doctor_notes="Chest lungs clear. SpO2 98% on room air.",
            prescriptions=["Amoxicillin 500mg - 1 capsule 3 times daily (5 days)"],
            follow_up_instructions=["Avoid cold drinks and dust."],
            chat_messages=c2_messages,
            created_at=datetime.now(timezone.utc),
        )

        return [item1, item2]

    @classmethod
    def send_chat_message(
        cls, patient_id: uuid.UUID, req: PatientDoctorChatMessageRequest
    ) -> PatientDoctorChatMessage:
        c_id_str = str(req.consultation_id)
        if c_id_str not in CHAT_MESSAGES_STORE:
            CHAT_MESSAGES_STORE[c_id_str] = []

        new_msg = PatientDoctorChatMessage(
            id=f"msg_{uuid.uuid4().hex[:8]}",
            sender_id=patient_id,
            sender_name="Patient",
            sender_role="PATIENT",
            message_text=req.message_text.strip(),
            timestamp=datetime.now(timezone.utc),
        )

        CHAT_MESSAGES_STORE[c_id_str].append(new_msg)
        logger.info(f"Patient '{patient_id}' sent chat message for consultation '{req.consultation_id}'.")
        return new_msg
