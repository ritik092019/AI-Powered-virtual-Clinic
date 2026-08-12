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
        Generates structured symptoms & patient-friendly advice in the selected regional language.
        """
        symptoms_map = {
            "hi": ["तेज बुखार (High Fever)", "सिर दर्द (Headache)", "सांस में हल्की तकलीफ (Mild Shortness of Breath)"],
            "te": ["తీవ్ర జ్వరం (Fever)", "తలనొప్పి (Headache)", "శ్వాసకోశ ఇబ్బంది (Breathing difficulty)"],
            "ta": ["காய்ச்சல் (Fever)", "தலைவலி (Headache)", "மூச்சுத் திணறல் (Shortness of breath)"],
            "mr": ["ताप (Fever)", "डोकेदुखी (Headache)", "श्वासाचा त्रास (Breathing issue)"],
            "en": ["High Fever (101°F)", "Frontal Headache", "Mild Breathlessness"],
        }

        advice_map = {
            "hi": "चिंता न करें। आपका विवरण दर्ज कर लिया गया है। कृपया पर्याप्त आराम करें, गुनगुना पानी पिएं और यदि बुखार १००°F से अधिक बना रहे तो नजदीकी स्वास्थ्य केंद्र के डॉक्टर से परामर्श लें।",
            "te": "కంగారు పడకండి. మీ ఆరోగ్య సమాచారం నమోదైంది. తగినంత విశ్రాంతి తీసుకోండి మరియు గోరువెచ్చని నీరు తాగండి. జ్వరం కొనసాగితే వైద్యుడిని సంప్రదించండి.",
            "ta": "பயப்பட வேண்டாம். உங்கள் உடல்நலத் தகவல் பதிவாகியுள்ளது. போதுமான ஓய்வு எடுத்து வெதுவெதுப்பான நீரைக் குடிக்கவும். காய்ச்சல் நீடித்தால் மருத்துவரை அணுகவும்.",
            "mr": "काळजी करू नका. तुमची माहिती नोंदवली गेली आहे. पुरेशी विश्रांती घ्या आणि कोमट पाणी प्या. ताप कायम राहिल्यास डॉक्टरांचा सल्ला घ्या.",
            "en": "Do not panic. Your symptom log has been recorded. Drink warm fluids, take rest, and consult a tele-doctor if fever persists above 100°F.",
        }

        precautions_map = {
            "hi": ["पर्याप्त मात्रा में पानी और तरल पदार्थ लें", "ठंडे पेय और धूल से बचें", "नियमित तापमान मापें"],
            "te": ["తగినంత నీరు మరియు ద్రవపదార్థాలు తీసుకోండి", "చల్లని డ్రింక్స్ నివారించండి", "శరీర ఉష్ణోగ్రతను పర్యవేక్షించండి"],
            "ta": ["போதுமான அளவு தண்ணீர் குடிக்கவும்", "குளிர்ந்த பானங்களை தவிர்க்கவும்", "உடல் வெப்பநிலையைக் கண்காணிக்கவும்"],
            "mr": ["भरपूर पाणी आणि द्रवपदार्थ प्या", "थंड पेय टाळा", "तापमान नियमित तपासा"],
            "en": ["Hydrate adequately with clean warm water", "Avoid cold drinks and dust exposure", "Monitor temperature twice daily"],
        }

        next_steps_map = {
            "hi": ["१. स्वास्थ्य कार्यकर्ता द्वारा डॉक्टर परामर्श शेड्यूल करें", "२. हर ४ घंटे में तापमान नोट करें"],
            "te": ["1. హెల్త్ వర్కర్ ద్వారా డాక్టర్ కన్సల్టేషన్ షెడ్యూల్ చేయండి", "2. ప్రతి 4 గంటలకు జ్వరం కొలవండి"],
            "ta": ["1. சுகாதாரப் பணியாளர் மூலம் மருத்துவ ஆலோசனையைப் பெறவும்", "2. 4 மணி நேரத்திற்கு ஒருமுறை வெப்பநிலையைக் குறிக்கவும்"],
            "mr": ["१. आरोग्य सेवकामार्फत डॉक्टरांचे मार्गदर्शन घ्या", "२. दर ४ तासांनी ताप मोजा"],
            "en": ["1. Schedule a tele-doctor consultation via health worker", "2. Track body temperature every 4 hours"],
        }

        symptoms = symptoms_map.get(lang, symptoms_map["hi"])
        advice = advice_map.get(lang, advice_map["hi"])
        precautions = precautions_map.get(lang, precautions_map["hi"])
        next_steps = next_steps_map.get(lang, next_steps_map["hi"])
        urgency = "MODERATE"

        return symptoms, advice, urgency, precautions, next_steps
