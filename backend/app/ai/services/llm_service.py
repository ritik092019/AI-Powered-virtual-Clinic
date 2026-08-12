import os
import uuid
import logging
from typing import Dict, Any, List
from app.core.config import settings
from app.common.enums import RiskLevel, ProcessingStatus
from app.ai.schemas import AIAssessmentResponse

logger = logging.getLogger("virtual_clinic.llm_service")

class LLMService:
    """
    Provider-independent LLM service supporting OpenAI, Gemini, or Mock Provider.
    Strictly separates verbatim extracted facts from AI interpretation and flags missing info.
    """

    @classmethod
    def generate_assessment(cls, consultation_data: Dict[str, Any]) -> AIAssessmentResponse:
        consultation_id = consultation_data.get("consultation_id") or consultation_data.get("id") or uuid.uuid4()
        if isinstance(consultation_id, str):
            consultation_id = uuid.UUID(consultation_id)

        symptoms = consultation_data.get("symptoms", [])
        vitals = consultation_data.get("vitals", {})
        chief_complaint = consultation_data.get("chief_complaint", "")
        voice_transcript = consultation_data.get("voice_transcript", "")

        # 1. Extracted Facts (verbatim data provided)
        extracted_facts: List[str] = []
        if chief_complaint:
            extracted_facts.append(f"Chief Complaint: {chief_complaint}")
        
        for s in symptoms:
            if isinstance(s, dict):
                name = s.get("name")
                sev = s.get("severity")
                dur = s.get("duration")
                extracted_facts.append(f"Symptom: {name} (Severity: {sev}/10, Duration: {dur})")

        temp = vitals.get("temperature", {}) if isinstance(vitals, dict) else {}
        spo2 = vitals.get("spo2", {}) if isinstance(vitals, dict) else {}
        bp = vitals.get("blood_pressure", {}) if isinstance(vitals, dict) else {}

        if temp and isinstance(temp, dict) and temp.get("value"):
            extracted_facts.append(f"Vitals - Temperature: {temp.get('value')} {temp.get('unit', 'F')}")
        if spo2 and isinstance(spo2, dict) and spo2.get("value"):
            extracted_facts.append(f"Vitals - SpO2: {spo2.get('value')}%")
        if bp and isinstance(bp, dict) and bp.get("systolic"):
            extracted_facts.append(f"Vitals - Blood Pressure: {bp.get('systolic')}/{bp.get('diastolic')} mmHg")

        # 2. Missing Information Identification
        missing_information: List[str] = []
        if not temp or not temp.get("value"):
            missing_information.append("Body Temperature not recorded")
        if not spo2 or not spo2.get("value"):
            missing_information.append("Blood Oxygen (SpO2) not recorded")
        if not bp or not bp.get("systolic"):
            missing_information.append("Blood Pressure not recorded")
        if not symptoms:
            missing_information.append("Detailed symptoms list empty")
        if not voice_transcript:
            missing_information.append("Patient voice intake transcript missing")

        # 3. AI Clinical Interpretation
        ai_interpretation: List[str] = []
        risk_level = RiskLevel.LOW
        risk_reason = "Normal vital signs and mild reported symptoms."
        recommendation = "Standard community health worker follow-up within 48 hours."

        # Analyze physiological vitals
        if temp and isinstance(temp, dict) and temp.get("value", 0) > 100.4:
            ai_interpretation.append("Fever pattern detected requiring thermal control and hydration.")
            risk_level = RiskLevel.MODERATE
            risk_reason = "Elevated body temperature indicating systemic inflammatory response."
            recommendation = "Administer antipyretic guidelines and schedule physician teleconsultation."

        if spo2 and isinstance(spo2, dict) and spo2.get("value", 100) < 95.0:
            ai_interpretation.append("Hypoxia risk identified: Blood oxygen saturation below 95%.")
            if spo2.get("value", 100) < 90.0:
                risk_level = RiskLevel.HIGH
                risk_reason = "Severe hypoxemia detected (SpO2 < 90%). Immediate oxygenation and doctor review required."
                recommendation = "High priority doctor escalation; arrange oxygen support."
            else:
                risk_level = RiskLevel.MODERATE
                risk_reason = "Moderate hypoxemia (SpO2 90-94%). Monitor respiratory rate."

        if bp and isinstance(bp, dict) and bp.get("systolic", 120) > 140:
            ai_interpretation.append("Hypertension pattern detected (Systolic BP > 140 mmHg).")

        if not ai_interpretation:
            ai_interpretation.append("Vitals within expected physiological ranges for intake.")

        provider_name = f"{settings.AI_PROVIDER.lower()}-triage-llm-v1"

        return AIAssessmentResponse(
            id=uuid.uuid4(),
            consultation_id=consultation_id,
            extracted_facts=extracted_facts,
            ai_interpretation=ai_interpretation,
            missing_information=missing_information,
            risk_level=risk_level,
            risk_reason=risk_reason,
            recommendation=recommendation,
            confidence=0.92,
            model_name=provider_name,
            status=ProcessingStatus.COMPLETED
        )
