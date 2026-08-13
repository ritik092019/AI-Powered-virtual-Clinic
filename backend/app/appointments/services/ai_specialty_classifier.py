import logging
import json
import re
from typing import Dict, Any, Tuple
from app.core.config import settings

logger = logging.getLogger("virtual_clinic.ai_specialty_classifier")

PREDEFINED_SPECIALTIES = [
    "General Physician / Family Doctor",
    "Cardiologist (Heart Specialist)",
    "Pulmonologist (Chest & Respiratory)",
    "Diabetologist / Endocrinologist",
    "Pediatrician (Child Specialist)",
    "Gynecologist / Maternal Specialist",
    "Dermatologist (Skin Specialist)",
    "Orthopedic (Bone & Joint)",
    "Neurologist (Brain & Nerve)",
    "ENT Specialist (Ear, Nose, Throat)",
]

class AISpecialtyClassifier:
    """
    Classifies patient chief complaints into a predefined medical specialty using Gemini API.
    STRICT SAFETY RULE: Never outputs medical diagnoses, differential diagnoses, or prescriptions.
    Includes a deterministic keyword fallback if Gemini API is offline or unconfigured.
    """

    @classmethod
    def classify_complaint(cls, symptoms: str, duration: str = "", severity: str = "", age: int = None) -> Tuple[str, str, float]:
        """
        Returns: (classified_specialty, classification_source, confidence)
        """
        prompt = (
            "You are an expert clinical triage specialty categorizer.\n"
            "STRICT MANDATE: You MUST ONLY classify the patient's complaint into EXACTLY ONE medical specialty from the provided list.\n"
            "DO NOT provide any medical diagnosis, differential diagnosis, medical opinion, advice, or prescriptions under any circumstances.\n\n"
            f"Predefined Specialties:\n" + "\n".join(f"- {s}" for s in PREDEFINED_SPECIALTIES) + "\n\n"
            f"Patient Information:\n"
            f"- Symptoms: {symptoms}\n"
            f"- Duration: {duration or 'Not specified'}\n"
            f"- Severity: {severity or 'Not specified'}\n"
            f"- Age: {age if age is not None else 'Not specified'}\n\n"
            "Output JSON format strictly as:\n"
            "{\n"
            '  "specialty": "<Exact Name from list>",\n'
            '  "confidence": 0.95,\n'
            '  "reasoning": "Short 1 sentence reason"\n'
            "}"
        )

        # Attempt Gemini AI classification if API key is configured
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key-here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)
                text = response.text.strip()
                
                # Parse JSON output
                match = re.search(r"\{.*\}", text, re.DOTALL)
                if match:
                    data = json.loads(match.group(0))
                    specialty = data.get("specialty")
                    confidence = float(data.get("confidence", 0.9))
                    if specialty in PREDEFINED_SPECIALTIES:
                        logger.info(f"Gemini AI successfully classified complaint into '{specialty}' with confidence {confidence}.")
                        return specialty, "GEMINI_AI", confidence
            except Exception as e:
                logger.warning(f"Gemini API specialty classification failed: {e}. Falling back to rule engine.")

        # Fallback Rule Engine
        specialty, confidence = cls._rule_based_fallback(symptoms, age)
        return specialty, "KEYWORD_FALLBACK", confidence

    @classmethod
    def _rule_based_fallback(cls, symptoms: str, age: int = None) -> Tuple[str, float]:
        text = symptoms.lower()
        
        if age is not None and age <= 12:
            return "Pediatrician (Child Specialist)", 0.85

        if any(k in text for k in ["heart", "chest pain", "angina", "palpitation", "cardiac"]):
            return "Cardiologist (Heart Specialist)", 0.90
        elif any(k in text for k in ["cough", "breath", "lungs", "asthma", "wheez", "respiratory"]):
            return "Pulmonologist (Chest & Respiratory)", 0.90
        elif any(k in text for k in ["sugar", "diabetes", "glucose", "insulin", "thirst"]):
            return "Diabetologist / Endocrinologist", 0.90
        elif any(k in text for k in ["child", "infant", "baby", "kid", "pediatric"]):
            return "Pediatrician (Child Specialist)", 0.90
        elif any(k in text for k in ["pregnancy", "pregnant", "period", "maternal", "menstrual"]):
            return "Gynecologist / Maternal Specialist", 0.90
        elif any(k in text for k in ["skin", "rash", "itch", "acne", "eczema", "dermatitis"]):
            return "Dermatologist (Skin Specialist)", 0.90
        elif any(k in text for k in ["bone", "joint", "fracture", "knee", "spine", "back pain", "arthritis"]):
            return "Orthopedic (Bone & Joint)", 0.90
        elif any(k in text for k in ["headache", "numbness", "seizure", "dizziness", "paralysis", "migraine"]):
            return "Neurologist (Brain & Nerve)", 0.90
        elif any(k in text for k in ["ear", "nose", "throat", "sinus", "tonsil"]):
            return "ENT Specialist (Ear, Nose, Throat)", 0.90

        return "General Physician / Family Doctor", 0.75
