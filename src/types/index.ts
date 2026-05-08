export interface Agent {
  id: string;
  name: string;
  mobile_number: string;
  role: string;
  is_active: boolean;
}

export interface Camp {
  id: string;
  name: string;
  organization_name?: string;
  provider_id: string;
  provider_name: string;
  provider_logo: string;
  start_date: string; // ISO format
  end_date: string;
  timing?: string;
  assigned_agent_count?: number;
  location: string;
  address?: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface User {
  id: string;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  employee_id: string;
  mobile_number: string;
  email: string;
  company: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  camp_id: string;
  provider_id: string;
  package_id: string;
  booking_status: 'success' | 'failure' | 'pending';
  appointment_state: 'booking_created' | 'sample_pending' | 'partial_completed' | 'processing';
  report_state: 'pending' | 'generated' | 'shared';
  created_by_agent_id: string;
  created_at: string;
  updated_at: string;
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
  status: 'draft_saved' | 'completed' | 'needs_correction';
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
