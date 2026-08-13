import uuid
import logging
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.users.models import User
from app.doctors.models import DoctorAvailability
from app.appointments.models import Appointment
from app.common.enums import UserRole, DoctorAvailabilityStatus, AppointmentStatus, NotificationType, RiskLevel
from app.notifications.service import NotificationService
from app.audit.service import log_audit_event

logger = logging.getLogger("virtual_clinic.doctor_matcher")

class DoctorMatcher:
    """
    Deterministic Smart Doctor Auto-Matching Engine.
    Evaluates available doctors using a weighted scoring formula:
    - Specialty Match: up to 50 pts
    - Language Preference: up to 30 pts
    - Availability Status: up to 10 pts
    - Workload Balance: up to 10 pts
    """

    def __init__(self, db: Session):
        self.db = db

    def auto_match_doctor(self, appointment: Appointment) -> Tuple[Optional[User], float, str]:
        """
        Auto-matches the best available doctor for the given appointment.
        Updates appointment status, doctor_id, match_score, and sends notifications.
        Returns (matched_doctor, score, matching_notes)
        """
        # Fetch all active doctor users
        doctors = self.db.query(User).filter(
            User.role == UserRole.DOCTOR,
            User.is_active == True
        ).all()

        if not doctors:
            notes = f"No active doctors registered in system for specialty '{appointment.classified_specialty}'."
            appointment.status = AppointmentStatus.PENDING_QUEUE
            appointment.matching_notes = notes
            self.db.commit()
            self._notify_patient_queued(appointment)
            log_audit_event(
                action="APPOINTMENT_QUEUED",
                performed_by=appointment.patient_id,
                target_resource="APPOINTMENT",
                resource_id=appointment.id,
                details={"reason": notes, "specialty": appointment.classified_specialty}
            )
            return None, 0.0, notes

        # Map doctor availability statuses
        availabilities = {
            da.user_id: da for da in self.db.query(DoctorAvailability).all()
        }

        # Calculate active workload per doctor
        workloads = {}
        for d in doctors:
            count = self.db.query(Appointment).filter(
                Appointment.doctor_id == d.id,
                Appointment.status.in_([
                    AppointmentStatus.ASSIGNED,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.IN_CONSULTATION
                ])
            ).count()
            workloads[d.id] = count

        candidates: List[Tuple[User, float, str]] = []

        for doctor in doctors:
            score, reason = cls_score_doctor(doctor, availabilities.get(doctor.id), workloads.get(doctor.id, 0), appointment)
            candidates.append((doctor, score, reason))

        # Sort candidate doctors by score descending
        candidates.sort(key=lambda x: x[1], reverse=True)

        best_doctor, best_score, best_reason = candidates[0]

        # Require minimum threshold score of 50 to assign
        if best_score >= 50.0:
            appointment.doctor_id = best_doctor.id
            appointment.status = AppointmentStatus.ASSIGNED
            appointment.match_score = best_score
            appointment.matching_notes = f"Auto-matched with Dr. {best_doctor.name} (Score: {best_score}/100). {best_reason}"
            self.db.commit()

            # Notifications
            self._notify_doctor_assigned(appointment, best_doctor)
            self._notify_patient_assigned(appointment, best_doctor)

            log_audit_event(
                action="APPOINTMENT_AUTO_MATCHED",
                performed_by=appointment.patient_id,
                target_resource="APPOINTMENT",
                resource_id=appointment.id,
                details={
                    "doctor_id": str(best_doctor.id),
                    "doctor_name": best_doctor.name,
                    "score": best_score,
                    "specialty": appointment.classified_specialty
                }
            )
            logger.info(f"Appointment '{appointment.id}' auto-matched to Dr. '{best_doctor.name}' with score {best_score}.")
            return best_doctor, best_score, appointment.matching_notes
        else:
            notes = f"No doctor met minimum score threshold (Best score: {best_score}/100). Placed in priority queue."
            appointment.status = AppointmentStatus.PENDING_QUEUE
            appointment.match_score = best_score
            appointment.matching_notes = notes
            self.db.commit()

            self._notify_patient_queued(appointment)

            log_audit_event(
                action="APPOINTMENT_QUEUED",
                performed_by=appointment.patient_id,
                target_resource="APPOINTMENT",
                resource_id=appointment.id,
                details={"reason": notes, "best_score": best_score}
            )
            return None, best_score, notes

    def _notify_doctor_assigned(self, appointment: Appointment, doctor: User):
        notif_service = NotificationService(self.db)
        notif_service.send_notification(
            user_id=doctor.id,
            title="New Appointment Request Assigned",
            message=f"You have been auto-matched for a {appointment.preferred_language} patient request (Specialty: {appointment.classified_specialty}). Please accept or decline.",
            type=NotificationType.APPOINTMENT_MATCH,
            priority=RiskLevel.HIGH,
            related_entity_type="APPOINTMENT",
            related_entity_id=appointment.id,
            navigation_target=f"/doctor/appointments/{appointment.id}"
        )

    def _notify_patient_assigned(self, appointment: Appointment, doctor: User):
        notif_service = NotificationService(self.db)
        notif_service.send_notification(
            user_id=appointment.patient_id,
            title="Doctor Auto-Matched & Assigned",
            message=f"Dr. {doctor.name} ({appointment.classified_specialty}) has been assigned to your appointment request. Waiting for doctor confirmation.",
            type=NotificationType.APPOINTMENT_MATCH,
            priority=RiskLevel.MODERATE,
            related_entity_type="APPOINTMENT",
            related_entity_id=appointment.id,
            navigation_target=f"/patient/appointments"
        )

    def _notify_patient_queued(self, appointment: Appointment):
        notif_service = NotificationService(self.db)
        notif_service.send_notification(
            user_id=appointment.patient_id,
            title="Appointment Placed in Priority Queue",
            message=f"Your request for {appointment.classified_specialty} is in the queue. We will automatically assign an available doctor as soon as one comes online.",
            type=NotificationType.SYSTEM,
            priority=RiskLevel.MODERATE,
            related_entity_type="APPOINTMENT",
            related_entity_id=appointment.id,
            navigation_target=f"/patient/appointments"
        )


