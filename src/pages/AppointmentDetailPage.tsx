import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Loader2,
  Paperclip,
  Save,
  Trash2,
  UploadCloud,
  User as UserIcon,
} from 'lucide-react';

import { api } from '../api/mock';
import { medicalModules } from '../data/medicalModules';
import type { ClinicalStatus, MedicalField, MedicalModuleSchema } from '../data/medicalModules';
import type {
  Appointment,
  ComponentEntry,
  HealthProvider,
  Package,
  ProviderCategory,
  ReportStatus,
  SampleCollectionStatus,
  TestWorkflowState,
  UploadedReport,
  User,
} from '../types';

type AppointmentDetails = {
  appointment: Appointment;
  user: User;
  package?: Package;
  entries: ComponentEntry[];
};

type ModuleValues = Record<string, Record<string, string>>;

const collectionStatuses: SampleCollectionStatus[] = [
  'Pending',
  'Sample Collected',
  'Sent to Lab',
  'Processing',
  'Report Received',
  'Uploaded',
  'Completed',
];

const reportStatuses: ReportStatus[] = ['Pending', 'Completed'];

const categoryLabels: Record<ProviderCategory, string> = {
  blood: 'Blood Collection',
  external_lab: 'External Lab',
  ecg: 'ECG',
  radiology: 'Radiology',
  instant: 'Instant',
};

const workflowBadgeClass: Record<SampleCollectionStatus, string> = {
  Pending: 'badge-neutral',
  'Sample Collected': 'badge-info',
  'Sent to Lab': 'badge-info',
  Processing: 'badge-warn',
  'Report Received': 'badge-purple',
  Uploaded: 'badge-ok',
  Completed: 'badge-ok',
};

const clinicalStatusClass: Record<ClinicalStatus, string> = {
  Normal: 'badge-ok',
  'Attention Required': 'badge-warn',
  Critical: 'badge-risk',
  'Pending Review': 'badge-neutral',
  Verified: 'badge-info',
};

