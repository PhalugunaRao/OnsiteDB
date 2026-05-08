import type { Agent, Appointment, Camp, ComponentEntry, HealthProvider, Package, ProviderCategory, User, UserSearchResult } from '../types';


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const OTP_TTL_MS = 2 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const normalizeIndianMobile = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.startsWith('+91')) return trimmed.slice(3);
  return trimmed;
};

const isValidIndianMobile = (value: string) => /^[6-9]\d{9}$/.test(normalizeIndianMobile(value));

const otpSessions = new Map<string, { otp: string; expiresAt: number; attempts: number; blockedUntil?: number }>();

const createOtpSession = (mobile: string) => {
  const existing = otpSessions.get(mobile);
  if (existing?.blockedUntil && existing.blockedUntil > Date.now()) {
    throw new Error('Too many attempts. Try again shortly.');
  }
  otpSessions.set(mobile, {
    otp: '123456',
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
};

const mockAgents: Agent[] = [
  { id: 'agent-1', name: 'John Doe', mobile_number: '9999999999', role: 'Camp Partner Agent', is_active: true },
];

const mockCamps: Camp[] = [
  {
    id: 'camp-1',
    name: 'TechCorp Annual Wellness',
    organization_name: 'TechCorp India Pvt Ltd',
    provider_id: 'prov-1',
    provider_name: 'Apollo Health',
    provider_logo: 'https://via.placeholder.com/50',
    start_date: new Date(Date.now() - 86400000).toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString(),
    timing: '08:00 AM - 05:30 PM',
    assigned_agent_count: 8,
    location: 'TechCorp HQ, Bld 3',
    address: 'Tower 3, TechCorp Campus, Outer Ring Road, Bengaluru',
    status: 'active'
  },
  {
    id: 'camp-2',
    name: 'Cyber City Preventive Screening',
    organization_name: 'Cyber City Business Park',
    provider_id: 'prov-2',
    provider_name: 'Max Healthcare',
    provider_logo: 'https://via.placeholder.com/50',
    start_date: new Date(Date.now() - 86400000).toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString(),
    timing: '09:00 AM - 04:00 PM',
    assigned_agent_count: 5,
    location: 'Cyber City',
    address: 'Block C, Ground Floor, Cyber City, Gurugram',
    status: 'active'
  },
];

const mockUsers: User[] = [
  { id: 'user-1', full_name: 'Alice Smith', gender: 'Female', dob: '1990-05-15', employee_id: 'EMP101', mobile_number: '9876543210', email: 'alice@techcorp.com', company: 'TechCorp' },
  { id: 'user-2', full_name: 'Bob Johnson', gender: 'Male', dob: '1985-11-20', employee_id: 'EMP102', mobile_number: '8765432109', email: 'bob@techcorp.com', company: 'TechCorp' },
];

const mockPackages: Package[] = [
  {
    id: 'pkg-1',
    name: 'Comprehensive Health Package',
    components: [
      { id: 'comp-v1', name: 'Blood Pressure (Systolic)', section: 'Vitals/BP', type: 'numeric', unit: 'mmHg', input_mode: 'instant', provider_category: 'instant', required: true },
      { id: 'comp-v2', name: 'Blood Pressure (Diastolic)', section: 'Vitals/BP', type: 'numeric', unit: 'mmHg', input_mode: 'instant', provider_category: 'instant', required: true },
      { id: 'comp-v3', name: 'Weight', section: 'Vitals/BP', type: 'numeric', unit: 'kg', input_mode: 'instant', provider_category: 'instant', required: true },
      { id: 'comp-v4', name: 'Height', section: 'Vitals/BP', type: 'numeric', unit: 'cm', input_mode: 'instant', provider_category: 'instant', required: true },
      { id: 'comp-v5', name: 'Pulse Rate', section: 'Vitals/BP', type: 'numeric', unit: 'bpm', input_mode: 'instant', provider_category: 'instant', required: true },
      
      { id: 'comp-b1', name: 'Hemoglobin', section: 'Blood', type: 'numeric', unit: 'g/dL', input_mode: 'sample', provider_category: 'blood', required: true },
      { id: 'comp-b2', name: 'RBC Count', section: 'Blood', type: 'numeric', unit: 'million/uL', input_mode: 'sample', provider_category: 'blood', required: true },
      { id: 'comp-b3', name: 'WBC Count', section: 'Blood', type: 'numeric', unit: 'cells/uL', input_mode: 'sample', provider_category: 'blood', required: true },
      { id: 'comp-b4', name: 'Platelet Count', section: 'Blood', type: 'numeric', unit: 'lakh/uL', input_mode: 'sample', provider_category: 'blood', required: true },
      
      { id: 'comp-u1', name: 'Color', section: 'Urine', type: 'text', input_mode: 'sample', provider_category: 'external_lab', required: true },
      { id: 'comp-u2', name: 'Appearance', section: 'Urine', type: 'text', input_mode: 'sample', provider_category: 'external_lab', required: true },
      
      { id: 'comp-bca1', name: 'Body Fat', section: 'BCA', type: 'numeric', unit: '%', input_mode: 'instant', provider_category: 'instant', required: true },
      
      { id: 'comp-bmd1', name: 'T-Score', section: 'BMD', type: 'numeric', input_mode: 'instant', provider_category: 'instant', required: true },
      
      { id: 'comp-vis1', name: 'Left Eye', section: 'Vision', type: 'text', input_mode: 'instant', provider_category: 'instant', required: true },
      { id: 'comp-vis2', name: 'Right Eye', section: 'Vision', type: 'text', input_mode: 'instant', provider_category: 'instant', required: true },
      
      { id: 'comp-ecg1', name: 'Test Result', section: 'ECG', type: 'text', input_mode: 'instant', provider_category: 'ecg', required: true },
      { id: 'comp-ecg2', name: 'Doctor Remarks', section: 'ECG', type: 'text', input_mode: 'instant', provider_category: 'ecg', required: true },
      
      { id: 'comp-hr1', name: 'Hearing Left', section: 'Hearing', type: 'text', input_mode: 'instant', provider_category: 'instant', required: true },
      { id: 'comp-hr2', name: 'Hearing Right', section: 'Hearing', type: 'text', input_mode: 'instant', provider_category: 'instant', required: true },
      
      { id: 'comp-pft1', name: 'FEV1', section: 'PFT', type: 'numeric', unit: 'L', input_mode: 'instant', provider_category: 'instant', required: true },
      { id: 'comp-pft2', name: 'FVC', section: 'PFT', type: 'numeric', unit: 'L', input_mode: 'instant', provider_category: 'instant', required: true },
      
      { id: 'comp-xray1', name: 'X-Ray Result', section: 'X-Ray', type: 'text', input_mode: 'attachment', provider_category: 'radiology', required: true },
      
      { id: 'comp-vac1', name: 'Vaccination Status', section: 'Vaccination', type: 'text', input_mode: 'instant', provider_category: 'instant', required: true },
      
      { id: 'comp-fit1', name: 'Fitness Level', section: 'Fitness', type: 'text', input_mode: 'instant', provider_category: 'instant', required: true },
      
      { id: 'comp-ses1', name: 'Session Notes', section: 'Session', type: 'text', input_mode: 'instant', provider_category: 'instant', required: true },
    ]
  }
];

const mockHealthProviders: HealthProvider[] = [
  { id: 'thyrocare', name: 'Thyrocare', category: 'blood', status: 'available' },
  { id: 'apollo-lab', name: 'Apollo Lab', category: 'external_lab', status: 'available' },
  { id: 'instant-health', name: 'Instant Health Check', category: 'instant', status: 'available' },
  { id: 'cardio-mobile', name: 'Cardio Mobile ECG', category: 'ecg', status: 'busy' },
  { id: 'radiology-partner', name: 'External Radiology Partner', category: 'radiology', status: 'available' },
];

const defaultProviderByCategory: Record<ProviderCategory, string> = {
  blood: 'thyrocare',
  external_lab: 'apollo-lab',
  instant: 'instant-health',
  ecg: 'cardio-mobile',
  radiology: 'radiology-partner',
};

const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    user_id: 'user-1',
    camp_id: 'camp-1',
    provider_id: 'prov-1',
    package_id: 'pkg-1',
    booking_status: 'success',
    appointment_state: 'booking_created',
    report_state: 'pending',
    created_by_agent_id: 'agent-1',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'apt-2',
    user_id: 'user-2',
    camp_id: 'camp-1',
    provider_id: 'prov-1',
    package_id: 'pkg-1',
    booking_status: 'pending',
    appointment_state: 'booking_created',
    report_state: 'pending',
    created_by_agent_id: 'agent-1',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  }
];

