import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Link2,
  Loader2,
  Paperclip,
  Pencil,
  Save,
  Trash2,
  UploadCloud,
  User as UserIcon,
  X,
} from 'lucide-react';

import { api, type AppointmentDetails } from '../api';
import { useStore } from '../store';
import type {
  ClinicalStatus,
  HealthProvider,
  MedicalField,
  MedicalModuleSchema,
  ProviderCategory,
  ReportStatus,
  SampleCollectionStatus,
  TestWorkflowState,
  UploadedReport,
} from '../types';

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

const moduleCategoryLabel = (module: MedicalModuleSchema) => module.category || categoryLabels[module.providerCategory] || module.providerCategory;

const workflowBadgeClass: Record<SampleCollectionStatus, string> = {
  Pending: 'badge-neutral',
  'Sample Collected': 'badge-info',
  'Sent to Lab': 'badge-info',
  Processing: 'badge-warn',
  'Report Received': 'badge-purple',
  Created: 'badge-info',
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
  const dobTime = new Date(dob).getTime();
  if (!Number.isFinite(dobTime)) return '-';
  const diff = Date.now() - dobTime;
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

const isModuleCompleted = (module: MedicalModuleSchema) => (
  module.fields.length > 0 && module.fields.every(field => field.resultReceived)
) || module.collectionStatus === 'Completed' || module.collectionStatus === 'Created';

const createInitialFormData = (modules: MedicalModuleSchema[]) => {
  return Object.fromEntries(modules.map(module => [
    module.id,
    {
      clinical_status: module.defaultStatus,
      ...Object.fromEntries(module.fields
        .filter(field => field.defaultValue !== undefined && field.defaultValue !== '')
        .map(field => [field.id, field.defaultValue || ''])),
    },
  ]));
};

const createInitialOpenState = (modules: MedicalModuleSchema[]) => {
  return Object.fromEntries(modules.map((module, index) => [module.id, index === 0]));
};

const createInitialWorkflow = (modules: MedicalModuleSchema[], providers: HealthProvider[], details?: AppointmentDetails | null) => {
  return Object.fromEntries(modules.map(module => {
    const relatedEntry = details?.entries.find(entry => entry.id === module.sampleCollectionId || entry.section_name === module.title);
    const entryStatus = relatedEntry?.status === 'completed'
      ? 'Completed'
      : relatedEntry?.status === 'draft_saved' || relatedEntry?.status === 'created'
        ? 'Created'
        : undefined;
    return [
      module.id,
      {
      provider_id: module.providerId || providers.find(provider => provider.category === module.providerCategory || provider.category === 'instant')?.id || '',
      collection_status: module.collectionStatus || entryStatus || 'Pending' as SampleCollectionStatus,
      report_status: module.reportStatus || 'Pending' as ReportStatus,
      uploads: relatedEntry?.values.uploads as UploadedReport[] || [],
      },
    ];
  }));
};

const createInitialSavedState = (modules: MedicalModuleSchema[], details?: AppointmentDetails | null) => (
  Object.fromEntries(modules.map(module => {
    const relatedEntry = details?.entries.find(entry => entry.id === module.sampleCollectionId || entry.section_name === module.title);
    return [module.id, isModuleCompleted(module) || relatedEntry?.status === 'created' || relatedEntry?.status === 'completed'];
  }))
);

const createInitialEditState = (modules: MedicalModuleSchema[], details?: AppointmentDetails | null) => (
  Object.fromEntries(modules.map(module => {
    const relatedEntry = details?.entries.find(entry => entry.id === module.sampleCollectionId || entry.section_name === module.title);
    const saved = isModuleCompleted(module) || relatedEntry?.status === 'created' || relatedEntry?.status === 'completed';
    return [module.id, !saved];
  }))
);

const hasEnteredValue = (value?: string) => value !== undefined && value !== null && String(value).trim() !== '';

const normalizeResultValue = (field: MedicalField, value: string) => {
  if (field.type !== 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

const toComponentId = (fieldId: string) => {
  const numericId = Number(fieldId);
  return Number.isFinite(numericId) && String(numericId) === fieldId ? numericId : fieldId;
};

const toProviderId = (providerId: string) => {
  const numericId = Number(providerId);
  return Number.isFinite(numericId) && String(numericId) === providerId ? numericId : providerId;
};

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const agent = useStore(state => state.agent);
  const selectedCamp = useStore(state => state.selectedCamp);
  const [details, setDetails] = useState<AppointmentDetails | null>(null);
  const [providers, setProviders] = useState<HealthProvider[]>([]);
  const [modules, setModules] = useState<MedicalModuleSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSections, setSavingSections] = useState<Record<string, boolean>>({});
  const [savedSections, setSavedSections] = useState<Record<string, boolean>>({});
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<ModuleValues>({});
  const [workflow, setWorkflow] = useState<Record<string, TestWorkflowState>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [submitSuccess] = useState(false);
  const [resultSuccessMsg, setResultSuccessMsg] = useState('');
  const [providerAttachMsg, setProviderAttachMsg] = useState('');
  const [validationError, setValidationError] = useState('');
  const [attachingProvider, setAttachingProvider] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [activeModuleId, setActiveModuleId] = useState('');
  const [mobileWorkspaceOpen, setMobileWorkspaceOpen] = useState(false);
  const [packageListOpen, setPackageListOpen] = useState(false);
  const [draggingModule, setDraggingModule] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchDetails = async () => {
      if (!id || !selectedCamp) return;
      setLoading(true);
      setDetails(null);
      try {
        const data = await api.getAppointmentDetails(selectedCamp.id, id);
        if (ignore) return;
        if (!data.user) throw new Error('User not found');
        setDetails({
          appointment: data.appointment,
          user: data.user,
          package: data.package,
          packages: data.packages,
          entries: data.entries,
          modules: data.modules,
          providers: data.providers,
        });
        setModules(data.modules);
        setProviders(data.providers);
        setFormData(createInitialFormData(data.modules));
        setWorkflow(createInitialWorkflow(data.modules, data.providers, data));
        setOpenGroups(createInitialOpenState(data.modules));
        setSavedSections(createInitialSavedState(data.modules, data));
        setEditingSections(createInitialEditState(data.modules, data));
        setActiveModuleId(data.modules.find(module => !isModuleCompleted(module))?.id || data.modules[0]?.id || '');
        setPackageListOpen(false);
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
  }, [id, refreshNonce, selectedCamp]);

  const activeModule = modules.find(module => module.id === activeModuleId) || modules[0];
  const activeValues = activeModule ? valuesForModule(formData, activeModule.id) : {};
  const activeWorkflow = activeModule ? workflow[activeModule.id] : undefined;
  const activeGroups = useMemo(() => activeModule ? groupedFields(activeModule.fields) : {}, [activeModule]);
  const providersForActive = activeModule ? providers.filter(provider => provider.category === activeModule.providerCategory || provider.category === 'instant') : [];

  const overallProgress = useMemo(() => {
    const totals = modules.reduce((acc, module) => {
      const progress = getModuleProgress(module, valuesForModule(formData, module.id));
      return {
        completed: acc.completed + progress.completedRequired,
        total: acc.total + progress.requiredTotal,
      };
    }, { completed: 0, total: 0 });
    return totals;
  }, [formData, modules]);

  const appointmentPackages = useMemo(() => {
    if (!details) return [];
    return details.packages?.length ? details.packages : details.package ? [details.package] : [];
  }, [details]);

  const appointmentProviderName = details?.appointment.provider?.name || details?.appointment.provider_name || agent?.provider_name || '';
  const isProviderAttached = !!details?.appointment.provider?.id;
  const showAttachProvider = !!details && !details.appointment.provider?.id;
  const canAttachProvider = !!details && !!agent?.provider_id;

  const handleAttachProvider = async () => {
    if (!details || !selectedCamp || !agent?.provider_id) return;
    const wasProviderAttached = isProviderAttached;
    setAttachingProvider(true);
    setValidationError('');
    setProviderAttachMsg('');
    try {
      await api.attachProviderToAppointment(selectedCamp.id, details.appointment.id, toProviderId(agent.provider_id));
      setProviderAttachMsg(wasProviderAttached ? 'Provider updated successfully' : 'Provider attached successfully');
      setRefreshNonce(value => value + 1);
    } catch (error) {
      console.error(error);
      setValidationError(wasProviderAttached ? 'Could not update provider.' : 'Could not attach provider.');
    } finally {
      setAttachingProvider(false);
    }
  };

  const updateField = (moduleId: string, fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || {}),
        [fieldId]: value,
      },
    }));
    setSavedSections(prev => ({ ...prev, [moduleId]: false }));
    setEditingSections(prev => ({ ...prev, [moduleId]: true }));
    setResultSuccessMsg('');
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
    setEditingSections(prev => ({ ...prev, [moduleId]: true }));
    setResultSuccessMsg('');
    const module = modules.find(item => item.id === moduleId);
    if (next.provider_id && details && module?.appointmentTestId) {
      void api.updateAppointmentTestProvider(details.appointment.camp_id, details.appointment.id, module.appointmentTestId, {
        provider_id: next.provider_id,
      }).catch(error => {
        console.error(error);
        setValidationError(`Could not update ${module.title} provider.`);
      });
    }
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
    const values = valuesForModule(formData, module.id);
    const components = module.fields
      .filter(field => hasEnteredValue(values[field.id]))
      .map(field => ({
        id: toComponentId(field.id),
        type: 'test_component' as const,
        result: normalizeResultValue(field, values[field.id]),
        status: 'done' as const,
      }));

    const missingField = module.fields.find(field => field.required && !hasEnteredValue(values[field.id]));
    if (missingField) {
      setValidationError(`${module.title}: ${missingField.label} is required.`);
      return;
    }

    if (components.length === 0) {
      setValidationError(`Enter at least one result for ${module.title}.`);
      return;
    }

    setSavingSections(prev => ({ ...prev, [module.id]: true }));
    setValidationError('');
    setResultSuccessMsg('');
    try {
      const response = await api.saveTestResults(details.appointment.camp_id, details.appointment.id, { components });
      const responseAppointment = response && typeof response === 'object' ? (response as { appointment?: unknown; message?: unknown }).appointment : null;
      const appointmentTests = responseAppointment && typeof responseAppointment === 'object'
        ? (responseAppointment as { appointment_tests?: unknown }).appointment_tests
        : null;
      const completedIds = new Set(components.map(component => String(component.id)));
      if (Array.isArray(appointmentTests)) {
        appointmentTests.forEach(test => {
          if (test && typeof test === 'object') {
            const item = test as { id?: unknown; result_received?: unknown };
            if (item.result_received) completedIds.add(String(item.id));
          }
        });
      }
      setModules(prev => prev.map(currentModule => currentModule.id === module.id
        ? {
          ...currentModule,
          fields: currentModule.fields.map(field => completedIds.has(field.id)
            ? { ...field, resultReceived: true, defaultValue: values[field.id] }
            : field),
          collectionStatus: 'Completed',
          reportStatus: 'Completed',
        }
        : currentModule));
      setSavedSections(prev => ({ ...prev, [module.id]: true }));
      setEditingSections(prev => ({ ...prev, [module.id]: false }));
      setWorkflow(prev => ({
        ...prev,
        [module.id]: {
          ...prev[module.id],
          collection_status: 'Completed',
          report_status: 'Completed',
        },
      }));
      setResultSuccessMsg(typeof response?.message === 'string' ? response.message : 'Results stored successfully');
    } catch (err) {
      console.error(err);
      setValidationError(`Could not save ${module.title}.`);
    } finally {
      setSavingSections(prev => ({ ...prev, [module.id]: false }));
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

  if (!activeModule) {
    return (
      <div className="empty-state ds-surface mx-auto max-w-xl">
        <div className="empty-state-icon">
          <ClipboardCheck size={28} />
        </div>
        <h2 className="empty-state-title">No medical modules</h2>
      </div>
    );
  }

  const activeClinicalStatus = (activeValues.clinical_status || activeModule.defaultStatus) as ClinicalStatus;
  const visiblePackages = appointmentPackages.slice(0, 3);
  const hiddenPackageCount = Math.max(appointmentPackages.length - visiblePackages.length, 0);

  return (
    <div className="mx-auto max-w-6xl pb-28 md:pb-8">
      <div className="ds-surface mb-4 p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-lt text-brand">
              <UserIcon size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold leading-tight text-n-900">{details.user.full_name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-n-600">
                <span className="rounded bg-n-50 px-1.5 py-0.5 font-mono text-n-700">{details.user.employee_id}</span>
                <span>{details.user.gender}</span>
                <span><span className="font-mono">{details.user.age_label || calculateAge(details.user.dob)}</span>{details.user.age_label ? '' : ' yrs'}</span>
                <span className="font-mono">{details.user.mobile_number}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-info">Apt <span className="font-mono">{details.appointment.unique_id || details.appointment.id}</span></span>
            <span className="badge badge-neutral">{details.appointment.vendor_status || details.appointment.report_state}</span>
            {isProviderAttached && (
              <>
                {appointmentProviderName && <span className="badge badge-neutral">{appointmentProviderName}</span>}
                <span className="badge badge-ok">Attached</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-n-500">
            {appointmentPackages.length > 1 ? 'Packages' : 'Package'}
          </span>
          {appointmentPackages.length ? (
            <>
              {visiblePackages.map(pkg => (
                <button
                  key={pkg.id}
                  type="button"
                  className="min-h-8 rounded-full bg-brand-lt px-3 py-1 text-left text-xs font-bold text-brand transition-colors hover:bg-brand/10 active:bg-brand/15"
                  onClick={() => setPackageListOpen(true)}
                >
                  {pkg.name}
                </button>
              ))}
              {hiddenPackageCount > 0 && (
                <button
                  type="button"
                  className="min-h-8 rounded-full bg-n-100 px-3 py-1 text-xs font-bold text-n-700 transition-colors hover:bg-brand-lt hover:text-brand active:bg-brand/10"
                  onClick={() => setPackageListOpen(true)}
                >
                  +{hiddenPackageCount} More
                </button>
              )}
            </>
          ) : (
            <span className="badge badge-neutral">Package pending</span>
          )}
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

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showAttachProvider ? (
          <button
            type="button"
            className="btn btn-brand btn-sm w-full px-4 font-semibold shadow-sm sm:w-auto"
            onClick={handleAttachProvider}
            disabled={attachingProvider || !canAttachProvider}
            aria-busy={attachingProvider}
          >
            <Link2 size={15} />
            {attachingProvider ? 'Attaching...' : 'Attach Provider'}
          </button>
        ) : isProviderAttached ? (
          <div className="flex w-full flex-col gap-3 rounded-lg border border-n-200 bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {appointmentProviderName && <span className="badge badge-neutral">{appointmentProviderName}</span>}
              <span className="badge badge-ok">Provider Attached</span>
            </div>
            <button
              type="button"
              className="btn btn-brand btn-sm w-full px-4 font-semibold shadow-sm sm:w-auto"
              onClick={handleAttachProvider}
              disabled={attachingProvider || !canAttachProvider}
              aria-busy={attachingProvider}
            >
              <Pencil size={15} />
              {attachingProvider ? 'Updating...' : 'Update Provider'}
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="ds-surface overflow-hidden">
            <div className="border-b border-n-100 bg-n-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-n-600">
              Medical Modules
            </div>
            <div className="divide-y divide-n-100">
              {modules.map(module => {
                const values = valuesForModule(formData, module.id);
                const progress = getModuleProgress(module, values);
                const moduleWorkflow = workflow[module.id];
                const clinicalStatus = (values.clinical_status || module.defaultStatus) as ClinicalStatus;
                const isActive = activeModuleId === module.id;
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => {
                      setActiveModuleId(module.id);
                      setMobileWorkspaceOpen(true);
                    }}
                    className={`flex w-full touch-manipulation items-start gap-3 p-4 text-left transition-colors md:p-5 lg:p-4 ${isActive ? 'bg-brand-lt' : 'hover:bg-n-50 active:bg-brand-lt'}`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${savedSections[module.id] ? 'bg-brand-lt text-brand' : 'bg-n-100 text-n-500'}`}>
                      {savedSections[module.id] ? <CheckCircle2 size={17} /> : <Activity size={17} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-n-900">{module.title}</h3>
                        <ChevronRight size={16} className={`mt-0.5 text-n-400 transition-transform ${isActive ? 'rotate-90 text-brand' : ''}`} />
                      </div>
                      <p className="mt-1 truncate text-xs text-n-500">{moduleCategoryLabel(module)} · {module.providerName || getProviderName(providers, moduleWorkflow?.provider_id)}</p>
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

        <section className="hidden space-y-4 lg:block">
          <ModuleWorkspace
            activeModule={activeModule}
            activeWorkflow={activeWorkflow}
            activeValues={activeValues}
            activeGroups={activeGroups}
            activeClinicalStatus={activeClinicalStatus}
            providersForActive={providersForActive}
            saved={!!savedSections[activeModule.id]}
            editing={!!editingSections[activeModule.id]}
            saving={!!savingSections[activeModule.id]}
            openGroups={openGroups}
            draggingModule={draggingModule}
            onUpdateWorkflow={updateWorkflow}
            onUpdateField={updateField}
            onToggleChip={toggleChip}
            onSetOpenGroups={setOpenGroups}
            onSetDraggingModule={setDraggingModule}
            onAddFiles={addFiles}
            onRemoveUpload={removeUpload}
            onEdit={() => setEditingSections(prev => ({ ...prev, [activeModule.id]: true }))}
            onSave={() => saveModule(activeModule)}
          />

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

          {resultSuccessMsg && (
            <div className="rounded-lg border border-green-m bg-green-lt p-4 text-sm font-semibold text-green">
              <CheckCircle2 className="mr-2 inline" size={18} />
              {resultSuccessMsg}
            </div>
          )}

          {providerAttachMsg && (
            <div className="rounded-lg border border-green-m bg-green-lt p-4 text-sm font-semibold text-green">
              <CheckCircle2 className="mr-2 inline" size={18} />
              {providerAttachMsg}
            </div>
          )}
        </section>
      </div>

      {validationError && (
        <div className="mt-4 rounded-lg border border-rose-m bg-rose-lt p-4 text-sm font-semibold text-rose lg:hidden">
          <Activity className="mr-2 inline" size={18} />
          {validationError}
        </div>
      )}

      {submitSuccess && (
        <div className="mt-4 rounded-lg border border-green-m bg-green-lt p-4 text-sm font-semibold text-green lg:hidden">
          <CheckCircle2 className="mr-2 inline" size={18} />
          Submitted
        </div>
      )}

      {resultSuccessMsg && (
        <div className="mt-4 rounded-lg border border-green-m bg-green-lt p-4 text-sm font-semibold text-green lg:hidden">
          <CheckCircle2 className="mr-2 inline" size={18} />
          {resultSuccessMsg}
        </div>
      )}

      {providerAttachMsg && (
        <div className="mt-4 rounded-lg border border-green-m bg-green-lt p-4 text-sm font-semibold text-green lg:hidden">
          <CheckCircle2 className="mr-2 inline" size={18} />
          {providerAttachMsg}
        </div>
      )}

      {mobileWorkspaceOpen && activeWorkflow && (
        <div className="fixed inset-0 z-[70] bg-n-900/35 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-x-0 bottom-0 flex max-h-[94dvh] flex-col rounded-t-[22px] bg-white shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-n-100 px-4 py-3">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand">{moduleCategoryLabel(activeModule)}</div>
                <h2 className="truncate text-lg font-bold text-n-900">{activeModule.title}</h2>
              </div>
              <button type="button" className="btn btn-icon btn-secondary" aria-label="Close module" onClick={() => setMobileWorkspaceOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ModuleWorkspace
                activeModule={activeModule}
                activeWorkflow={activeWorkflow}
                activeValues={activeValues}
                activeGroups={activeGroups}
                activeClinicalStatus={activeClinicalStatus}
                providersForActive={providersForActive}
                saved={!!savedSections[activeModule.id]}
                editing={!!editingSections[activeModule.id]}
                saving={!!savingSections[activeModule.id]}
                openGroups={openGroups}
                draggingModule={draggingModule}
                compact
                onUpdateWorkflow={updateWorkflow}
                onUpdateField={updateField}
                onToggleChip={toggleChip}
                onSetOpenGroups={setOpenGroups}
                onSetDraggingModule={setDraggingModule}
                onAddFiles={addFiles}
                onRemoveUpload={removeUpload}
                onEdit={() => setEditingSections(prev => ({ ...prev, [activeModule.id]: true }))}
                onSave={async () => {
                  await saveModule(activeModule);
                  if (savedSections[activeModule.id]) setMobileWorkspaceOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {packageListOpen && (
        <div className="fixed inset-0 z-[80] bg-n-900/35 p-0 md:grid md:place-items-center md:p-6" role="dialog" aria-modal="true" aria-labelledby="package-list-title">
          <div className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-hidden rounded-t-[22px] bg-white shadow-xl md:static md:w-full md:max-w-md md:rounded-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-n-100 px-4 py-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand">Appointment Packages</div>
                <h2 id="package-list-title" className="text-lg font-bold text-n-900">
                  {appointmentPackages.length} selected
                </h2>
              </div>
              <button type="button" className="btn btn-icon btn-secondary" aria-label="Close package list" onClick={() => setPackageListOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[64dvh] space-y-3 overflow-y-auto p-4">
              {appointmentPackages.map(pkg => (
                <div key={pkg.id} className="rounded-2xl border border-n-200 bg-n-50 p-3">
                  <div className="font-bold text-n-900">{pkg.name}</div>
                  <div className="mt-1 text-xs font-medium text-n-500">
                    <span className="font-mono text-n-700">{pkg.components.length}</span> tests included
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pkg.components.slice(0, 6).map(component => (
                      <span key={component.id} className="badge badge-neutral text-[11px]">{component.name}</span>
                    ))}
                    {pkg.components.length > 6 && (
                      <span className="badge badge-info text-[11px]">+{pkg.components.length - 6} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ModuleWorkspace({
  activeModule,
  activeWorkflow,
  activeValues,
  activeGroups,
  activeClinicalStatus,
  providersForActive,
  saved,
  editing,
  saving,
  openGroups,
  draggingModule,
  compact = false,
  onUpdateWorkflow,
  onUpdateField,
  onToggleChip,
  onSetOpenGroups,
  onSetDraggingModule,
  onAddFiles,
  onRemoveUpload,
  onEdit,
  onSave,
}: {
  activeModule: MedicalModuleSchema;
  activeWorkflow?: TestWorkflowState;
  activeValues: Record<string, string>;
  activeGroups: Record<string, MedicalField[]>;
  activeClinicalStatus: ClinicalStatus;
  providersForActive: HealthProvider[];
  saved: boolean;
  editing: boolean;
  saving: boolean;
  openGroups: Record<string, boolean>;
  draggingModule: string | null;
  compact?: boolean;
  onUpdateWorkflow: (moduleId: string, next: Partial<TestWorkflowState>) => void;
  onUpdateField: (moduleId: string, fieldId: string, value: string) => void;
  onToggleChip: (moduleId: string, fieldId: string, option: string) => void;
  onSetOpenGroups: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  onSetDraggingModule: (moduleId: string | null) => void;
  onAddFiles: (moduleId: string, files: FileList | File[]) => void;
  onRemoveUpload: (moduleId: string, uploadId: string) => void;
  onEdit: () => void;
  onSave: () => void | Promise<void>;
}) {
  if (!activeWorkflow) return null;
  const collectionStatusOptions = activeModule.collectionStatusOptions?.length
    ? activeModule.collectionStatusOptions
    : activeWorkflow.collection_status
      ? [activeWorkflow.collection_status]
      : collectionStatuses;
  const reportStatusOptions = activeModule.reportStatusOptions?.length
    ? activeModule.reportStatusOptions
    : activeWorkflow.report_status
      ? [activeWorkflow.report_status]
      : reportStatuses;
  const providerOptions = providersForActive.length
    ? providersForActive
    : activeWorkflow.provider_id
      ? [{ id: activeWorkflow.provider_id, name: activeWorkflow.provider_id, category: activeModule.providerCategory, status: 'available' as const }]
      : [];
  const reviewingSaved = saved && !editing;
  const savedResults = activeModule.fields.filter(field => field.resultReceived || hasEnteredValue(activeValues[field.id]));

  return (
    <div className={compact ? 'bg-white' : 'ds-card p-0'}>
      {!compact && (
        <div className="border-b border-n-100 bg-n-50 px-4 py-4 md:px-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-brand">{moduleCategoryLabel(activeModule)}</div>
              <h2 className="mt-1 text-xl font-bold text-n-900">{activeModule.title}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${clinicalStatusClass[activeClinicalStatus]}`}>{activeClinicalStatus}</span>
              <span className={`badge ${workflowBadgeClass[activeWorkflow.collection_status]}`}>{activeWorkflow.collection_status}</span>
            </div>
          </div>
        </div>
      )}

      {compact && (
        <div className="flex flex-wrap gap-2 px-4 pt-4">
          <span className={`badge ${clinicalStatusClass[activeClinicalStatus]}`}>{activeClinicalStatus}</span>
          <span className={`badge ${workflowBadgeClass[activeWorkflow.collection_status]}`}>{activeWorkflow.collection_status}</span>
        </div>
      )}

      <div className={`space-y-5 ${compact ? 'p-4 pb-24' : 'p-4 md:p-5'}`}>
        {!reviewingSaved && (
          <div className="grid gap-3 sm:grid-cols-3 md:gap-4">
            <div className="ds-field">
              <label className="ds-label">Provider</label>
              <select
                className="ds-input"
                value={activeWorkflow.provider_id}
                onChange={(event) => onUpdateWorkflow(activeModule.id, { provider_id: event.target.value })}
              >
                {providerOptions.map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>
            <div className="ds-field">
              <label className="ds-label">Collection Status</label>
              <select
                className="ds-input"
                value={activeWorkflow.collection_status}
                onChange={(event) => onUpdateWorkflow(activeModule.id, { collection_status: event.target.value as SampleCollectionStatus })}
              >
                {collectionStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="ds-field">
              <label className="ds-label">Report Status</label>
              <select
                className="ds-input"
                value={activeWorkflow.report_status}
                onChange={(event) => onUpdateWorkflow(activeModule.id, { report_status: event.target.value as ReportStatus })}
              >
                {reportStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>
        )}

        {reviewingSaved ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {savedResults.map(field => (
                <div key={field.id} className="rounded-lg border border-n-200 bg-n-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-n-900">{field.label}</div>
                      <div className="mt-1 font-mono text-base font-bold text-n-900">{activeValues[field.id] || '-'}</div>
                    </div>
                    <span className="badge badge-ok shrink-0 text-[11px]">Completed</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-ok">Saved</span>
              <span className="badge badge-neutral">{moduleCategoryLabel(activeModule)}</span>
              {activeWorkflow.provider_id && <span className="badge badge-neutral">{activeWorkflow.provider_id}</span>}
            </div>
          </div>
        ) : (
          <div className={`grid gap-4 ${compact ? '' : 'xl:grid-cols-[1fr_300px]'}`}>
          <div className="space-y-3 md:space-y-4">
            {Object.entries(activeGroups).map(([groupName, fields]) => {
              const groupKey = `${activeModule.id}:${groupName}`;
              const isOpen = openGroups[groupKey] ?? true;
              return (
                <div key={groupName} className="clinical-field-group">
                  <button
                    type="button"
                    className="clinical-field-group-title flex min-h-12 w-full touch-manipulation items-center justify-between text-left"
                    onClick={() => onSetOpenGroups(prev => ({ ...prev, [groupKey]: !isOpen }))}
                  >
                    <span>{groupName}</span>
                    <ChevronRight size={15} className={`transition-transform ${isOpen ? 'rotate-90 text-brand' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="grid grid-cols-2 gap-3 p-3 md:gap-4 md:p-4">
                      {fields.map(field => (
                        <MedicalFieldControl
                          key={field.id}
                          moduleId={activeModule.id}
                          field={field}
                          value={activeValues[field.id] || ''}
                          onChange={onUpdateField}
                          onToggleChip={onToggleChip}
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
                    onSetDraggingModule(activeModule.id);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={() => onSetDraggingModule(null)}
                  onDrop={(event) => {
                    event.preventDefault();
                    onSetDraggingModule(null);
                    onAddFiles(activeModule.id, event.dataTransfer.files);
                  }}
                >
                  <UploadCloud className="mx-auto mb-2 text-n-400" size={30} />
                  <div className="text-sm font-bold text-n-800">Upload reports</div>
                  <div className="mt-1 text-xs text-n-500">PDF, image, scan, or camera upload</div>
                  <input
                    type="file"
                    className="sr-only"
                    accept="application/pdf,image/*"
                    multiple
                    capture="environment"
                    onChange={(event) => {
                      if (event.target.files) onAddFiles(activeModule.id, event.target.files);
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
                    <button type="button" className="btn btn-icon btn-sm btn-secondary" aria-label="Delete report" onClick={() => onRemoveUpload(activeModule.id, upload.id)}>
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
        )}

        <div className={`${compact ? 'fixed inset-x-0 bottom-0 z-[75] border-t border-n-200 bg-white p-4' : 'sticky bottom-20 z-20 -mx-4 border-t border-n-100 bg-white/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:flex md:justify-end md:border-t'}`}>
          <button
            type="button"
            className={`btn ${saved ? 'btn-secondary border-brand-m text-brand' : 'btn-primary'} btn-lg w-full md:w-auto ${saving ? 'btn-loading' : ''}`}
            onClick={() => reviewingSaved ? onEdit() : void onSave()}
            disabled={saving}
          >
            {saving ? (
              'Saving...'
            ) : reviewingSaved ? (
              'Update'
            ) : saved ? (
              <>
                <Save size={18} /> Update {activeModule.title}
              </>
            ) : (
              <>
                <Save size={18} /> Save {activeModule.title}
              </>
            )}
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
        <span className={`ml-2 badge ${field.resultReceived ? 'badge-ok' : 'badge-neutral'} text-[10px]`}>
          {field.resultReceived ? 'Completed' : 'Pending'}
        </span>
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
