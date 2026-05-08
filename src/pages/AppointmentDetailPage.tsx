import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Save, Loader2, Edit3, Check, User as UserIcon, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api/mock';
import type { Appointment, ComponentEntry, Package, PackageComponent, User } from '../types';

type AppointmentDetails = {
  appointment: Appointment;
  user: User;
  package?: Package;
  entries: ComponentEntry[];
};

const calculateAge = (dob: string) => {
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const groupComponents = (components: PackageComponent[]) => {
  return components.reduce((acc, comp) => {
    if (!acc[comp.section]) acc[comp.section] = [];
    acc[comp.section].push(comp);
    return acc;
  }, {} as Record<string, PackageComponent[]>);
};

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSections, setSavingSections] = useState<Record<string, boolean>>({});
  const [savedSections, setSavedSections] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    let ignore = false;

    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      setDetails(null);
      try {
        const data = await api.getAppointmentDetails(id);
        if (ignore) return;
        if (!data.user) throw new Error('User not found');
        const appointmentDetails: AppointmentDetails = {
          appointment: data.appointment,
          user: data.user,
          package: data.package,
          entries: data.entries
        };
        setDetails(appointmentDetails);
        
        // Initialize state
        if (appointmentDetails.package) {
          const grouped = groupComponents(appointmentDetails.package.components);
          const sections = Object.keys(grouped);
          
          if (sections.length > 0) {
            setActiveTab(sections[0]);
          }

          const initialFormData: Record<string, Record<string, string>> = {};
          const initialEditMode: Record<string, boolean> = {};
          
          sections.forEach((section) => {
            initialFormData[section] = {};
            initialEditMode[section] = true;
          });
          
          setFormData(initialFormData);
          setEditMode(initialEditMode);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    fetchDetails();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleInputChange = (section: string, compId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [compId]: value
      }
    }));
  };

  const saveSection = async (section: string) => {
    if (!details) return;
    setSavingSections(prev => ({ ...prev, [section]: true }));
    try {
      await api.saveComponentEntry({
        appointment_id: details.appointment.id,
        user_id: details.user.id,
        camp_id: details.appointment.camp_id,
        package_component_id: 'multi', // mock
        section_name: section,
        values: formData[section],
        status: 'draft_saved',
        saved_by: 'agent-1'
      });
      setSavedSections(prev => ({ ...prev, [section]: true }));
      setEditMode(prev => ({ ...prev, [section]: false }));
      
      setTimeout(() => {
        setSavedSections(prev => ({ ...prev, [section]: false }));
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSections(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleFinalizeSubmission = async () => {
    setValidationError('');
    if (!details?.package?.components) return;
    
    let isValid = true;
    let missingTab = '';
    const grouped = groupComponents(details.package.components);
    
    for (const [section, components] of Object.entries(grouped)) {
      for (const comp of components) {
        if (comp.required && !formData[section]?.[comp.id]) {
          isValid = false;
          missingTab = section;
          break;
        }
      }
      if (!isValid) break;
    }
    
    if (!isValid) {
      setValidationError(`Please fill all required fields in the "${missingTab}" section.`);
      setActiveTab(missingTab);
      return;
    }
    
    // Check if all sections are saved
    const allSectionsSaved = Object.keys(grouped).every(section => !editMode[section]);
    if (!allSectionsSaved) {
      setValidationError('Please save all sections before finalizing.');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch {
      setValidationError('Failed to finalize submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto mb-4" />
        <p className="text-n-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (!details) return <div>Appointment not found</div>;

  const groupedComponents = details.package ? groupComponents(details.package.components) : {};
  const sections = Object.keys(groupedComponents);

  const isSavingActiveTab = savingSections[activeTab];
  const isSavedActiveTab = savedSections[activeTab];
  const isEditModeActiveTab = editMode[activeTab];

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-6 space-y-6">
      <div className="mb-4 md:mb-6">
        <div className="kicker mb-2 text-n-500">Appointment</div>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-n-900 leading-tight">
          Appointment Details
        </h1>
      </div>

      {/* Compact Patient Profile Header */}
      <div className="bg-white rounded-xl border border-n-200 shadow-sm p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="flex items-start md:items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-lt flex items-center justify-center text-brand shrink-0">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-n-900 leading-tight">{details.user.full_name}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-n-600 font-medium">
                <span className="font-mono bg-n-50 px-1.5 py-0.5 rounded text-n-700">{details.user.employee_id}</span>
                <span className="text-n-300">•</span>
                <span>{details.user.gender}</span>
                <span className="text-n-300">•</span>
                <span>{calculateAge(details.user.dob)} Yrs</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 text-sm">
            <div className="flex items-center gap-2 bg-n-50 px-3 py-1.5 rounded-lg border border-n-100">
              <span className="text-xs font-semibold text-n-500 uppercase tracking-wider">Apt ID</span>
              <span className="font-mono font-semibold text-n-900">{details.appointment.id}</span>
            </div>
            <div className="flex items-center gap-2 bg-brand-lt/30 px-3 py-1.5 rounded-lg border border-brand-lt">
              <span className="text-xs font-semibold text-brand uppercase tracking-wider">Pkg</span>
              <span className="font-medium text-brand truncate max-w-[150px]">{details.package?.name}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-n-100 flex flex-wrap gap-2">
          <span className="badge badge-ok px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold shadow-sm">
            Appt: {details.appointment.appointment_state.replace('_', ' ')}
          </span>
          <span className="badge badge-info px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold shadow-sm">
            Book: {details.appointment.booking_status}
          </span>
          <span className="badge badge-neutral px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold shadow-sm">
            Rep: {details.appointment.report_state}
          </span>
        </div>
      </div>

      {/* Sticky Segmented Tabs */}
      <div className="sticky top-14 z-30 bg-n-50 pt-2 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="bg-white p-1 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-n-200 overflow-x-auto scrollbar-hide">
          <div className="flex w-max min-w-full">
            {sections.map((section) => {
              const isActive = activeTab === section;
              const hasData = Object.keys(formData[section] || {}).some(k => formData[section][k]);
              const isSectionSaved = !editMode[section] && hasData;
              
              return (
                <button
                  key={section}
                  onClick={() => setActiveTab(section)}
                  className={`flex-1 min-w-[80px] px-3 py-2 text-[13px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isActive 
                      ? 'bg-brand text-white shadow-sm' 
                      : 'text-n-600 hover:text-n-900 hover:bg-n-50'
                  }`}
                >
                  {section}
                  {isSectionSaved && <CheckCircle2 size={14} className={isActive ? 'text-white' : 'text-green'} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Tab Content Form */}
      <div className="bg-white border border-n-200 rounded-xl shadow-sm p-5 md:p-6 mb-8">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-n-100">
          <h3 className="text-lg font-bold text-n-900 tracking-tight">{activeTab} Details</h3>
          {!isEditModeActiveTab && (
            <span className="badge badge-ok shadow-sm"><Check size={14} className="mr-1" /> Saved</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(groupedComponents[activeTab] || []).map((comp) => (
            <div key={comp.id} className="flex flex-col">
              <label className="text-xs font-semibold text-n-700 uppercase tracking-wide mb-1.5 ml-1">
                {comp.name} {comp.required && <span className="text-rose">*</span>}
              </label>
              {comp.type === 'text' && comp.name.toLowerCase().includes('remarks') ? (
                <textarea
                  className="ds-input h-20 resize-none text-sm bg-n-50 focus:bg-white"
                  value={formData[activeTab]?.[comp.id] || ''}
                  onChange={e => handleInputChange(activeTab, comp.id, e.target.value)}
                  disabled={!isEditModeActiveTab || isSavingActiveTab}
                  placeholder={`Enter remarks...`}
                />
              ) : (
                <input
                  type={comp.type === 'numeric' ? 'number' : 'text'}
                  className="ds-input text-sm bg-n-50 focus:bg-white"
                  value={formData[activeTab]?.[comp.id] || ''}
                  onChange={e => handleInputChange(activeTab, comp.id, e.target.value)}
                  disabled={!isEditModeActiveTab || isSavingActiveTab}
                  placeholder={`Enter ${comp.name.toLowerCase()}...`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-5 border-t border-n-100 flex justify-end">
          {!isEditModeActiveTab ? (
            <button 
              className="btn btn-secondary w-full sm:w-auto"
              onClick={() => setEditMode(prev => ({ ...prev, [activeTab]: true }))}
            >
              <Edit3 size={16} /> Edit Section
            </button>
          ) : (
            <button 
              className={`btn ${isSavedActiveTab ? 'btn-secondary text-green border-green-m' : 'btn-brand'} w-full sm:w-auto shadow-sm`}
              onClick={() => saveSection(activeTab)}
              disabled={isSavingActiveTab}
            >
              {isSavingActiveTab ? <Loader2 size={16} className="animate-spin" /> : 
               isSavedActiveTab ? <><Check size={16} /> Saved</> : 
               <><Save size={16} /> Save Section</>}
            </button>
          )}
        </div>
      </div>

      {validationError && (
        <div className="bg-rose-lt text-rose p-4 rounded-lg flex items-center gap-2 mt-4 text-sm font-medium animate-[fadeUp_0.3s_ease]">
          <Activity size={18} />
          {validationError}
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-lt text-green p-4 rounded-lg flex items-center gap-2 mt-4 text-sm font-medium animate-[fadeUp_0.4s_ease]">
          <CheckCircle2 size={18} />
          Health check data successfully submitted! Redirecting to dashboard...
        </div>
      )}
      
      {/* Mobile Sticky Action / Desktop Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-n-200 z-40 md:relative md:bg-transparent md:border-0 md:p-0 md:flex md:justify-end">
        <button 
          className="btn btn-primary btn-lg w-full md:w-auto shadow-sm" 
          onClick={handleFinalizeSubmission}
          disabled={isSubmitting || submitSuccess}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Finalize Submission'}
        </button>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
