export interface Agent {
  id: string;
  name: string;
  mobile_number: string;
  provider_id?: string;
  provider_name?: string;
  role: string;
  is_active: boolean;
}

export interface Camp {
  id: string;
  company_name?: string;
  company_id?: string;
  name: string;
  organization_name?: string;
  provider_id: string;
  provider_name: string;
  provider_logo: string;
  company_logo?: string | null;
  start_date: string; // ISO format
  end_date: string;
  timing?: string;
  assigned_agent_count?: number;
  location: string;
  address?: string;
  notes?: string;
  status: 'active' | 'upcoming' | 'completed' | 'inprogress';
}

export interface User {
  id: string;
  customer_id?: string;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  age_label?: string;
  employee_id: string;
  mobile_number: string;
  email: string;
  company: string;
}

export interface Appointment {
  id: string;
  unique_id?: string;
  user_id: string;
  camp_id: string;
  provider_id: string;
  provider_name?: string;
  package_id: string;
  package_name?: string;
  booking_status: 'success' | 'failure' | 'pending';
  vendor_status?: string;
  appointment_state: 'booking_created' | 'sample_pending' | 'partial_completed' | 'processing';
  report_state: 'pending' | 'generated' | 'shared';
  created_by_agent_id: string;
  created_at: string;
  updated_at: string;
  appointment_date?: string;
  time?: string;
}

export interface PackageComponent {
  id: string;
  name: string;
  section: string;
  type: 'numeric' | 'text' | 'boolean' | 'options';
  options?: string[]; // If type is options
  unit?: string;
  input_mode?: 'sample' | 'instant' | 'attachment';
  provider_category?: ProviderCategory;
  required: boolean;
}

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
  defaultValue?: string;
  resultReceived?: boolean;
}

export interface MedicalModuleSchema {
  id: string;
  title: string;
  providerCategory: ProviderCategory;
  allowAttachments: boolean;
  defaultStatus: ClinicalStatus;
  fields: MedicalField[];
  sampleCollectionId?: string;
  appointmentTestId?: string;
  providerId?: string;
  collectionStatus?: SampleCollectionStatus;
  reportStatus?: ReportStatus;
  collectionStatusOptions?: SampleCollectionStatus[];
  reportStatusOptions?: ReportStatus[];
  providerName?: string;
  category?: string;
}

export interface Package {
  id: string;
  name: string;
  components: PackageComponent[];
}

export interface ComponentEntry {
  id: string;
  appointment_id?: string;
  temporary_local_id?: string;
  user_id: string;
  camp_id: string;
  package_component_id: string;
  section_name: string;
  values: Record<string, unknown>;
  status: 'draft_saved' | 'completed' | 'created' | 'needs_correction';
  saved_by: string;
  saved_at: string;
  last_modified_at: string;
}

export interface BookingFailure {
  id: string;
  local_reference_id: string;
  user_id: string;
  camp_id: string;
  provider_id: string;
  failure_reason: string;
  last_attempted_at: string;
  retry_count: number;
  preserved_component_entry_ids: string[];
}

export interface UserSearchResult {
  user: User;
  appointment?: Appointment;
  package?: Package;
  entries?: ComponentEntry[];
}

export type ProviderCategory = 'blood' | 'external_lab' | 'ecg' | 'radiology' | 'instant';

export interface HealthProvider {
  id: string;
  name: string;
  category: ProviderCategory;
  status: 'available' | 'busy' | 'offline';
}

export type SampleCollectionStatus =
  | 'Pending'
  | 'Sample Collected'
  | 'Sent to Lab'
  | 'Processing'
  | 'Report Received'
  | 'Created'
  | 'Uploaded'
  | 'Completed';

export type ReportStatus = 'Pending' | 'Completed';

export interface UploadedReport {
  id: string;
  name: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export interface TestWorkflowState {
  provider_id: string;
  collection_status: SampleCollectionStatus;
  report_status: ReportStatus;
  uploads: UploadedReport[];
}
