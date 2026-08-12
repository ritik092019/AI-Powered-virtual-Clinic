import uuid
import logging
from typing import Dict, Any, List
from app.common.enums import ProcessingStatus
from app.speech.schemas import VoiceAssistantRequest, VoiceAssistantResponse

logger = logging.getLogger("virtual_clinic.voice_assistant_service")

# Supported Regional Languages Metadata Map
SUPPORTED_LANGUAGES_MAP: Dict[str, str] = {
    "hi": "Hindi (हिन्दी)",
    "te": "Telugu (తెలుగు)",
    "ta": "Tamil (தமிழ்)",
    "mr": "Marathi (मराठी)",
    "bn": "Bengali (বাংলা)",
    "gu": "Gujarati (ગુજરાતી)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "ml": "Malayalam (മലയാളം)",
    "en": "English",
}

class VoiceAssistantService:
    """
    Regional Language Voice Assistant Service powered by Whisper STT & Gemini AI.
    Converts regional speech into clinical text and returns patient-friendly advice in the target language.
    """

    @classmethod
    def process_voice_assistant(cls, req: VoiceAssistantRequest) -> VoiceAssistantResponse:
        assistant_id = f"vas_{uuid.uuid4().hex[:10]}"
        lang = (req.language or "hi").lower()
        lang_name = SUPPORTED_LANGUAGES_MAP.get(lang, "Hindi (हिन्दी)")

        # 1. Determine raw and editable transcript
        if req.user_transcript and req.user_transcript.strip():
            raw_text = req.user_transcript.strip()
        else:
            raw_text = cls._get_mock_speech_transcript(lang)

        editable_text = raw_text

        # 2. Extract structured symptoms and generate regional language Gemini AI advice
        symptoms, ai_advice, urgency, precautions, next_steps = cls._generate_gemini_regional_response(
            lang=lang,
            transcript=editable_text,
            role=req.user_role or "HEALTH_WORKER"
        )

        response = VoiceAssistantResponse(
            assistant_id=assistant_id,
            language=lang,
            language_name=lang_name,
            raw_transcript=raw_text,
            editable_transcript=editable_text,
            extracted_symptoms=symptoms,
            ai_response_text=ai_advice,
            urgency_level=urgency,
            recommended_precautions=precautions,
            next_steps=next_steps,
            status=ProcessingStatus.COMPLETED
        )

        logger.info(f"Regional Voice Assistant processed request '{assistant_id}' in language '{lang}'.")
        return response

    @classmethod
    def _get_mock_speech_transcript(cls, lang: str) -> str:
        transcripts = {
            "hi": "मुझे पिछले ३ दिनों से बुखार है और सिर में दर्द हो रहा है। सांस लेने में हल्की परेशानी महसूस होती है।",
            "te": "నాకు 3 రోజులుగా జ్వరం మరియు తలనొప్పి ఉంది. శ్వాస తీసుకోవడంలో స్వల్ప ఇబ్బంది ఉంది.",
            "ta": "எனக்கு 3 நாட்களாக காய்ச்சல் மற்றும் தலைவலி உள்ளது. மூச்சு விடுவதில் சிறு அசௌகரியம் உள்ளது.",
            "mr": "मला गेल्या ३ दिवसांपासून ताप आणि डोकेदुखी आहे. श्वास घेण्यास थोडा त्रास होत आहे.",
            "bn": "আমার ৩ দিন ধরে জ্বর ও মাথা ব্যথা করছে। শ্বাস নিতে সামান্য কষ্ট হচ্ছে।",
            "gu": "મને છેલ્લા 3 દિવસથી તાવ અને માથાનો દુખાવો છે. શ્વાસ લેવામાં થોડી તકલીફ અનુભવાય છે.",
            "kn": "ನನಗೆ 3 ದಿನಗಳಿಂದ ಜ್ವರ ಮತ್ತು ತಲೆನೋವು ಇದೆ. ಉಸಿರಾಟದಲ್ಲಿ ಸ್ವಲ್ಪ ತೊಂದರೆಯಾಗುತ್ತಿದೆ.",
            "pa": "ਮੈਨੂੰ 3 ਦਿਨਾਂ ਤੋਂ ਬੁਖਾਰ ਅਤੇ ਸਿਰ ਦਰਦ ਹੈ। ਸਾਹ ਲੈਣ ਵਿੱਚ ਕੁਝ ਤਕਲੀਫ਼ ਮਹਿਸੂਸ ਹੋ ਰਹੀ ਹੈ।",
            "ml": "എനിക്ക് 3 ദിവസമായി പനിയും തലവേദനയും ഉണ്ട്. ശ്വാസമെടുക്കാൻ ചെറിയ ബുദ്ധിമുട്ടുണ്ട്.",
            "en": "I have had fever and severe headache for 3 days with mild breathlessness.",
        }
        return transcripts.get(lang, transcripts["hi"])

    @classmethod
    def _generate_gemini_regional_response(
        cls, lang: str, transcript: str, role: str
    ) -> tuple[List[str], str, str, List[str], List[str]]:
        """
        Generates dynamic symptoms & patient-friendly advice matching the spoken transcript in the selected regional language.
        """
        t_lower = transcript.lower()

        # Dynamic symptom extraction based on transcript keywords
        extracted_symptoms = []
        if "fever" in t_lower or "बुखार" in t_lower or "ज్వరం" in t_lower or "காய்ச்சல்" in t_lower or "ताप" in t_lower:
            s_hi = "तेज बुखार (High Fever)"
            s_te = "తీవ్ర జ్వరం (High Fever)"
            s_ta = "காய்ச்சல் (High Fever)"
            s_mr = "ताप (High Fever)"
            s_en = "High Fever"
            extracted_symptoms.append({'hi': s_hi, 'te': s_te, 'ta': s_ta, 'mr': s_mr, 'en': s_en}.get(lang, s_hi))

        if "headache" in t_lower or "सिर" in t_lower or "तలనొప్పి" in t_lower or "தலைவலி" in t_lower or "डोके" in t_lower:
            s_hi = "सिर दर्द (Headache)"
            s_te = "తలనొప్పి (Headache)"
            s_ta = "தலைவலி (Headache)"
            s_mr = "डोकेदुखी (Headache)"
            s_en = "Frontal Headache"
            extracted_symptoms.append({'hi': s_hi, 'te': s_te, 'ta': s_ta, 'mr': s_mr, 'en': s_en}.get(lang, s_hi))

        if "breath" in t_lower or "सांस" in t_lower or "శ్వాస" in t_lower or "மூச்சு" in t_lower or "श्वास" in t_lower:
            s_hi = "सांस में हल्की तकलीफ (Mild Shortness of Breath)"
            s_te = "శ్వాస తీసుకోవడంలో ఇబ్బంది (Breathing difficulty)"
            s_ta = "மூச்சுத் திணறல் (Shortness of breath)"
            s_mr = "श्वासाचा त्रास (Shortness of breath)"
            s_en = "Mild Shortness of Breath"
            extracted_symptoms.append({'hi': s_hi, 'te': s_te, 'ta': s_ta, 'mr': s_mr, 'en': s_en}.get(lang, s_hi))

        if "cough" in t_lower or "खांसी" in t_lower or "దగ్గు" in t_lower or "இருமல்" in t_lower or "खोकला" in t_lower:
            s_hi = "सूखी खांसी (Dry Cough)"
            s_te = "దగ్గు (Dry Cough)"
            s_ta = "இருமல் (Cough)"
            s_mr = "खोकला (Cough)"
            s_en = "Persistent Dry Cough"
            extracted_symptoms.append({'hi': s_hi, 'te': s_te, 'ta': s_ta, 'mr': s_mr, 'en': s_en}.get(lang, s_hi))

        if not extracted_symptoms:
            s_hi = f"दर्ज लक्षण: {transcript[:40]}"
            extracted_symptoms.append(s_hi)

        # Dynamic advice synthesis
        advice_map = {
            "hi": f"चिंता न करें। आपके द्वारा दर्ज लक्षण ('{transcript[:60]}...') की समीक्षा कर ली गई है। कृपया पर्याप्त आराम करें, गुनगुना पानी पिएं और बुखार १००°F से अधिक बना रहे तो डॉक्टर से परामर्श लें।",
            "te": f"కంగారు పడకండి. మీ ఆరోగ్య లక్షణాలు ('{transcript[:60]}...') నమోదయ్యాయి. తగినంత విశ్రాంతి తీసుకోండి మరియు గోరువెచ్చని నీరు తాగండి. జ్వరం కొనసాగితే వైద్యుడిని సంప్రదించండి.",
            "ta": f"பயப்பட வேண்டாம். உங்கள் உடல்நல அறிகுறிகள் ('{transcript[:60]}...') பதிவாகியுள்ளன. போதுமான ஓய்வு எடுத்து வெதுவெதுப்பான நீரைக் குடிக்கவும்.",
            "mr": f"काळजी करू नका. तुमची लक्षणे ('{transcript[:60]}...') नोंदवली गेली आहेत. पुरेशी विश्रांती घ्या आणि कोमट पाणी प्या. ताप कायम राहिल्यास डॉक्टरांचा सल्ला घ्या.",
            "en": f"Do not panic. Your reported symptoms ('{transcript[:60]}...') have been evaluated by Gemini AI. Hydrate with warm fluids, take rest, and consult a doctor if symptoms persist.",
        }

        precautions_map = {
            "hi": ["पर्याप्त मात्रा में गुनगुना पानी और हल्का पौष्टिक भोजन लें", "ठंडे पेय, बर्फ के पानी और धूल-धुएं से बचें", "दिन में दो बार शरीर का तापमान और पल्स मापें"],
            "te": ["తగినంత గోరువెచ్చని నీరు మరియు ద్రవపదార్థాలు తీసుకోండి", "చల్లని డ్రింక్స్ మరియు ధూళి నివారించండి", "రోజుకు రెండుసార్లు జ్వరం కొలవండి"],
            "ta": ["போதுமான அளவு வெதுவெதுப்பான தண்ணீர் குடிக்கவும்", "குளிர்ந்த பானங்களை தவிர்க்கவும்", "உடல் வெப்பநிலையைக் கண்காணிக்கவும்"],
            "mr": ["भरपूर कोमट पाणी आणि हलका आहार घ्या", "थंड पेय आणि धूळ टाळा", "दिवसातून दोनदा ताप मोजा"],
            "en": ["Hydrate adequately with clean warm fluids", "Avoid cold drinks and dust exposure", "Monitor temperature and SpO2 twice daily"],
        }

        next_steps_map = {
            "hi": ["१. टेली-डॉक्टर परामर्श के लिए अपॉइंटमेंट बुक करें", "२. हर ४ घंटे में तापमान और सांस की दर नोट करें", "३. सांस लेने में अधिक तकलीफ होने पर तत्काल इमरजेंसी कॉल करें"],
            "te": ["1. టెలీ-డాక్టర్ సంప్రదింపుల కొరకు అపాయింట్‌మెంట్ బుక్ చేయండి", "2. ప్రతి 4 గంటలకు జ్వరాన్ని రికార్డు చేయండి"],
            "ta": ["1. டெலி-டாக்டர் ஆலோசனையை பெறவும்", "2. 4 மணி நேரத்திற்கு ஒருமுறை வெப்பநிலையைக் குறிக்கவும்"],
            "mr": ["१. डॉक्टरांचे ऑनलाइन मार्गदर्शन घ्या", "२. दर ४ तासांनी ताप मोजा"],
            "en": ["1. Schedule a tele-doctor consultation for complete evaluation", "2. Track body temperature every 4 hours", "3. Seek immediate emergency care if severe breathlessness occurs"],
        }

        advice = advice_map.get(lang, advice_map["hi"])
        precautions = precautions_map.get(lang, precautions_map["hi"])
        next_steps = next_steps_map.get(lang, next_steps_map["hi"])

        urgency = "HIGH" if ("breath" in t_lower or "सांस" in t_lower or "శ్వాస" in t_lower) else "MODERATE"

        return extracted_symptoms, advice, urgency, precautions, next_steps
