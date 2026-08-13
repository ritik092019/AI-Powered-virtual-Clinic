export interface TranslationStrings {
  title: string;
  subtitle: string;
  selectLanguage: string;
  voiceInputLabel: string;
  speakPrompt: string;
  listening: string;
  stopListening: string;
  startVoiceInput: string;
  transcriptLabel: string;
  transcriptPlaceholder: string;
  symptomDetails: string;
  durationLabel: string;
  severityLabel: string;
  patientDetails: string;
  ageLabel: string;
  conditionsLabel: string;
  allergiesLabel: string;
  medicationsLabel: string;
  vitalsLabel: string;
  tempLabel: string;
  spo2Label: string;
  bpLabel: string;
  consultationType: string;
  teleConsultation: string;
  subCenterVisit: string;
  preferredDate: string;
  preferredTime: string;
  reviewConfirm: string;
  confirmTitle: string;
  submitButton: string;
  submitting: string;
  cancelButton: string;
  activeErrorTitle: string;
  queuedTitle: string;
  assignedTitle: string;
  confirmedTitle: string;
  joinVideoCall: string;
}

export const APPOINTMENT_TRANSLATIONS: Record<string, TranslationStrings> = {
  English: {
    title: "Request Smart Doctor Appointment",
    subtitle: "Speak or type symptoms in your native language for AI auto-matching",
    selectLanguage: "Select Language / भाषा चुनें / भाषा निवडा",
    voiceInputLabel: "Voice Symptom Intake",
    speakPrompt: "Click microphone and describe your symptoms clearly...",
    listening: "Listening... Speak your symptoms now",
    stopListening: "Stop Recording",
    startVoiceInput: "Tap to Speak Symptoms",
    transcriptLabel: "Editable Voice Transcript (Review & Edit Before Submission)",
    transcriptPlaceholder: "Your spoken symptoms will appear here. You can edit them manually...",
    symptomDetails: "Symptom Duration & Severity",
    durationLabel: "How long have you had symptoms?",
    severityLabel: "Symptom Severity",
    patientDetails: "Patient Medical Context",
    ageLabel: "Age (Years)",
    conditionsLabel: "Existing Conditions (e.g. Diabetes, BP)",
    allergiesLabel: "Known Allergies",
    medicationsLabel: "Current Medications",
    vitalsLabel: "Vitals (Optional)",
    tempLabel: "Temperature (°F)",
    spo2Label: "SpO2 (%)",
    bpLabel: "Blood Pressure (mmHg)",
    consultationType: "Consultation Mode",
    teleConsultation: "Tele-Doctor Video Call",
    subCenterVisit: "Sub-Center Clinic Visit",
    preferredDate: "Preferred Date",
    preferredTime: "Preferred Time Slot",
    reviewConfirm: "Review & Confirm Details",
    confirmTitle: "Please review your appointment summary before submitting:",
    submitButton: "Submit Appointment & Auto-Match Doctor",
    submitting: "Classifying Specialty & Auto-Matching Doctor...",
    cancelButton: "Cancel",
    activeErrorTitle: "Active Appointment Exists",
    queuedTitle: "Placed in Priority Queue",
    assignedTitle: "Doctor Assigned!",
    confirmedTitle: "Appointment Confirmed",
    joinVideoCall: "Join WebRTC Video Call",
  },
  Hindi: {
    title: "स्मार्ट डॉक्टर अपॉइंटमेंट का अनुरोध करें",
    subtitle: "एआई ऑटो-मैचिंग के लिए अपनी भाषा में लक्षण बोलें या लिखें",
    selectLanguage: "भाषा चुनें (Select Language)",
    voiceInputLabel: "वॉयस लक्षण इनपुट",
    speakPrompt: "माइक पर क्लिक करें और अपने लक्षणों का वर्णन करें...",
    listening: "सुन रहे हैं... अब अपने लक्षण बोलें",
    stopListening: "रिकॉर्डिंग रोकें",
    startVoiceInput: "लक्षण बोलने के लिए टैप करें",
    transcriptLabel: "संपादनीय वॉयस ट्रांसक्रिप्ट (समीक्षा करें और बदलें)",
    transcriptPlaceholder: "आपके द्वारा बोले गए लक्षण यहाँ दिखाई देंगे। आप इन्हें बदल सकते हैं...",
    symptomDetails: "लक्षणों की अवधि और गंभीरता",
    durationLabel: "आपको कितने दिनों से लक्षण हैं?",
    severityLabel: "लक्षणों की गंभीरता",
    patientDetails: "मरीज की स्वास्थ्य जानकारी",
    ageLabel: "आयु (वर्ष)",
    conditionsLabel: "मौजूदा बीमारियां (जैसे शुगर, बीपी)",
    allergiesLabel: "एलर्जी",
    medicationsLabel: "वर्तमान दवाएं",
    vitalsLabel: "वाइटल्स (वैकल्पिक)",
    tempLabel: "तापमान (°F)",
    spo2Label: "SpO2 (%)",
    bpLabel: "ब्लड प्रेशर (mmHg)",
    consultationType: "परामर्श का प्रकार",
    teleConsultation: "टेली-डॉक्टर वीडियो कॉल",
    subCenterVisit: "सब-सेंटर क्लिनिक यात्रा",
    preferredDate: "पसंदीदा तारीख",
    preferredTime: "पसंदीदा समय",
    reviewConfirm: "समीक्षा करें और पुष्टि करें",
    confirmTitle: "कृपया सबमिट करने से पहले अपने विवरण की जांच करें:",
    submitButton: "अपॉइंटमेंट सबमिट करें और डॉक्टर मैच करें",
    submitting: "विशेषज्ञता का वर्गीकरण और डॉक्टर मैचिंग जारी है...",
    cancelButton: "रद्द करें",
    activeErrorTitle: "सक्रिय अपॉइंटमेंट मौजूद है",
    queuedTitle: "प्रतीक्षा सूची में रखा गया",
    assignedTitle: "डॉक्टर आवंटित किए गए!",
    confirmedTitle: "अपॉइंटमेंट की पुष्टि हो गई",
    joinVideoCall: "वेब-आरटीसी वीडियो कॉल से जुड़ें",
  },
  Telugu: {
    title: "స్మార్ట్ డాక్టర్ అపాయింట్‌మెంట్ అభ్యర్థించండి",
    subtitle: "AI ఆటో-మాచింగ్ కోసం మీ భాషలో లక్షణాలను మాట్లాడండి లేదా టైప్ చేయండి",
    selectLanguage: "భాషను ఎంచుకోండి (Select Language)",
    voiceInputLabel: "వాయిస్ ద్వారా లక్షణాలు నమోదు చేయండి",
    speakPrompt: "మైక్‌పై క్లిక్ చేసి మీ లక్షణాలను స్పష్టంగా చెప్పండి...",
    listening: "వింటున్నాము... ఇప్పుడు మాట్లాడండి",
    stopListening: "రికార్డింగ్ ఆపండి",
    startVoiceInput: "మాట్లాడటానికి ఇక్కడ నొక్కండి",
    transcriptLabel: "వాయిస్ స్క్రిప్ట్ (సమీక్షించండి మరియు సవరించండి)",
    transcriptPlaceholder: "మీరు చెప్పిన లక్షణాలు ఇక్కడ కనిపిస్తాయి...",
    symptomDetails: "లక్షణాల వ్యవధి మరియు తీవ్రత",
    durationLabel: "ఎన్ని రోజుల నుండి ఈ లక్షణాలు ఉన్నాయి?",
    severityLabel: "తీవ్రత",
    patientDetails: "రోగి ఆరోగ్య వివరాలు",
    ageLabel: "వయస్సు (సంవత్సరాలు)",
    conditionsLabel: "ప్రస్తుత వ్యాధులు (షుగర్, బిపి)",
    allergiesLabel: "అలర్జీలు",
    medicationsLabel: "వాడుతున్న మందులు",
    vitalsLabel: "వైటల్స్ (ఐచ్ఛికం)",
    tempLabel: "ఉష్ణోగ్రత (°F)",
    spo2Label: "SpO2 (%)",
    bpLabel: "బ్లడ్ ప్రెజర్ (mmHg)",
    consultationType: "సంప్రదింపు విధానం",
    teleConsultation: "టెలి-డాక్టర్ వీడియో కాల్",
    subCenterVisit: "సబ్‌-సెంటర్ క్లినిక్ పర్యటన",
    preferredDate: "తేదీ",
    preferredTime: "సమయం",
    reviewConfirm: "సమీక్షించండి & నిర్ధారించండి",
    confirmTitle: "సబ్‌మిట్ చేసే ముందు వివరాలను ఒకసారి తనిఖీ చేయండి:",
    submitButton: "అపాయింట్‌మెంట్ సబ్‌మిట్ చేయండి",
    submitting: "డాక్టర్‌ను మ్యాచ్ చేస్తున్నాము...",
    cancelButton: "రద్దు చేయండి",
    activeErrorTitle: "యాక్టివ్ అపాయింట్‌మెంట్ ఉంది",
    queuedTitle: "వెయిటింగ్ లిస్ట్‌లో ఉంది",
    assignedTitle: "డాక్టర్ కేటాయించబడ్డారు!",
    confirmedTitle: "అపాయింట్‌మెంట్ ఖరారైంది",
    joinVideoCall: "వీడియో కాల్‌లో చేరండి",
  },
  Tamil: {
    title: "ஸ்மார்ட் மருத்துவர் முன்பதிவு கோரிக்கை",
    subtitle: "AI மருத்துவர் ஒதுக்கீட்டிற்கு உங்கள் மொழியில் பேசவும் அல்லது தட்டச்சு செய்யவும்",
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
    voiceInputLabel: "குரல் மூலம் அறிகுறிகள் பதிவு",
    speakPrompt: "மைக்கை கிளிக் செய்து அறிகுறிகளை கூறவும்...",
    listening: "கேட்கிறது... இப்போது பேசவும்",
    stopListening: "பதிவை நிறுத்து",
    startVoiceInput: "பேச தட்டவும்",
    transcriptLabel: "குரல் உரை (சரிபார்த்து திருத்தவும்)",
    transcriptPlaceholder: "நீங்கள் பேசிய அறிகுறிகள் இங்கு தோன்றும்...",
    symptomDetails: "அறிகுறி காலம் & தீவிரத்தன்மை",
    durationLabel: "எத்தனை நாட்களாக அறிகுறிகள் உள்ளன?",
    severityLabel: "தீவிரத்தன்மை",
    patientDetails: "நோயாளி மருத்துவ விவரங்கள்",
    ageLabel: "வயது",
    conditionsLabel: "தற்போதைய நோய்கள் (சர்க்கரை, பிபி)",
    allergiesLabel: "ஒவ்வாமைகள்",
    medicationsLabel: "தற்போதைய மருந்துகள்",
    vitalsLabel: "உடல் அளவீடுகள் (விருப்பத்தேர்வு)",
    tempLabel: "வெப்பநிலை (°F)",
    spo2Label: "SpO2 (%)",
    bpLabel: "ரத்த அழுத்தம் (mmHg)",
    consultationType: "ஆலோசனை முறை",
    teleConsultation: "டெலி-டாக்டர் வீடியோ அழைப்பு",
    subCenterVisit: "மையப் பிரிவு விசிட்",
    preferredDate: "விரும்பிய தேதி",
    preferredTime: "விரும்பிய நேரம்",
    reviewConfirm: "சரிபார்த்து உறுதிப்படுத்துக",
    confirmTitle: "சமர்ப்பிப்பதற்கு முன் விவரங்களைச் சரிபார்க்கவும்:",
    submitButton: "முன்பதிவைச் சமர்ப்பிக்கவும்",
    submitting: "மருத்துவர் ஒதுக்கீடு செய்யப்படுகிறது...",
    cancelButton: "ரத்து செய்",
    activeErrorTitle: "முன்பதிவு நிலுவையில் உள்ளது",
    queuedTitle: "வரிசையில் வைக்கப்பட்டுள்ளது",
    assignedTitle: "மருத்துவர் ஒதுக்கப்பட்டார்!",
    confirmedTitle: "முன்பதிவு உறுதி செய்யப்பட்டது",
    joinVideoCall: "வீடியோ அழைப்பில் இணையவும்",
  },
  Marathi: {
    title: "स्मार्ट डॉक्टर अपॉइंटमेंटची विनंती करा",
    subtitle: "AI ऑटो-मॅचिंगसाठी तुमच्या भाषेत लक्षणे बोला किंवा लिहा",
    selectLanguage: "भाषा निवडा (Select Language)",
    voiceInputLabel: "व्हॉइस लक्षण इनपुट",
    speakPrompt: "माईकवर क्लिक करा आणि लक्षणे सांगा...",
    listening: "ऐकत आहे... आता बोला",
    stopListening: "रेकॉर्डिंग थांबवा",
    startVoiceInput: "बोलण्यासाठी येथे टॅप करा",
    transcriptLabel: "व्हॉइस ट्रान्सक्रिप्ट (तपासा आणि बदला)",
    transcriptPlaceholder: "तुमची लक्षणे येथे दिसतील...",
    symptomDetails: "लक्षणांचा कालावधी आणि तीव्रतेचा स्तर",
    durationLabel: "किती दिवसांपासून लक्षणे आहेत?",
    severityLabel: "तीव्रता",
    patientDetails: "रुग्णाची वैद्यकीय माहिती",
    ageLabel: "वय (वर्षे)",
    conditionsLabel: "सध्याचे आजार (उदा. शुगर, बीपी)",
    allergiesLabel: "ॲलर्जी",
    medicationsLabel: "सध्याची औषधे",
    vitalsLabel: "वाइटल्स (ऐच्छिक)",
    tempLabel: "तापमान (°F)",
    spo2Label: "SpO2 (%)",
    bpLabel: "रक्तदाब (mmHg)",
    consultationType: "सल्लामसलत प्रकार",
    teleConsultation: "टेलि-डॉक्टर व्हिडिओ कॉल",
    subCenterVisit: "उपकेंद्र भेट",
    preferredDate: "पसंतीची तारीख",
    preferredTime: "पसंतीची वेळ",
    reviewConfirm: "तपासा आणि पुष्टी करा",
    confirmTitle: "सबमिट करण्यापूर्वी माहिती तपासा:",
    submitButton: "अपॉइंटमेंट सबमिट करा",
    submitting: "डॉक्टर मॅच करत आहोत...",
    cancelButton: "रद्द करा",
    activeErrorTitle: "सक्रिय अपॉइंटमेंट अस्तित्वात आहे",
    queuedTitle: "प्रतीक्षा यादीत ठेवले आहे",
    assignedTitle: "डॉक्टर नियुक्त केले!",
    confirmedTitle: "अपॉइंटमेंट निश्चित झाली",
    joinVideoCall: "व्हिडिओ कॉलला जोडा",
  },
};
