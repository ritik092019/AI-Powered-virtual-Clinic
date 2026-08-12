export interface TranscribeResult {
  rawTranscript: string;
  translatedEnglish: string;
  confidence: number;
  detectedLanguage: string;
}

const MOCK_TRANSCRIPTS: Record<string, { raw: string; translated: string }> = {
  hi: {
    raw: 'मरीज़ को पिछले ३ दिनों से तेज़ बुखार और सूखी खाँसी है। शाम को ठंड लगती है और साँस फूलती है।',
    translated: 'Patient has high fever and dry cough for the last 3 days. Feels chills in the evening and breathlessness.',
  },
  ch: {
    raw: 'मरीज ला तीन दिन ले बहुत तेज बुखार अव कांसी आवत हे। साँस लेवे बर तकलीफ होत हे।',
    translated: 'Patient has high fever and cough for three days. Difficulty in breathing.',
  },
  bn: {
    raw: 'রোগীর গত ৩ দিন ধরে তীব্র জ্বর ও কাশি রয়েছে। রাতে বুক ধড়ফড় ও শ্বাসকষ্ট হচ্ছে।',
    translated: 'Patient has severe fever and cough for last 3 days. Chest tightness and shortness of breath at night.',
  },
  or: {
    raw: 'ରୋଗୀଙ୍କୁ ଗତ ୩ ଦିନ ଧରି ପ୍ରବଳ ଜ୍ୱର ଏବଂ କାଶ ହେଉଛି। ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ ଅନୁଭବ ହେଉଛି।',
    translated: 'Patient has high fever and cough for the last 3 days. Experiencing breathing difficulty.',
  },
  gon: {
    raw: 'मरीज को ३ दिना से जोर ज्वर अउर खोकी आय। श्वास दीत लेवे म दिक्कत होत आय।',
    translated: 'Patient has high fever and cough for 3 days. Having trouble taking deep breaths.',
  },
  en: {
    raw: 'Patient reports severe headache, high body temperature for 3 days, and mild chest tightness when walking.',
    translated: 'Patient reports severe headache, high body temperature for 3 days, and mild chest tightness when walking.',
  },
};

export const speechService = {
  async simulateTranscription(languageCode: string = 'hi', forceFail: boolean = false): Promise<TranscribeResult> {
    // Simulate speech-to-text API processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (forceFail) {
      throw new Error('Speech processing engine timed out. Poor microphone connection.');
    }

    const mock = MOCK_TRANSCRIPTS[languageCode] || MOCK_TRANSCRIPTS['hi'];
    return {
      rawTranscript: mock.raw,
      translatedEnglish: mock.translated,
      confidence: 0.94,
      detectedLanguage: languageCode,
    };
  },
};
