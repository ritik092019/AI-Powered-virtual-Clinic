import { AIAssessment, RiskAssessment, ProtocolGuidance, Consultation, VitalSigns } from '../types';

export interface ComprehensiveAIResult {
  assessment: AIAssessment;
  risk: RiskAssessment;
  protocolGuidance?: ProtocolGuidance;
  missingInformation: string[];
}

export const aiService = {
  /**
   * Evaluates consultation clinical data to produce structured AI preliminary assessment,
   * risk rationale, missing information analysis, and protocol guidance.
   */
  async evaluateConsultation(
    consultation: Partial<Consultation>,
    options?: { simulateError?: boolean }
  ): Promise<ComprehensiveAIResult> {
    // Artificial latency for async AI evaluation
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (options?.simulateError) {
      throw new Error('AI Engine service unavailable. Offline or model server timeout.');
    }

    const chiefComplaint = consultation.chiefComplaint || '';
    const vitals: Partial<VitalSigns> = consultation.vitals || {};
    const symptoms = consultation.symptoms || [];
    const priority = consultation.priority || 'routine';

    // Check for high-risk / emergency indicators in complaint or vitals
    const isChestPain =
      chiefComplaint.toLowerCase().includes('chest') ||
      symptoms.some((s) => s.name.toLowerCase().includes('chest'));
    const isHighFever =
      (vitals.tempFahrenheit && vitals.tempFahrenheit >= 102) ||
      symptoms.some((s) => s.name.toLowerCase().includes('fever') && s.severity === 'severe');
    const isHypoxia = vitals.spo2Percentage !== undefined && vitals.spo2Percentage < 94;
    const isSevereHypertension = vitals.bpSystolic !== undefined && vitals.bpSystolic >= 145;

    // Build Missing Information checklist
    const missingInformation: string[] = [];
    if (!vitals.bloodGlucoseMgDl) {
      missingInformation.push('Random Blood Glucose reading missing - recommended for diabetes differential.');
    }
    if (!vitals.spo2Percentage) {
      missingInformation.push('Pulse Oximetry (SpO2%) reading missing - essential for respiratory cases.');
    }
    if (!consultation.documents || consultation.documents.length === 0) {
      missingInformation.push('No recent diagnostic lab reports or prescriptions attached to intake file.');
    }
    if (!consultation.confirmedMedications || consultation.confirmedMedications.length === 0) {
      if (!consultation.notes?.includes('No current meds')) {
        missingInformation.push('Current medication adherence status unconfirmed by health worker.');
      }
    }

    // High Priority / Emergency Case
    if (isChestPain || (isHypoxia && isSevereHypertension) || priority === 'emergency') {
      return {
        assessment: {
          id: `ai_eval_${Date.now()}`,
          consultationId: consultation.id || 'CNS-TEMP',
          summary:
            'Preliminary AI Assessment: Clinical presentation indicates acute cardiopulmonary distress. Symptoms of chest tightness with accompanying elevated systolic blood pressure and lowered oxygen saturation warrant urgent specialist evaluation.',
          suspectedConditions: [
            { name: 'Acute Coronary Syndrome (ACS) / Angina', probability: 82, urgency: 'emergency' },
            { name: 'Hypertensive Urgency with Myocardial Strain', probability: 68, urgency: 'high' },
            { name: 'Acute Pulmonary Embolism (Differential)', probability: 45, urgency: 'high' },
          ],
          recommendedTriage: 'district_hospital',
          flags: [
            'CRITICAL VITAL: Oxygen Saturation 91% (Hypoxia)',
            'ALERT: Systolic Blood Pressure 150 mmHg',
            'SYMPTOM RED FLAG: Acute chest pain radiating to left shoulder',
          ],
          missingInformation,
          generatedAt: new Date().toISOString(),
        },
        risk: {
          level: 'immediate_evaluation',
          label: 'Immediate Professional Evaluation',
          rationale:
            'Combination of acute chest tightness, diaphoresis, sub-optimal oxygen saturation (91%), and elevated systolic blood pressure (150 mmHg). High risk for myocardial or cardiac events in patient with existing hypertension.',
          recommendedNextStep:
            'Initiate tele-doctor emergency escalation immediately. Prepare district hospital ambulance transport. Follow local emergency ACS protocol.',
          escalationRequired: true,
          escalationReason:
            'Acute chest tightness with hypoxia (SpO2 91%) and severe hypertension (BP 150/95 mmHg). Requires immediate physician oversight.',
          flags: [
            'Red-flag symptom pattern (Chest Pain + Radiation)',
            'Sub-optimal SpO2 (<94%)',
            'Severe Systolic BP elevation',
          ],
        },
        missingInformation,
      };
    }

    // Moderate / High Risk Case (e.g. Pneumonia / High Fever)
    if (isHighFever || isHypoxia || priority === 'urgent') {
      return {
        assessment: {
          id: `ai_eval_${Date.now()}`,
          consultationId: consultation.id || 'CNS-TEMP',
          summary:
            'Preliminary AI Assessment: Clinical findings align with acute lower respiratory tract infection. High body temperature combined with tachypnea and productive cough requires prompt medical officer authorization for diagnostic workup and antibiotic therapy.',
          suspectedConditions: [
            { name: 'Community-Acquired Pneumonia (CAP)', probability: 78, urgency: 'high' },
            { name: 'Acute Severe Bronchitis with Bronchospasm', probability: 62, urgency: 'moderate' },
            { name: 'Pulmonary Tuberculosis (Differential)', probability: 35, urgency: 'moderate' },
          ],
          recommendedTriage: 'primary_health_center',
          flags: [
            'FEVER RED FLAG: Temperature 102.4°F with chills',
            'RESPIRATORY ALERT: Tachypnea (Respiratory Rate 26 breaths/min)',
            'SpO2 Saturation: 93% (Borderline)',
          ],
          missingInformation,
          generatedAt: new Date().toISOString(),
        },
        risk: {
          level: 'high',
          label: 'High Priority',
          rationale:
            'High fever (102.4°F) accompanied by tachypnea (26 breaths/min) and borderline SpO2 (93%) in a patient with history of bronchial asthma indicates high risk of acute respiratory decompensation.',
          recommendedNextStep:
            'Request remote tele-doctor authorization for empiric antibiotic prescription and nebulization protocol. Arrange transportation to PHC if fever persists.',
          escalationRequired: true,
          escalationReason:
            'High-grade fever (102.4°F) with tachypnea and asthma history. Medical officer prescription authorization needed.',
          flags: ['High-grade fever', 'Tachypnea', 'Borderline SpO2'],
        },
        missingInformation,
      };
    }

    // Low Risk / Routine Case
    return {
      assessment: {
        id: `ai_eval_${Date.now()}`,
        consultationId: consultation.id || 'CNS-TEMP',
        summary:
          'Preliminary AI Assessment: Clinical presentation indicates stable, low-acuity symptoms. Vitals remain within age-appropriate baseline limits without acute systemic decompensation flags.',
        suspectedConditions: [
          { name: 'Mild Musculoskeletal Joint Strain / Osteoarthritis', probability: 75, urgency: 'low' },
          { name: 'Routine Controlled Essential Hypertension', probability: 70, urgency: 'low' },
        ],
        recommendedTriage: 'home_care',
        flags: ['Routine health monitoring', 'No acute red flags detected'],
        missingInformation,
        generatedAt: new Date().toISOString(),
      },
      risk: {
        level: 'low',
        label: 'Low Priority',
        rationale:
          'Vital signs are stable (BP 132/84, SpO2 98%, Temp 98.2°F). Reported mild joint discomfort and dizziness are consistent with known medical history without red-flag neurological or cardiovascular signs.',
        recommendedNextStep:
          'Provide protocol-based home care guidance and continue existing maintenance medications. Schedule routine follow-up in 7 days.',
        escalationRequired: false,
        flags: [],
      },
      protocolGuidance: {
        id: 'proto_low_01',
        title: 'Protocol-Based Home Care Guidance for Mild Musculoskeletal / Routine Monitoring',
        whatToDo: [
          'Maintain adequate daily hydration (2.5 - 3 Liters of clean drinking water).',
          'Continue taking prescribed daily antihypertensive (Amlodipine 5mg) without skipping doses.',
          'Apply warm compress to affected knee joints for 15-20 minutes twice daily.',
          'Perform gentle joint range-of-motion exercises as tolerated.',
        ],
        whatToAvoid: [
          'Avoid unprescribed self-medication with strong NSAIDs or steroids.',
          'Avoid sudden posture changes (sit upright for 30 seconds before standing to prevent orthostatic dizziness).',
          'Avoid strenuous heavy lifting or prolonged standing.',
        ],
        whatToMonitor: [
          'Check blood pressure at Sub-Health Centre twice weekly.',
          'Monitor for any new swelling, warmth, or redness in joints.',
          'Track morning fasting blood glucose levels once a week.',
        ],
        warningSigns: [
          'Sudden chest tightness or shortness of breath.',
          'Severe headache accompanied by blurred vision or vomiting.',
          'Inability to bear weight on knee joint or severe swelling.',
        ],
        whenToSeekHelp: [
          'If blood pressure exceeds 160/100 mmHg on two consecutive readings.',
          'If dizziness persists continuously or leads to loss of balance.',
          'If any new fever (>100.4°F) develops.',
        ],
        disclaimer:
          'Protocol-Based Guidance for Demonstration Only. This automated guidance does not constitute a formal medical prescription and must be validated by a certified health practitioner if symptoms worsen.',
      },
      missingInformation,
    };
  },
};
