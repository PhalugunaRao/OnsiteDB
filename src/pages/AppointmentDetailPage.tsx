import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, FileText, Activity, ChevronDown, Save, Loader2, Edit3, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api/mock';

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingSections, setSavingSections] = useState<Record<string, boolean>>({});
  const [savedSections, setSavedSections] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const data = await api.getAppointmentDetails(id);
        setDetails(data);
        
        // Initialize state
        if (data.package) {
          const grouped = groupComponents(data.package.components);
          const initialExpanded: Record<string, boolean> = {};
          const initialFormData: Record<string, Record<string, string>> = {};
          const initialEditMode: Record<string, boolean> = {};
          
          Object.keys(grouped).forEach((section, index) => {
            initialExpanded[section] = index === 0; // expand first by default
            initialFormData[section] = {};
            initialEditMode[section] = true;
          });
          
          setExpandedSections(initialExpanded);
          setFormData(initialFormData);
          setEditMode(initialEditMode);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const groupComponents = (components: any[]) => {
    return components.reduce((acc, comp) => {
      if (!acc[comp.section]) acc[comp.section] = [];
      acc[comp.section].push(comp);
      return acc;
    }, {} as Record<string, any[]>);
  };

  const handleInputChange = (section: string, compId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [compId]: value
      }
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const saveSection = async (section: string) => {
    setSavingSections(prev => ({ ...prev, [section]: true }));
    try {
      await api.saveComponentEntry({
        appointment_id: details.appointment.id,
        user_id: details.user.id,
        camp_id: details.appointment.camp_id,
        package_component_id: 'multi', // just for mock
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
    // Validation
    if (!details?.package?.components) return;
    
    let isValid = true;
    const grouped = groupComponents(details.package.components);
    
    for (const [section, components] of Object.entries(grouped)) {
      for (const comp of components as any[]) {
        if (comp.required && !formData[section]?.[comp.id]) {
          isValid = false;
          setExpandedSections(prev => ({ ...prev, [section]: true }));
        }
      }
    }
    
    if (!isValid) {
      setValidationError('Please fill all required fields before finalizing.');
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
      // Mock final submission API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="btn btn-tertiary">← Back</button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-n-900">Appointment Details</h1>
          <p className="font-mono text-sm text-n-500 mt-1">{details.appointment.id} • {details.user.full_name}</p>
        </div>
      </div>

      <div className="ds-card bordered-green">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-green-lt text-green flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-n-900">Booking Confirmed</h2>
            <p className="text-sm text-n-600">Successfully pushed to partner system.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6 bg-n-50 rounded-lg">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-brand" />
              <span className="text-sm font-semibold text-n-900">Lifecycle State</span>
            </div>
            <div className="badge badge-info">{details.appointment.appointment_state}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-purple" />
              <span className="text-sm font-semibold text-n-900">Report State</span>
            </div>
            <div className="badge badge-neutral">{details.appointment.report_state}</div>
          </div>
        </div>
      </div>

      {/* Dynamic Health Check Sections */}
      <div className="space-y-4">
        <h3 className="font-semibold text-n-900 mb-2 mt-8 text-xl">Health Checks</h3>
        {Object.entries(groupedComponents).map(([section, components]: [string, any]) => {
          const isExpanded = expandedSections[section];
          const isSaving = savingSections[section];
          const isSaved = savedSections[section];
          const isEditMode = editMode[section];

          return (
            <div key={section} className="ds-card overflow-hidden !p-0">
              <div 
                className="accordion-header flex items-center justify-between p-4 cursor-pointer hover:bg-n-50 border-b border-n-100"
                onClick={() => toggleSection(section)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-brand-lt text-brand flex items-center justify-center font-bold">
                    {section.charAt(0)}
                  </div>
                  <h4 className="font-semibold text-n-900">{section}</h4>
                  {!isEditMode && <span className="badge badge-ok ml-2">Saved</span>}
                </div>
                <ChevronDown className={`text-n-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              
              {isExpanded && (
                <div className="p-6 bg-white">
                  <div className="grid md:grid-cols-2 gap-6">
                    {components.map((comp: any) => (
                      <div key={comp.id}>
                        <label className="ds-label block">{comp.name} {comp.required && <span className="text-rose">*</span>}</label>
                        <input
                          type={comp.type === 'numeric' ? 'number' : 'text'}
                          className="ds-input"
                          value={formData[section]?.[comp.id] || ''}
                          onChange={e => handleInputChange(section, comp.id, e.target.value)}
                          disabled={!isEditMode || isSaving}
                          placeholder={`Enter ${comp.name.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-n-100 flex justify-end">
                    {!isEditMode ? (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => { e.stopPropagation(); setEditMode(prev => ({ ...prev, [section]: true })); }}
                      >
                        <Edit3 size={16} /> Edit Section
                      </button>
                    ) : (
                      <button 
                        className={`btn ${isSaved ? 'btn-secondary text-green border-green-m' : 'btn-brand'} btn-sm min-w-[120px]`}
                        onClick={(e) => { e.stopPropagation(); saveSection(section); }}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : 
                         isSaved ? <><Check size={16} /> Saved</> : 
                         <><Save size={16} /> Save Section</>}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {validationError && (
          <div className="bg-rose-lt text-rose p-4 rounded-lg flex items-center gap-2 mt-4 text-sm font-medium">
            <Activity size={18} />
            {validationError}
          </div>
        )}

        {submitSuccess && (
          <div className="bg-green-lt text-green p-4 rounded-lg flex items-center gap-2 mt-4 text-sm font-medium animate-[fadeUp_0.4s_ease_both]">
            <CheckCircle2 size={18} />
            Health check data successfully submitted! Redirecting to dashboard...
          </div>
        )}
        
        <div className="mt-8 flex justify-end">
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleFinalizeSubmission}
            disabled={isSubmitting || submitSuccess}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Finalize Submission'}
          </button>
        </div>
      </div>

      <div className="ds-card">
        <h3 className="font-semibold text-n-900 mb-4 border-b border-n-100 pb-2 flex items-center gap-2">
          <Clock size={16} className="text-n-400" /> Audit Timeline
        </h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-brand"></div>
              <div className="w-px h-full bg-n-200 my-1"></div>
            </div>
            <div className="pb-6">
              <div className="text-sm font-medium text-n-900">Booking Created</div>
              <div className="text-xs text-n-500 mt-1 font-mono">Just now</div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-n-200"></div>
            </div>
            <div>
              <div className="text-sm font-medium text-n-400">Sample Collected</div>
              <div className="text-xs text-n-400 mt-1 font-mono">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
