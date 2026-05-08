import type { ProviderCategory } from '../types';

export type ClinicalStatus = 'Normal' | 'Attention Required' | 'Critical' | 'Pending Review' | 'Verified';

export type MedicalFieldType = 'number' | 'text' | 'textarea' | 'select' | 'chips' | 'boolean';

export interface MedicalField {
  id: string;
  label: string;
  type: MedicalFieldType;
  group: string;
  required?: boolean;
  unit?: string;
  placeholder?: string;
  options?: string[];
  normalRange?: string;
  statusSensitive?: boolean;
}

export interface MedicalModuleSchema {
  id: string;
  title: string;
  providerCategory: ProviderCategory;
  allowAttachments: boolean;
  defaultStatus: ClinicalStatus;
  fields: MedicalField[];
}

const repeatedClinicalFields = (group = 'Clinical Review'): MedicalField[] => [
  {
    id: 'clinical_status',
    label: 'Clinical Status',
    type: 'select',
    group,
    required: true,
    options: ['Normal', 'Attention Required', 'Critical', 'Pending Review', 'Verified'],
  },
  {
    id: 'findings',
    label: 'Findings',
    type: 'textarea',
    group,
    placeholder: 'Key clinical findings',
  },
  {
    id: 'interpretation',
    label: 'Interpretation',
    type: 'textarea',
    group,
    placeholder: 'Clinical interpretation',
  },
  {
    id: 'doctor_remarks',
    label: 'Doctor Remarks',
    type: 'textarea',
    group,
    placeholder: 'Remarks for report or follow-up',
  },
  {
    id: 'follow_up',
    label: 'Follow-up Recommendation',
    type: 'select',
    group,
    options: ['None', 'Lifestyle Advice', 'Repeat Test', 'Physician Review', 'Specialist Referral', 'Urgent Referral'],
  },
];

