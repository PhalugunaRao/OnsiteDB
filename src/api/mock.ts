import type { Agent, Appointment, Camp, ComponentEntry, Package, User, UserSearchResult } from '../types';


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockAgents: Agent[] = [
  { id: 'agent-1', name: 'John Doe', mobile_number: '9999999999', role: 'Camp Partner Agent', is_active: true },
];

const mockCamps: Camp[] = [
  { id: 'camp-1', name: 'TechCorp Annual Wellness', provider_id: 'prov-1', provider_name: 'Apollo Health', provider_logo: 'https://via.placeholder.com/50', start_date: new Date(Date.now() - 86400000).toISOString(), end_date: new Date(Date.now() + 86400000).toISOString(), location: 'TechCorp HQ, Bld 3', status: 'active' },
  { id: 'camp-2', name: 'HealthCheck Camp 2', provider_id: 'prov-2', provider_name: 'Max Healthcare', provider_logo: 'https://via.placeholder.com/50', start_date: new Date(Date.now() - 86400000).toISOString(), end_date: new Date(Date.now() + 86400000).toISOString(), location: 'Cyber City', status: 'active' },
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
      { id: 'comp-v1', name: 'Blood Pressure (Systolic)', section: 'Vitals/BP', type: 'numeric', required: true },
      { id: 'comp-v2', name: 'Blood Pressure (Diastolic)', section: 'Vitals/BP', type: 'numeric', required: true },
      { id: 'comp-v3', name: 'Weight (kg)', section: 'Vitals/BP', type: 'numeric', required: true },
      { id: 'comp-v4', name: 'Height (cm)', section: 'Vitals/BP', type: 'numeric', required: true },
      { id: 'comp-v5', name: 'Pulse Rate', section: 'Vitals/BP', type: 'numeric', required: true },
      
      { id: 'comp-b1', name: 'Hemoglobin', section: 'Blood', type: 'numeric', required: true },
      { id: 'comp-b2', name: 'RBC Count', section: 'Blood', type: 'numeric', required: true },
      { id: 'comp-b3', name: 'WBC Count', section: 'Blood', type: 'numeric', required: true },
      { id: 'comp-b4', name: 'Platelet Count', section: 'Blood', type: 'numeric', required: true },
      
      { id: 'comp-u1', name: 'Color', section: 'Urine', type: 'text', required: true },
      { id: 'comp-u2', name: 'Appearance', section: 'Urine', type: 'text', required: true },
      
      { id: 'comp-bca1', name: 'Body Fat %', section: 'BCA', type: 'numeric', required: true },
      
      { id: 'comp-bmd1', name: 'T-Score', section: 'BMD', type: 'numeric', required: true },
      
      { id: 'comp-vis1', name: 'Left Eye', section: 'Vision', type: 'text', required: true },
      { id: 'comp-vis2', name: 'Right Eye', section: 'Vision', type: 'text', required: true },
      
      { id: 'comp-ecg1', name: 'Test Result', section: 'ECG', type: 'text', required: true },
      { id: 'comp-ecg2', name: 'Doctor Remarks', section: 'ECG', type: 'text', required: true },
      
      { id: 'comp-hr1', name: 'Hearing Left', section: 'Hearing', type: 'text', required: true },
      { id: 'comp-hr2', name: 'Hearing Right', section: 'Hearing', type: 'text', required: true },
      
      { id: 'comp-pft1', name: 'FEV1', section: 'PFT', type: 'numeric', required: true },
      { id: 'comp-pft2', name: 'FVC', section: 'PFT', type: 'numeric', required: true },
      
      { id: 'comp-xray1', name: 'X-Ray Result', section: 'X-Ray', type: 'text', required: true },
      
      { id: 'comp-vac1', name: 'Vaccination Status', section: 'Vaccination', type: 'text', required: true },
      
      { id: 'comp-fit1', name: 'Fitness Level', section: 'Fitness', type: 'text', required: true },
      
      { id: 'comp-ses1', name: 'Session Notes', section: 'Session', type: 'text', required: true },
    ]
  }
];

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
    const agent = mockAgents.find(a => a.mobile_number === mobile);
    if (!agent) throw new Error('Agent not found');
    return { success: true };
  },
  
  verifyOtp: async (mobile: string, otp: string) => {
    await delay(500);
    if (otp !== '1234') throw new Error('Invalid OTP');
    const agent = mockAgents.find(a => a.mobile_number === mobile);
    const activeCamps = mockCamps.filter(c => c.status === 'active');
    if (activeCamps.length === 0) throw new Error('No active camp mapped for this agent');
    return { agent, activeCamps };
  },

  searchUser: async (query: string): Promise<UserSearchResult | null> => {
    await delay(500);
    const user = mockUsers.find(u => u.mobile_number === query || u.email === query || u.employee_id === query);
    if (!user) return null;
    return { user, package: mockPackages[0], entries: [] };
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

  createBooking: async (_request: any): Promise<{ appointment_id: string }> => {
    await delay(1000);
    if (Math.random() > 0.8) throw new Error('Partner API Timeout');
    return { appointment_id: `apt-${Math.random().toString(36).substr(2, 9)}` };
  }
};