export const api = {
  validateAgent: async (mobile: string) => {
    await delay(500);
    if (!isValidIndianMobile(mobile)) throw new Error('Enter a valid Indian mobile number.');
    const normalizedMobile = normalizeIndianMobile(mobile);
    const agent = mockAgents.find(a => a.mobile_number === normalizedMobile);
    if (!agent) throw new Error('Agent not found');
    createOtpSession(normalizedMobile);
    return { success: true };
  },

  resendOtp: async (mobile: string) => {
    await delay(400);
    const normalizedMobile = normalizeIndianMobile(mobile);
    const agent = mockAgents.find(a => a.mobile_number === normalizedMobile);
    if (!agent) throw new Error('Agent not found');
    createOtpSession(normalizedMobile);
    return { success: true };
  },
  
  verifyOtp: async (mobile: string, otp: string) => {
    await delay(500);
    const normalizedMobile = normalizeIndianMobile(mobile);
    const session = otpSessions.get(normalizedMobile);
    if (!session) throw new Error('OTP expired');
    if (session.blockedUntil && session.blockedUntil > Date.now()) throw new Error('Too many attempts. Try again shortly.');
    if (session.expiresAt < Date.now()) {
      otpSessions.delete(normalizedMobile);
      throw new Error('OTP expired');
    }
    if (otp !== session.otp) {
      const attempts = session.attempts + 1;
      otpSessions.set(normalizedMobile, {
        ...session,
        attempts,
        blockedUntil: attempts >= MAX_OTP_ATTEMPTS ? Date.now() + 60_000 : undefined,
      });
      throw new Error('Invalid OTP');
    }
    const agent = mockAgents.find(a => a.mobile_number === normalizedMobile);
    const activeCamps = mockCamps.filter(c => c.status === 'active');
    if (activeCamps.length === 0) throw new Error('No active camp mapped for this agent');
    otpSessions.delete(normalizedMobile);
    return { agent, activeCamps };
  },

  searchUser: async (query: string): Promise<UserSearchResult | null> => {
    await delay(500);
    const lowerQuery = query.toLowerCase();
    const user = mockUsers.find(u =>
      u.id === query ||
      u.mobile_number === query ||
      u.email.toLowerCase() === lowerQuery ||
      u.employee_id.toLowerCase() === lowerQuery
    );
    if (!user) return null;
    const appointment = mockAppointments.find(apt => apt.user_id === user.id);
    return { user, appointment, package: mockPackages[0], entries: [] };
  },

  searchAppointments: async (query: string) => {
    await delay(300);
    const lowerQuery = query.toLowerCase();
    
    // Find matching users first
    const matchedUsers = mockUsers.filter(u => 
      u.email.toLowerCase().includes(lowerQuery) || 
      u.mobile_number.includes(lowerQuery) || 
      u.full_name.toLowerCase().includes(lowerQuery) ||
      u.employee_id.toLowerCase().includes(lowerQuery)
    );
    const matchedUserIds = new Set(matchedUsers.map(u => u.id));
    
    // Find matching appointments based on ID or matched users
    const matchedAppointments = mockAppointments.filter(apt => 
      apt.id.toLowerCase().includes(lowerQuery) || 
      matchedUserIds.has(apt.user_id)
    );
    
    // Join data for display
    return matchedAppointments.map(apt => {
      const user = mockUsers.find(u => u.id === apt.user_id);
      const pkg = mockPackages.find(p => p.id === apt.package_id);
      return {
        ...apt,
        user,
        package: pkg
      };
    });
  },

  saveComponentEntry: async (entry: Partial<ComponentEntry>): Promise<ComponentEntry> => {
    await delay(300);
    return { ...entry, id: Math.random().toString(36).substr(2, 9), saved_at: new Date().toISOString(), last_modified_at: new Date().toISOString() } as ComponentEntry;
  },

  getAppointmentDetails: async (id: string) => {
    await delay(400);
    const appointment = mockAppointments.find(a => a.id === id);
    if (!appointment) throw new Error('Appointment not found');
    const user = mockUsers.find(u => u.id === appointment.user_id);
    const pkg = mockPackages.find(p => p.id === appointment.package_id);
    return { appointment, user, package: pkg, entries: [] };
  },

  getHealthProviders: async (): Promise<HealthProvider[]> => {
    await delay(250);
    return mockHealthProviders;
  },

  getDefaultProviderForCategory: (category: ProviderCategory) => defaultProviderByCategory[category],

  createBooking: async (request: Record<string, unknown>): Promise<{ appointment_id: string }> => {
    void request;
    await delay(1000);
    if (Math.random() > 0.8) throw new Error('Partner API Timeout');
    return { appointment_id: `apt-${Math.random().toString(36).substr(2, 9)}` };
  }
};