const calculateAge = (dob: string) => {
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getProviderName = (providers: HealthProvider[], providerId?: string) => {
  return providers.find(provider => provider.id === providerId)?.name || 'Provider pending';
};

const valuesForModule = (formData: ModuleValues, moduleId: string) => formData[moduleId] || {};

const groupedFields = (fields: MedicalField[]) => {
  return fields.reduce((groups, field) => {
    if (!groups[field.group]) groups[field.group] = [];
    groups[field.group].push(field);
    return groups;
  }, {} as Record<string, MedicalField[]>);
};

const getModuleProgress = (module: MedicalModuleSchema, values: Record<string, string>) => {
  const requiredFields = module.fields.filter(field => field.required);
  const completedRequired = requiredFields.filter(field => !!values[field.id]).length;
  const completedAll = module.fields.filter(field => !!values[field.id]).length;
  return {
    completedRequired,
    requiredTotal: requiredFields.length,
    completedAll,
    total: module.fields.length,
  };
};

const createInitialFormData = () => {
  return Object.fromEntries(medicalModules.map(module => [
    module.id,
    { clinical_status: module.defaultStatus },
  ]));
};

const createInitialOpenState = () => {
  return Object.fromEntries(medicalModules.map((module, index) => [module.id, index === 0]));
};

const createInitialWorkflow = () => {
  return Object.fromEntries(medicalModules.map(module => [
    module.id,
    {
      provider_id: api.getDefaultProviderForCategory(module.providerCategory),
      collection_status: 'Pending' as SampleCollectionStatus,
      report_status: 'Pending' as ReportStatus,
      uploads: [],
    },
  ]));
};

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<AppointmentDetails | null>(null);
  const [providers, setProviders] = useState<HealthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSections, setSavingSections] = useState<Record<string, boolean>>({});
  const [savedSections, setSavedSections] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<ModuleValues>(createInitialFormData);
  const [workflow, setWorkflow] = useState<Record<string, TestWorkflowState>>(createInitialWorkflow);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(createInitialOpenState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [activeModuleId, setActiveModuleId] = useState(medicalModules[0].id);
  const [draggingModule, setDraggingModule] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      setDetails(null);
      try {
        const [data, providerData] = await Promise.all([
          api.getAppointmentDetails(id),
          api.getHealthProviders(),
        ]);
        if (ignore) return;
        if (!data.user) throw new Error('User not found');
        setDetails({
          appointment: data.appointment,
          user: data.user,
          package: data.package,
          entries: data.entries,
        });
        setProviders(providerData);
        setFormData(createInitialFormData());
        setWorkflow(createInitialWorkflow());
        setOpenGroups(createInitialOpenState());
        setSavedSections({});
        setActiveModuleId(medicalModules[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      ignore = true;
    };
  }, [id]);

  const activeModule = medicalModules.find(module => module.id === activeModuleId) || medicalModules[0];
  const activeValues = valuesForModule(formData, activeModule.id);
  const activeWorkflow = workflow[activeModule.id];
  const activeGroups = useMemo(() => groupedFields(activeModule.fields), [activeModule]);
  const providersForActive = providers.filter(provider => provider.category === activeModule.providerCategory || provider.category === 'instant');

  const overallProgress = useMemo(() => {
    const totals = medicalModules.reduce((acc, module) => {
      const progress = getModuleProgress(module, valuesForModule(formData, module.id));
      return {
        completed: acc.completed + progress.completedRequired,
        total: acc.total + progress.requiredTotal,
      };
    }, { completed: 0, total: 0 });
    return totals;
  }, [formData]);

  const updateField = (moduleId: string, fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || {}),
        [fieldId]: value,
      },
    }));
    setSavedSections(prev => ({ ...prev, [moduleId]: false }));
  };

  const toggleChip = (moduleId: string, fieldId: string, option: string) => {
    const current = valuesForModule(formData, moduleId)[fieldId]?.split('|').filter(Boolean) || [];
    const next = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option];
    updateField(moduleId, fieldId, next.join('|'));
  };

  const updateWorkflow = (moduleId: string, next: Partial<TestWorkflowState>) => {
    setWorkflow(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        ...next,
      },
    }));
    setSavedSections(prev => ({ ...prev, [moduleId]: false }));
  };

  const addFiles = (moduleId: string, files: FileList | File[]) => {
    const nextUploads: UploadedReport[] = Array.from(files)
      .filter(file => file.type === 'application/pdf' || file.type.startsWith('image/'))
      .map((file, index) => ({
        id: `${moduleId}-${file.name}-${file.size}-${index}`,
        name: file.name,
        type: file.type || 'file',
        size: file.size,
        uploaded_at: new Date().toISOString(),
      }));
    if (!nextUploads.length) return;
    updateWorkflow(moduleId, {
      uploads: [...(workflow[moduleId]?.uploads || []), ...nextUploads],
      collection_status: 'Uploaded',
      report_status: 'Completed',
    });
  };

  const removeUpload = (moduleId: string, uploadId: string) => {
    const remainingUploads = (workflow[moduleId]?.uploads || []).filter(upload => upload.id !== uploadId);
    updateWorkflow(moduleId, {
      uploads: remainingUploads,
      collection_status: remainingUploads.length ? workflow[moduleId].collection_status : 'Pending',
      report_status: remainingUploads.length ? workflow[moduleId].report_status : 'Pending',
    });
  };

  const saveModule = async (module: MedicalModuleSchema) => {
    if (!details) return;
    setSavingSections(prev => ({ ...prev, [module.id]: true }));
    setValidationError('');
    try {
      await api.saveComponentEntry({
        appointment_id: details.appointment.id,
        user_id: details.user.id,
        camp_id: details.appointment.camp_id,
        package_component_id: module.id,
        section_name: module.title,
        values: {
          schema_id: module.id,
          fields: formData[module.id],
          workflow: workflow[module.id],
        },
        status: 'draft_saved',
        saved_by: 'agent-1',
      });
      setSavedSections(prev => ({ ...prev, [module.id]: true }));
      setWorkflow(prev => ({
        ...prev,
        [module.id]: {
          ...prev[module.id],
          collection_status: prev[module.id]?.collection_status === 'Pending' ? 'Completed' : prev[module.id]?.collection_status,
        },
      }));
    } catch (err) {
      console.error(err);
      setValidationError(`Could not save ${module.title}.`);
    } finally {
      setSavingSections(prev => ({ ...prev, [module.id]: false }));
    }
  };

  const handleFinalizeSubmission = async () => {
    setValidationError('');

    for (const module of medicalModules) {
      const values = valuesForModule(formData, module.id);
      const missingField = module.fields.find(field => field.required && !values[field.id]);
      if (missingField) {
        setValidationError(`${module.title}: ${missingField.label} is required.`);
        setActiveModuleId(module.id);
        setOpenGroups(prev => ({ ...prev, [module.id]: true }));
        return;
      }
      if (!savedSections[module.id]) {
        setValidationError(`Save ${module.title} before final submission.`);
        setActiveModuleId(module.id);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => window.setTimeout(resolve, 700));
      setSubmitSuccess(true);
      window.setTimeout(() => navigate('/'), 1400);
    } catch {
      setValidationError('Final submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-brand" />
        <p className="text-sm font-medium text-n-500">Loading appointment</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="empty-state ds-surface mx-auto max-w-xl">
        <div className="empty-state-icon">
          <ClipboardCheck size={28} />
        </div>
        <h2 className="empty-state-title">Appointment not found</h2>
      </div>
    );
  }

  const activeClinicalStatus = (activeValues.clinical_status || activeModule.defaultStatus) as ClinicalStatus;

  return (
    <div className="mx-auto max-w-6xl pb-28 md:pb-8">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-lt text-brand">
            <UserIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-n-900">{details.user.full_name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-n-600">
              <span className="rounded bg-n-50 px-1.5 py-0.5 font-mono text-n-700">{details.user.employee_id}</span>
              <span>{details.user.gender}</span>
              <span><span className="font-mono">{calculateAge(details.user.dob)}</span> yrs</span>
              <span className="font-mono">{details.user.mobile_number}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-info">Apt <span className="font-mono">{details.appointment.id}</span></span>
          <span className="badge badge-neutral">{details.appointment.report_state}</span>
        </div>
      </div>

      <div className="ds-surface mb-5 p-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.1em] text-n-500">
          <span>Required fields</span>
          <span className="font-mono text-n-900">{overallProgress.completed}/{overallProgress.total}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-n-100">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${overallProgress.total ? (overallProgress.completed / overallProgress.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="ds-surface overflow-hidden">
            <div className="border-b border-n-100 bg-n-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-n-600">
              Medical Modules
            </div>
            <div className="divide-y divide-n-100">
              {medicalModules.map(module => {
                const values = valuesForModule(formData, module.id);
                const progress = getModuleProgress(module, values);
                const moduleWorkflow = workflow[module.id];
                const clinicalStatus = (values.clinical_status || module.defaultStatus) as ClinicalStatus;
                const isActive = activeModuleId === module.id;
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => setActiveModuleId(module.id)}
                    className={`flex w-full items-start gap-3 p-4 text-left transition-colors ${isActive ? 'bg-brand-lt' : 'hover:bg-n-50 active:bg-brand-lt'}`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${savedSections[module.id] ? 'bg-brand-lt text-brand' : 'bg-n-100 text-n-500'}`}>
                      {savedSections[module.id] ? <CheckCircle2 size={17} /> : <Activity size={17} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-n-900">{module.title}</h3>
                        <ChevronRight size={16} className={`mt-0.5 text-n-400 transition-transform ${isActive ? 'rotate-90 text-brand' : ''}`} />
                      </div>
                      <p className="mt-1 truncate text-xs text-n-500">{categoryLabels[module.providerCategory]} · {getProviderName(providers, moduleWorkflow?.provider_id)}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="badge badge-neutral text-[11px]"><span className="font-mono">{progress.completedRequired}/{progress.requiredTotal}</span></span>
                        <span className={`badge ${clinicalStatusClass[clinicalStatus]} text-[11px]`}>{clinicalStatus}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="ds-card p-0">
            <div className="border-b border-n-100 bg-n-50 px-4 py-4 md:px-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-brand">{categoryLabels[activeModule.providerCategory]}</div>
                  <h2 className="mt-1 text-xl font-bold text-n-900">{activeModule.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${clinicalStatusClass[activeClinicalStatus]}`}>{activeClinicalStatus}</span>
                  {activeWorkflow && <span className={`badge ${workflowBadgeClass[activeWorkflow.collection_status]}`}>{activeWorkflow.collection_status}</span>}
                </div>
              </div>
            </div>

            {activeWorkflow && (
              <div className="space-y-5 p-4 md:p-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="ds-field">
                    <label className="ds-label">Provider</label>
                    <select
                      className="ds-input"
                      value={activeWorkflow.provider_id}
                      onChange={(event) => updateWorkflow(activeModule.id, { provider_id: event.target.value })}
                    >
                      {providersForActive.map(provider => (
                        <option key={provider.id} value={provider.id}>{provider.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ds-field">
                    <label className="ds-label">Collection Status</label>
                    <select
                      className="ds-input"
                      value={activeWorkflow.collection_status}
                      onChange={(event) => updateWorkflow(activeModule.id, { collection_status: event.target.value as SampleCollectionStatus })}
                    >
                      {collectionStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  <div className="ds-field">
                    <label className="ds-label">Report Status</label>
                    <select
                      className="ds-input"
                      value={activeWorkflow.report_status}
                      onChange={(event) => updateWorkflow(activeModule.id, { report_status: event.target.value as ReportStatus })}
                    >
                      {reportStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                  <div className="space-y-4">
                    {Object.entries(activeGroups).map(([groupName, fields]) => {
                      const groupKey = `${activeModule.id}:${groupName}`;
                      const isOpen = openGroups[groupKey] ?? true;
                      return (
                        <div key={groupName} className="clinical-field-group">
                          <button
                            type="button"
                            className="clinical-field-group-title flex w-full items-center justify-between text-left"
                            onClick={() => setOpenGroups(prev => ({ ...prev, [groupKey]: !isOpen }))}
                          >
                            <span>{groupName}</span>
                            <ChevronRight size={15} className={`transition-transform ${isOpen ? 'rotate-90 text-brand' : ''}`} />
                          </button>
                          {isOpen && (
                            <div className="grid gap-4 p-4 sm:grid-cols-2">
                              {fields.map(field => (
                                <MedicalFieldControl
                                  key={field.id}
                                  moduleId={activeModule.id}
                                  field={field}
                                  value={activeValues[field.id] || ''}
                                  onChange={updateField}
                                  onToggleChip={toggleChip}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    {activeModule.allowAttachments && (
                      <div>
                        <label
                          className={`file-upload block ${draggingModule === activeModule.id ? 'dragging' : ''}`}
                          onDragEnter={(event) => {
                            event.preventDefault();
                            setDraggingModule(activeModule.id);
                          }}
                          onDragOver={(event) => event.preventDefault()}
                          onDragLeave={() => setDraggingModule(null)}
                          onDrop={(event) => {
                            event.preventDefault();
                            setDraggingModule(null);
                            addFiles(activeModule.id, event.dataTransfer.files);
                          }}
                        >
                          <UploadCloud className="mx-auto mb-3 text-n-400" size={34} />
                          <div className="text-sm font-bold text-n-800">Upload reports</div>
                          <div className="mt-1 text-xs text-n-500">PDF, image, scan, or camera upload</div>
                          <input
                            type="file"
                            className="sr-only"
                            accept="application/pdf,image/*"
                            multiple
                            capture="environment"
                            onChange={(event) => {
                              if (event.target.files) addFiles(activeModule.id, event.target.files);
                              event.currentTarget.value = '';
                            }}
                          />
                        </label>
                      </div>
                    )}

                    {activeWorkflow.uploads.length > 0 ? (
                      <div className="space-y-2">
                        {activeWorkflow.uploads.map(upload => (
                          <div key={upload.id} className="flex items-center gap-3 rounded-lg border border-n-200 bg-white p-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-lt text-brand">
                              <FileText size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-n-900">{upload.name}</div>
                              <div className="font-mono text-[11px] text-n-500">{formatFileSize(upload.size)}</div>
                            </div>
                            <button type="button" className="btn btn-icon btn-sm btn-secondary" aria-label="Delete report" onClick={() => removeUpload(activeModule.id, upload.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-n-200 bg-n-50 p-4 text-sm text-n-500">
                        <Paperclip className="mb-2 text-n-400" size={18} />
                        No attachments
                      </div>
                    )}
                  </div>
                </div>

                <div className="sticky bottom-20 z-20 -mx-4 border-t border-n-100 bg-white/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:flex md:justify-end md:border-t">
                  <button
                    type="button"
                    className={`btn ${savedSections[activeModule.id] ? 'btn-secondary border-brand-m text-brand' : 'btn-primary'} btn-lg w-full md:w-auto ${savingSections[activeModule.id] ? 'btn-loading' : ''}`}
                    onClick={() => saveModule(activeModule)}
                    disabled={savingSections[activeModule.id]}
                  >
                    {savedSections[activeModule.id] ? (
                      <>
                        <Check size={18} /> Saved
                      </>
                    ) : (
                      <>
                        <Save size={18} /> Save {activeModule.title}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {validationError && (
            <div className="rounded-lg border border-rose-m bg-rose-lt p-4 text-sm font-semibold text-rose">
              <Activity className="mr-2 inline" size={18} />
              {validationError}
            </div>
          )}

          {submitSuccess && (
            <div className="rounded-lg border border-green-m bg-green-lt p-4 text-sm font-semibold text-green">
              <CheckCircle2 className="mr-2 inline" size={18} />
              Submitted
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-n-200 bg-white p-4 md:left-auto md:rounded-tl-xl md:border-l md:px-5">
        <div className="mx-auto flex max-w-6xl justify-end">
          <button
            type="button"
            className={`btn btn-primary btn-lg w-full md:w-auto ${isSubmitting ? 'btn-loading' : ''}`}
            onClick={handleFinalizeSubmission}
            disabled={isSubmitting || submitSuccess}
          >
            Finalize Submission
          </button>
        </div>
      </div>
    </div>
  );
}

function MedicalFieldControl({
  moduleId,
  field,
  value,
  onChange,
  onToggleChip,
}: {
  moduleId: string;
  field: MedicalField;
  value: string;
  onChange: (moduleId: string, fieldId: string, value: string) => void;
  onToggleChip: (moduleId: string, fieldId: string, option: string) => void;
}) {
  const isWide = field.type === 'textarea' || field.type === 'chips';
  const selectedChips = value.split('|').filter(Boolean);

  return (
    <div className={isWide ? 'sm:col-span-2' : ''}>
      <label className="ds-label">
        {field.label} {field.required && <span className="text-rose">*</span>}
      </label>

      {field.type === 'select' && (
        <select className="ds-input" value={value} onChange={event => onChange(moduleId, field.id, event.target.value)}>
          <option value="">Select</option>
          {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      )}

      {field.type === 'textarea' && (
        <textarea
          className="ds-input min-h-24 resize-none"
          value={value}
          onChange={event => onChange(moduleId, field.id, event.target.value)}
          placeholder={field.placeholder || field.label}
        />
      )}

      {field.type === 'chips' && (
        <div className="flex flex-wrap gap-2">
          {field.options?.map(option => {
            const selected = selectedChips.includes(option);
            return (
              <button
                key={option}
                type="button"
                className={`btn btn-sm btn-pill ${selected ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onToggleChip(moduleId, field.id, option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {field.type === 'boolean' && (
        <select className="ds-input" value={value} onChange={event => onChange(moduleId, field.id, event.target.value)}>
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      )}

      {(field.type === 'number' || field.type === 'text') && (
        <div className="relative">
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            className={`ds-input ${field.unit ? 'pr-20' : ''} ${field.type === 'number' ? 'font-mono' : ''}`}
            inputMode={field.type === 'number' ? 'decimal' : 'text'}
            value={value}
            onChange={event => onChange(moduleId, field.id, event.target.value)}
            placeholder={field.placeholder || field.label}
          />
          {field.unit && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-n-100 px-2 py-1 text-xs font-semibold text-n-600">
              {field.unit}
            </span>
          )}
        </div>
      )}

      {field.normalRange && (
        <div className="mt-1 font-mono text-[11px] text-n-500">Range {field.normalRange}</div>
      )}
    </div>
  );
}
