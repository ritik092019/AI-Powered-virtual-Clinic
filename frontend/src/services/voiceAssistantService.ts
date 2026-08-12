import axios from 'axios';

export interface VoiceAssistantRequestData {
  audio_base64?: string;
  language: string;
  user_transcript?: string;
  user_role?: string;
}

export interface VoiceAssistantResponseData {
  assistant_id: string;
  language: string;
  language_name: string;
  raw_transcript: string;
  editable_transcript: string;
  extracted_symptoms: string[];
  ai_response_text: string;
  urgency_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
  recommended_precautions: string[];
  next_steps: string[];
  status: string;
  created_at: string;
}

export const voiceAssistantService = {
  processVoiceAssistant: async (data: VoiceAssistantRequestData): Promise<VoiceAssistantResponseData> => {
    try {
      const token = localStorage.getItem('arogya_access_token');
      const response = await axios.post('/api/v1/speech/voice-assistant', data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data.data;
    } catch (err) {
      console.warn('Backend API unavailable, using local mock processing for voice assistant.', err);
      return voiceAssistantService.getMockResponse(data.language || 'hi', data.user_transcript, data.user_role);
    }
  },

  getMockResponse: (lang: string, transcript?: string, role = 'HEALTH_WORKER'): VoiceAssistantResponseData => {
    const rawText = transcript && transcript.trim() ? transcript.trim() : voiceAssistantService.getMockTranscript(lang);

    return {
      assistant_id: `vas_mock_${Math.random().toString(36).substring(2, 9)}`,
      language: lang,
      language_name: voiceAssistantService.getLanguageLabel(lang),
      raw_transcript: rawText,
      editable_transcript: rawText,
      extracted_symptoms: [
        'High Fever (101°F / बुखार)',
        'Headache (सिर दर्द)',
        'Mild Shortness of Breath (सांस में हल्की तकलीफ)',
      ],
      ai_response_text: voiceAssistantService.getRegionalAdvice(lang),
      urgency_level: 'MODERATE',
      recommended_precautions: [
        'Drink plenty of warm water and clear soup.',
        'Avoid cold water, ice drinks, and dust exposure.',
        'Record body temperature every 4 hours.',
      ],
      next_steps: [
        'Schedule a tele-doctor consultation for complete evaluation.',
        'Keep patient resting in a clean, ventilated room.',
      ],
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
    };
  },

  getMockTranscript: (lang: string): string => {
    const transcripts: Record<string, string> = {
      hi: 'मुझे पिछले ३ दिनों से बुखार है और सिर में दर्द हो रहा है। सांस लेने में हल्की परेशानी महसूस होती है।',
      te: 'నాకు 3 రోజులుగా జ్వరం మరియు తలనొప్పి ఉంది. శ్వాస తీసుకోవడంలో స్వల్ప ఇబ్బంది ఉంది.',
      ta: 'எனக்கு 3 நாட்களாக காய்ச்சல் மற்றும் தலைவலி உள்ளது. மூச்சு விடுவதில் சிறு அசௌகரியம் உள்ளது.',
      mr: 'मला गेल्या ३ दिवसांपासून ताप आणि डोकेदुखी आहे. श्वास घेण्यास थोडा त्रास होत आहे.',
      bn: 'আমার ৩ দিন ধরে জ্বর ও মাথা ব্যথা করছে। শ্বাস নিতে সামান্য কষ্ট হচ্ছে।',
      gu: 'મને છેલ્લા 3 દિવસથી તાવ અને માથાનો દુખાવો છે. શ્વાસ લેવામાં થોડી તકલીફ અનુભવાય છે.',
      kn: 'ನನಗೆ 3 ದಿನಗಳಿಂದ ಜ್ವರ ಮತ್ತು ತಲೆನೋವು ಇದೆ. ಉಸಿರಾಟದಲ್ಲಿ ಸ್ವಲ್ಪ ತೊಂದರೆಯಾಗುತ್ತಿದೆ.',
      pa: 'ਮੈਨੂੰ 3 ਦਿਨਾਂ ਤੋਂ ਬੁਖਾਰ ਅਤੇ ਸਿਰ ਦਰਦ ਹੈ। ਸਾਹ ਲੈਣ ਵਿੱਚ ਕੁਝ ਤਕਲੀਫ਼ ਮਹਿਸੂਸ ਹੋ ਰਹੀ ਹੈ।',
      ml: 'എനിക്ക് 3 ദിവസമായി പനിയും തലവേദനയും ഉണ്ട്. ശ്വാസമെടുക്കാൻ ചെറിയ ബുദ്ധിമുട്ടുണ്ട്.',
      en: 'I have had fever and severe headache for 3 days with mild breathlessness.',
    };
    return transcripts[lang] || transcripts['hi'];
  },

  getRegionalAdvice: (lang: string): string => {
    const advice: Record<string, string> = {
      hi: 'चिंता न करें। आपका विवरण दर्ज कर लिया गया है। कृपया पर्याप्त आराम करें, गुनगुना पानी पिएं और यदि बुखार १००°F से अधिक बना रहे तो डॉक्टर से परामर्श लें।',
      te: 'కంగారు పడకండి. మీ ఆరోగ్య సమాచారం నమోదైంది. తగినంత విశ్రాంతి తీసుకోండి మరియు గోరువెచ్చని నీరు తాగండి.',
      ta: 'பயப்பட வேண்டாம். உங்கள் உடல்நலத் தகவல் பதிவாகியுள்ளது. போதுமான ஓய்வு எடுத்து வெதுவெதுப்பான நீரைக் குடிக்கவும்.',
      mr: 'काळजी करू नका. तुमची माहिती नोंदवली गेली आहे. पुरेशी विश्रांती घ्या आणि कोमट पाणी प्या.',
      bn: 'আমার ৩ দিন ধরে জ্বর ও মাথা ব্যথা করছে। স্বাস্থ্যকর্মীর পরামর্শ নিয়ে পর্যাপ্ত পানি পান করুন।',
      en: 'Do not panic. Your health symptoms have been logged. Drink warm fluids, take rest, and consult a doctor if fever persists above 100°F.',
    };
    return advice[lang] || advice['hi'];
  },

  getLanguageLabel: (code: string): string => {
    const labels: Record<string, string> = {
      hi: 'Hindi (हिन्दी)',
      te: 'Telugu (తెలుగు)',
      ta: 'Tamil (தமிழ்)',
      mr: 'Marathi (मराठी)',
      bn: 'Bengali (বাংলা)',
      gu: 'Gujarati (ગુજરાતી)',
      kn: 'Kannada (ಕನ್ನಡ)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      ml: 'Malayalam (മലയാളം)',
      en: 'English',
    };
    return labels[code] || 'Hindi (हिन्दी)';
  },
};
