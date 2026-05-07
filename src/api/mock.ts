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
      { id: 'comp-v1', name: 'Blood Pressure (Systolic)', section: 'Vitals', type: 'numeric', required: true },
      { id: 'comp-v2', name: 'Blood Pressure (Diastolic)', section: 'Vitals', type: 'numeric', required: true },
      { id: 'comp-v3', name: 'Weight (kg)', section: 'Vitals', type: 'numeric', required: true },
      { id: 'comp-v4', name: 'Height (cm)', section: 'Vitals', type: 'numeric', required: true },
      { id: 'comp-v5', name: 'Pulse Rate', section: 'Vitals', type: 'numeric', required: true },
      
      { id: 'comp-cbc1', name: 'Hemoglobin', section: 'Complete Blood Picture', type: 'numeric', required: true },
      { id: 'comp-cbc2', name: 'RBC Count', section: 'Complete Blood Picture', type: 'numeric', required: true },
      { id: 'comp-cbc3', name: 'WBC Count', section: 'Complete Blood Picture', type: 'numeric', required: true },
      { id: 'comp-cbc4', name: 'Platelet Count', section: 'Complete Blood Picture', type: 'numeric', required: true },
      
      { id: 'comp-kft1', name: 'Blood Urea', section: 'Kidney Function Test', type: 'numeric', required: true },
      { id: 'comp-kft2', name: 'Creatinine', section: 'Kidney Function Test', type: 'numeric', required: true },
      { id: 'comp-kft3', name: 'Uric Acid', section: 'Kidney Function Test', type: 'numeric', required: true },
      
      { id: 'comp-lft1', name: 'ALT/SGPT', section: 'Liver Function Test', type: 'numeric', required: true },
      { id: 'comp-lft2', name: 'AST/SGOT', section: 'Liver Function Test', type: 'numeric', required: true },
      { id: 'comp-lft3', name: 'Bilirubin', section: 'Liver Function Test', type: 'numeric', required: true },
      
      { id: 'comp-db1', name: 'Fasting Blood Sugar', section: 'Blood Glucose & Diabetes', type: 'numeric', required: true },
      { id: 'comp-db2', name: 'HbA1c', section: 'Blood Glucose & Diabetes', type: 'numeric', required: true },
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
      u.full_name.toLowerCase().includes(lowerQuery)
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
