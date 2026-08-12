import axios from 'axios';
import { EmergencyAssessmentPayload, EmergencyAssessmentResult } from '../types/emergency';

const API_ENDPOINT = '/api/v1/ai/emergency-assess';

export const emergencyService = {
  /**
   * Submit rapid emergency intake data and photo for Gemini AI analysis
   */
  assessEmergency: async (payload: EmergencyAssessmentPayload): Promise<EmergencyAssessmentResult> => {
    const response = await axios.post(API_ENDPOINT, payload);
    return response.data.data;
  },
};