export const medicalModules: MedicalModuleSchema[] = [
  {
    id: 'vitals',
    title: 'Vitals',
    providerCategory: 'instant',
    allowAttachments: true,
    defaultStatus: 'Pending Review',
    fields: [
      { id: 'bp_systolic', label: 'BP Systolic', type: 'number', group: 'Blood Pressure', required: true, unit: 'mmHg', normalRange: '90-120', statusSensitive: true },
      { id: 'bp_diastolic', label: 'BP Diastolic', type: 'number', group: 'Blood Pressure', required: true, unit: 'mmHg', normalRange: '60-80', statusSensitive: true },
      { id: 'pulse_rate', label: 'Pulse Rate', type: 'number', group: 'Vitals', required: true, unit: 'bpm', normalRange: '60-100', statusSensitive: true },
      { id: 'temperature', label: 'Temperature', type: 'number', group: 'Vitals', unit: 'F', normalRange: '97-99' },
      { id: 'oxygen_saturation', label: 'Oxygen Saturation', type: 'number', group: 'Vitals', unit: '%', normalRange: '95-100', statusSensitive: true },
      { id: 'height', label: 'Height', type: 'number', group: 'Anthropometry', required: true, unit: 'cm' },
      { id: 'weight', label: 'Weight', type: 'number', group: 'Anthropometry', required: true, unit: 'kg' },
      { id: 'bmi', label: 'BMI', type: 'number', group: 'Anthropometry', unit: 'kg/m2', normalRange: '18.5-24.9', statusSensitive: true },
      { id: 'risk_indicator', label: 'Risk Indicator', type: 'chips', group: 'Clinical Review', options: ['Normal', 'Elevated BP', 'Hypoxia', 'Fever', 'Obesity', 'Underweight'] },
      { id: 'clinical_observation', label: 'Clinical Observation', type: 'textarea', group: 'Clinical Review' },
      ...repeatedClinicalFields('Clinical Review'),
    ],
  },
  {
    id: 'blood',
    title: 'Blood Test',
    providerCategory: 'blood',
    allowAttachments: true,
    defaultStatus: 'Pending Review',
    fields: [
      { id: 'hemoglobin', label: 'Hemoglobin', type: 'number', group: 'CBC', required: true, unit: 'g/dL', normalRange: '12-16', statusSensitive: true },
      { id: 'rbc', label: 'RBC', type: 'number', group: 'CBC', required: true, unit: 'million/uL', normalRange: '4.2-5.9', statusSensitive: true },
      { id: 'wbc', label: 'WBC', type: 'number', group: 'CBC', required: true, unit: 'cells/uL', normalRange: '4000-11000', statusSensitive: true },
      { id: 'platelets', label: 'Platelets', type: 'number', group: 'CBC', required: true, unit: 'lakh/uL', normalRange: '1.5-4.5', statusSensitive: true },
      { id: 'hematocrit', label: 'Hematocrit', type: 'number', group: 'Indices', unit: '%', normalRange: '36-48' },
      { id: 'mcv', label: 'MCV', type: 'number', group: 'Indices', unit: 'fL', normalRange: '80-100' },
      { id: 'mch', label: 'MCH', type: 'number', group: 'Indices', unit: 'pg', normalRange: '27-33' },
      { id: 'mchc', label: 'MCHC', type: 'number', group: 'Indices', unit: 'g/dL', normalRange: '32-36' },
      { id: 'differential_counts', label: 'Differential Counts', type: 'textarea', group: 'Differential', placeholder: 'Neutrophils, lymphocytes, eosinophils...' },
      { id: 'range_indicator', label: 'Range Indicator', type: 'chips', group: 'Clinical Review', options: ['Within Range', 'Low', 'High', 'Borderline', 'Repeat Suggested'] },
      { id: 'critical_flag', label: 'Critical Flag', type: 'select', group: 'Clinical Review', options: ['No', 'Yes - Notify Physician', 'Yes - Urgent Referral'] },
      { id: 'pathologist_remarks', label: 'Pathologist Remarks', type: 'textarea', group: 'Clinical Review' },
      ...repeatedClinicalFields('Clinical Review'),
    ],
  },
  {
    id: 'ecg',
    title: 'ECG',
    providerCategory: 'ecg',
    allowAttachments: true,
    defaultStatus: 'Pending Review',
    fields: [
      { id: 'heart_rate', label: 'Heart Rate', type: 'number', group: 'ECG Measurements', required: true, unit: 'bpm', normalRange: '60-100', statusSensitive: true },
      { id: 'rhythm', label: 'Rhythm', type: 'select', group: 'ECG Measurements', required: true, options: ['Sinus Rhythm', 'Sinus Bradycardia', 'Sinus Tachycardia', 'Atrial Fibrillation', 'Irregular Rhythm'] },
      { id: 'qt_interval', label: 'QT Interval', type: 'number', group: 'ECG Measurements', unit: 'ms' },
      { id: 'abnormality_detection', label: 'Abnormality Detection', type: 'chips', group: 'Interpretation', options: ['None', 'ST-T Changes', 'LVH', 'Arrhythmia', 'Conduction Delay', 'Ischemic Changes'] },
      { id: 'doctor_impression', label: 'Doctor Impression', type: 'textarea', group: 'Interpretation', required: true },
      { id: 'recommendation', label: 'Recommendation', type: 'select', group: 'Interpretation', options: ['Normal', 'Repeat ECG', 'Cardiology Review', 'Urgent Referral'] },
      { id: 'cardiologist_remarks', label: 'Cardiologist Remarks', type: 'textarea', group: 'Clinical Review' },
      ...repeatedClinicalFields('Clinical Review'),
    ],
  },
  {
    id: 'vision',
    title: 'Vision',
    providerCategory: 'instant',
    allowAttachments: true,
    defaultStatus: 'Pending Review',
    fields: [
      { id: 'left_eye', label: 'Left Eye', type: 'text', group: 'Acuity', required: true, placeholder: '6/6' },
      { id: 'right_eye', label: 'Right Eye', type: 'text', group: 'Acuity', required: true, placeholder: '6/6' },
      { id: 'lens_power', label: 'Lens Power', type: 'text', group: 'Refraction' },
      { id: 'color_blindness', label: 'Color Blindness', type: 'select', group: 'Screening', options: ['No', 'Yes', 'Inconclusive'] },
      { id: 'near_far_vision', label: 'Near/Far Vision', type: 'chips', group: 'Screening', options: ['Near Normal', 'Near Reduced', 'Far Normal', 'Far Reduced'] },
      { id: 'observation', label: 'Observation', type: 'textarea', group: 'Clinical Review' },
      { id: 'recommendation', label: 'Recommendation', type: 'select', group: 'Clinical Review', options: ['No Action', 'Corrective Lens', 'Ophthalmology Referral', 'Repeat Screening'] },
      ...repeatedClinicalFields('Clinical Review'),
    ],
  },
  {
    id: 'hearing',
    title: 'Hearing',
    providerCategory: 'instant',
    allowAttachments: true,
    defaultStatus: 'Pending Review',
    fields: [
      { id: 'left_ear', label: 'Left Ear', type: 'select', group: 'Audiometry', required: true, options: ['Normal', 'Mild Loss', 'Moderate Loss', 'Severe Loss', 'Refer'] },
      { id: 'right_ear', label: 'Right Ear', type: 'select', group: 'Audiometry', required: true, options: ['Normal', 'Mild Loss', 'Moderate Loss', 'Severe Loss', 'Refer'] },
      { id: 'frequency_response', label: 'Frequency Response', type: 'textarea', group: 'Audiometry' },
      { id: 'hearing_loss_indicator', label: 'Hearing Loss Indicator', type: 'chips', group: 'Clinical Review', options: ['None', 'Left', 'Right', 'Bilateral', 'Noise Exposure'] },
      { id: 'ent_remarks', label: 'ENT Remarks', type: 'textarea', group: 'Clinical Review' },
      ...repeatedClinicalFields('Clinical Review'),
    ],
  },
  {
    id: 'radiology',
    title: 'X-Ray / Radiology',
    providerCategory: 'radiology',
    allowAttachments: true,
    defaultStatus: 'Pending Review',
    fields: [
      { id: 'test_type', label: 'Test Type', type: 'select', group: 'Study', required: true, options: ['X-Ray', 'Ultrasound', 'Other Radiology'] },
      { id: 'body_area', label: 'Body Area', type: 'text', group: 'Study', required: true, placeholder: 'Chest PA, Spine, Knee...' },
      { id: 'observation', label: 'Observation', type: 'textarea', group: 'Radiology Report', required: true },
      { id: 'impression', label: 'Impression', type: 'textarea', group: 'Radiology Report', required: true },
      { id: 'radiologist_remarks', label: 'Radiologist Remarks', type: 'textarea', group: 'Clinical Review' },
      ...repeatedClinicalFields('Clinical Review'),
    ],
  },
  {
    id: 'dental',
    title: 'Dental Checkup',
    providerCategory: 'instant',
    allowAttachments: true,
    defaultStatus: 'Pending Review',
    fields: [
      { id: 'tooth_condition', label: 'Tooth Condition', type: 'chips', group: 'Oral Exam', options: ['Normal', 'Staining', 'Missing Tooth', 'Sensitivity', 'Malocclusion'] },
      { id: 'gum_health', label: 'Gum Health', type: 'select', group: 'Oral Exam', options: ['Healthy', 'Mild Gingivitis', 'Bleeding', 'Periodontal Concern'] },
      { id: 'cavities', label: 'Cavities', type: 'select', group: 'Oral Exam', options: ['None', 'Suspected', 'Confirmed', 'Multiple'] },
      { id: 'cleaning_required', label: 'Cleaning Required', type: 'select', group: 'Plan', options: ['No', 'Yes', 'Urgent'] },
      { id: 'dentist_remarks', label: 'Dentist Remarks', type: 'textarea', group: 'Clinical Review' },
      ...repeatedClinicalFields('Clinical Review'),
    ],
  },
  {
    id: 'physician_assessment',
    title: 'General Physician Assessment',
    providerCategory: 'instant',
    allowAttachments: true,
    defaultStatus: 'Pending Review',
    fields: [
      { id: 'symptoms', label: 'Symptoms', type: 'textarea', group: 'History', placeholder: 'Current symptoms' },
      { id: 'medical_history', label: 'Medical History', type: 'textarea', group: 'History' },
      { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', group: 'Assessment', required: true },
      { id: 'risk_category', label: 'Risk Category', type: 'select', group: 'Assessment', required: true, options: ['Low', 'Moderate', 'High', 'Critical'] },
      { id: 'prescription_notes', label: 'Prescription Notes', type: 'textarea', group: 'Plan' },
      { id: 'recommendations', label: 'Recommendations', type: 'textarea', group: 'Plan' },
      { id: 'follow_up_required', label: 'Follow-up Required', type: 'select', group: 'Plan', options: ['No', 'Yes - Routine', 'Yes - Specialist', 'Yes - Urgent'] },
      ...repeatedClinicalFields('Clinical Review'),
    ],
  },
];