def cls_score_doctor(doctor: User, availability: Optional[DoctorAvailability], active_workload: int, appointment: Appointment) -> Tuple[float, str]:
    score = 0.0
    reasons = []

    # 1. Specialty Match (50 pts)
    doc_specialty = ""
    if availability and availability.specialty:
        doc_specialty = availability.specialty
    elif doctor.profile_metadata and isinstance(doctor.profile_metadata, dict):
        doc_specialty = doctor.profile_metadata.get("specialty", "")

    req_specialty = appointment.classified_specialty or "General Physician"

    if doc_specialty and (doc_specialty.lower() in req_specialty.lower() or req_specialty.lower() in doc_specialty.lower()):
        score += 50.0
        reasons.append("Exact specialty match (+50)")
    elif "general" in req_specialty.lower() or "family" in req_specialty.lower():
        score += 35.0
        reasons.append("General medicine fallback match (+35)")
    else:
        score += 20.0
        reasons.append("Cross-specialty consultation fallback (+20)")

    # 2. Language Match (30 pts)
    pref_lang = (appointment.preferred_language or "English").lower()
    doc_lang = (doctor.language or "English").lower()
    doc_langs_list = [doc_lang]
    if doctor.profile_metadata and isinstance(doctor.profile_metadata, dict):
        doc_langs_list.extend([l.lower() for l in doctor.profile_metadata.get("languages", [])])

    if pref_lang in doc_langs_list:
        score += 30.0
        reasons.append(f"Language match '{appointment.preferred_language}' (+30)")
    elif pref_lang in ["hindi", "english"] or "english" in doc_langs_list or "hindi" in doc_langs_list:
        score += 20.0
        reasons.append("Common language match (+20)")
    else:
        score += 10.0
        reasons.append("Translation support required (+10)")

    # 3. Availability (10 pts)
    if availability and availability.status == DoctorAvailabilityStatus.AVAILABLE:
        score += 10.0
        reasons.append("Doctor active and available (+10)")
    elif not availability:
        score += 5.0
        reasons.append("Doctor online status unverified (+5)")

    # 4. Workload Balance (10 pts)
    workload_pts = max(0.0, 10.0 - (active_workload * 2.5))
    score += workload_pts
    reasons.append(f"Workload balance ({active_workload} active consults, +{workload_pts:.1f})")

    return score, "; ".join(reasons)
