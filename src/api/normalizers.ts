import type {
  Agent,
  Appointment,
  Camp,
  ComponentEntry,
  HealthProvider,
  MedicalField,
  MedicalFieldType,
  MedicalModuleSchema,
  Package,
  PackageComponent,
  ProviderCategory,
  ReportStatus,
  SampleCollectionStatus,
  User,
} from '../types';

type AnyRecord = Record<string, unknown>;

const providerCategories: ProviderCategory[] = ['blood', 'external_lab', 'ecg', 'radiology', 'instant'];
const clinicalStatuses = ['Normal', 'Attention Required', 'Critical', 'Pending Review', 'Verified'] as const;

export const isRecord = (value: unknown): value is AnyRecord => (
  !!value && typeof value === 'object' && !Array.isArray(value)
);

export const asRecord = (value: unknown): AnyRecord => (isRecord(value) ? value : {});

export const unwrapApiData = (value: unknown): unknown => {
  const root = asRecord(value);
  if ('data' in root && root.data !== undefined) {
    const nested = asRecord(root.data);
    if ('data' in nested && nested.data !== undefined) return nested.data;
    return root.data;
  }
  return value;
};

export const asArray = <T = unknown>(value: unknown): T[] => (Array.isArray(value) ? value as T[] : []);

export const firstValue = (source: AnyRecord, keys: string[], fallback = '') => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return fallback;
};

export const firstNumber = (source: AnyRecord, keys: string[], fallback = 0) => {
  for (const key of keys) {
    const value = source[key];
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

export const slugify = (value: string) => (
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'item'
);

const normalizeDate = (value: unknown) => {
  if (typeof value === 'string' && value) return value;
  return new Date().toISOString();
};

const normalizeGender = (value: unknown): User['gender'] => {
  if (value === 'Male' || value === 'Female' || value === 'Other') return value;
  const normalized = String(value || '').toLowerCase();
  if (normalized.startsWith('m')) return 'Male';
  if (normalized.startsWith('f')) return 'Female';
  return 'Other';
};

const normalizeBookingStatus = (value: unknown): Appointment['booking_status'] => {
  if (value === 'success' || value === 'failure' || value === 'pending') return value;
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('fail')) return 'failure';
  if (normalized.includes('success') || normalized.includes('complete') || normalized.includes('confirm')) return 'success';
  return 'pending';
};

const normalizeAppointmentState = (value: unknown): Appointment['appointment_state'] => {
  if (value === 'booking_created' || value === 'sample_pending' || value === 'partial_completed' || value === 'processing') return value;
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('sample')) return 'sample_pending';
  if (normalized.includes('partial')) return 'partial_completed';
  if (normalized.includes('process')) return 'processing';
  return 'booking_created';
};

const normalizeReportState = (value: unknown): Appointment['report_state'] => {
  if (value === 'pending' || value === 'generated' || value === 'shared') return value;
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('share')) return 'shared';
  if (normalized.includes('generat') || normalized.includes('complete')) return 'generated';
  return 'pending';
};

export const normalizeAgent = (value: unknown, mobileNumber = ''): Agent => {
  const source = asRecord(value);
  const providerName = firstValue(source, ['provider_name']);
  return {
    id: firstValue(source, ['id', 'agent_id', 'uuid'], mobileNumber || 'agent'),
    name: firstValue(source, ['name', 'full_name', 'agent_name'], providerName || mobileNumber || 'Onsite Agent'),
    mobile_number: firstValue(source, ['mobile_number', 'mobile', 'phone'], mobileNumber),
    provider_id: firstValue(source, ['provider_id']),
    provider_name: providerName,
    role: firstValue(source, ['role', 'role_name', 'designation'], 'Camp Partner Agent'),
    is_active: source.is_active === undefined ? true : Boolean(source.is_active),
  };
};

export const normalizeCamp = (value: unknown): Camp => {
  const source = asRecord(value);
  const provider = asRecord(source.provider);
  const organization = asRecord(source.organization || source.company);
  const location = asRecord(source.location);
  const start = firstValue(source, ['start_date', 'starts_at', 'camp_start_date', 'date'], normalizeDate(source.start_time));
  const end = firstValue(source, ['end_date', 'ends_at', 'camp_end_date'], start);

  const companyName = firstValue(source, ['company_name', 'organization_name', 'client_name'], firstValue(organization, ['name']));
  return {
    id: firstValue(source, ['id', 'camp_id', 'uuid']),
    company_name: companyName,
    company_id: firstValue(source, ['company_id'], firstValue(organization, ['id'])),
    name: firstValue(source, ['name', 'camp_name', 'title'], companyName),
    organization_name: companyName,
    provider_id: firstValue(source, ['provider_id'], firstValue(provider, ['id'])),
    provider_name: firstValue(source, ['provider_name'], firstValue(provider, ['name'])),
    provider_logo: firstValue(source, ['provider_logo', 'provider_logo_url'], firstValue(provider, ['logo', 'logo_url'])),
    company_logo: source.company_logo === null ? null : firstValue(source, ['company_logo', 'company_logo_url']),
    start_date: start,
    end_date: end,
    timing: firstValue(source, ['timing', 'time', 'slot', 'camp_time']),
    assigned_agent_count: firstNumber(source, ['assigned_agent_count', 'agents_count', 'agent_count']),
    location: firstValue(source, ['location_name', 'location', 'venue'], firstValue(location, ['name', 'city'])),
    address: firstValue(source, ['address', 'venue_address'], firstValue(location, ['address'])),
    notes: firstValue(source, ['notes']),
    status: String(source.status || 'active').toLowerCase() as Camp['status'],
  };
};

export const normalizeUser = (value: unknown): User => {
  const source = asRecord(value);
  const company = asRecord(source.company || source.organization);
  const age = asRecord(source.age);
  const year = firstValue(age, ['year']);
  const month = firstValue(age, ['month']);
  return {
    id: firstValue(source, ['id', 'user_id', 'member_id', 'employee_uuid']),
    customer_id: firstValue(source, ['customer_id']),
    full_name: firstValue(source, ['full_name', 'name', 'employee_name', 'member_name']),
    gender: normalizeGender(source.gender),
    dob: firstValue(source, ['dob', 'date_of_birth', 'birth_date'], ''),
    age_label: year ? `${year}y${month ? ` ${month}m` : ''}` : '',
    employee_id: firstValue(source, ['employee_id', 'emp_id', 'employee_code', 'external_id', 'customer_id']),
    mobile_number: firstValue(source, ['mobile_number', 'mobile', 'phone', 'contact']),
    email: firstValue(source, ['email', 'email_id']),
    company: firstValue(source, ['company_name', 'organization_name'], firstValue(company, ['name'])),
  };
};

export const normalizeAppointment = (value: unknown, fallback: Partial<Appointment> = {}): Appointment => {
  const source = asRecord(value);
  return {
    id: firstValue(source, ['id', 'appointment_id', 'booking_id'], fallback.id || ''),
    unique_id: firstValue(source, ['unique_id'], fallback.unique_id),
    user_id: firstValue(source, ['user_id', 'member_id', 'employee_id'], fallback.user_id || ''),
    camp_id: firstValue(source, ['camp_id'], fallback.camp_id || ''),
    provider_id: firstValue(source, ['provider_id'], fallback.provider_id || ''),
    provider_name: firstValue(source, ['provider_name'], fallback.provider_name),
    package_id: firstValue(source, ['package_id', 'health_package_id'], fallback.package_id || ''),
    package_name: firstValue(source, ['package_name'], fallback.package_name),
    booking_status: normalizeBookingStatus(source.booking_status || source.vendor_status || source.status || fallback.booking_status),
    vendor_status: firstValue(source, ['vendor_status', 'status'], fallback.vendor_status),
    appointment_state: normalizeAppointmentState(source.appointment_state || source.state || fallback.appointment_state),
    report_state: normalizeReportState(source.report_state || source.report_status || fallback.report_state),
    created_by_agent_id: firstValue(source, ['created_by_agent_id', 'agent_id'], fallback.created_by_agent_id || ''),
    created_at: normalizeDate(source.created_at || source.booked_at || source.appointment_date || fallback.created_at),
    updated_at: normalizeDate(source.updated_at || fallback.updated_at),
    appointment_date: firstValue(source, ['appointment_date'], fallback.appointment_date),
    time: firstValue(source, ['time', 'appointment_time'], fallback.time),
  };
};

const normalizeProviderCategory = (value: unknown, fallbackTitle = ''): ProviderCategory => {
  const normalized = String(value || fallbackTitle).toLowerCase().replace(/\s+/g, '_');
  if (providerCategories.includes(normalized as ProviderCategory)) return normalized as ProviderCategory;
  if (normalized.includes('blood') || normalized.includes('thyro')) return 'blood';
  if (normalized.includes('ecg') || normalized.includes('cardio')) return 'ecg';
  if (normalized.includes('radio') || normalized.includes('xray') || normalized.includes('x_ray') || normalized.includes('x-ray')) return 'radiology';
  if (normalized.includes('lab') || normalized.includes('urine')) return 'external_lab';
  return 'instant';
};

export const normalizeProvider = (value: unknown, categoryHint?: ProviderCategory): HealthProvider => {
  const source = asRecord(value);
  const name = firstValue(source, ['name', 'provider_name', 'title'], 'Provider');
  return {
    id: firstValue(source, ['id', 'provider_id', 'uuid'], slugify(name)),
    name,
    category: normalizeProviderCategory(source.category || source.provider_category || source.type, categoryHint),
    status: String(source.status || 'available').toLowerCase() as HealthProvider['status'],
  };
};

const normalizeComponentType = (value: unknown): PackageComponent['type'] => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('bool')) return 'boolean';
  if (normalized.includes('select') || normalized.includes('option')) return 'options';
  if (normalized.includes('number') || normalized.includes('numeric') || normalized.includes('decimal')) return 'numeric';
  return 'text';
};

const normalizeFieldType = (value: unknown): MedicalFieldType => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('textarea') || normalized.includes('remarks')) return 'textarea';
  if (normalized.includes('chip') || normalized.includes('multi')) return 'chips';
  if (normalized.includes('select') || normalized.includes('option')) return 'select';
  if (normalized.includes('bool')) return 'boolean';
  if (normalized.includes('number') || normalized.includes('numeric') || normalized.includes('decimal')) return 'number';
  return 'text';
};

export const normalizePackage = (value: unknown): Package => {
  const source = asRecord(value);
  const components = asArray(source.components || source.tests || source.package_components).map((component, index) => {
    const item = asRecord(component);
    const name = firstValue(item, ['name', 'test_name', 'component_name'], `Test ${index + 1}`);
    const section = firstValue(item, ['section', 'section_name', 'category'], 'Tests');
    return {
      id: firstValue(item, ['id', 'component_id', 'test_id'], `${slugify(section)}-${slugify(name)}-${index}`),
      name,
      section,
      type: normalizeComponentType(item.type || item.input_type || item.value_type),
      options: asArray<string>(item.options),
      unit: firstValue(item, ['unit', 'units']),
      input_mode: firstValue(item, ['input_mode', 'mode']) as PackageComponent['input_mode'],
      provider_category: normalizeProviderCategory(item.provider_category || item.category, section),
      required: item.required === undefined ? Boolean(item.is_required) : Boolean(item.required),
    };
  });

  return {
    id: firstValue(source, ['id', 'package_id', 'health_package_id'], slugify(firstValue(source, ['name', 'package_name'], 'package'))),
    name: firstValue(source, ['name', 'package_name', 'title'], 'No Package'),
    components,
  };
};

const normalizeClinicalStatus = (value: unknown): MedicalModuleSchema['defaultStatus'] => {
  const normalized = String(value || '').toLowerCase();
  const match = clinicalStatuses.find(status => status.toLowerCase() === normalized);
  if (match) return match;
  if (normalized.includes('complete') || normalized.includes('verified')) return 'Verified';
  if (normalized.includes('critical')) return 'Critical';
  if (normalized.includes('attention') || normalized.includes('abnormal')) return 'Attention Required';
  if (normalized.includes('normal')) return 'Normal';
  return 'Pending Review';
};

const normalizeStatusOptions = <T extends string>(value: unknown, current?: T): T[] => {
  const values = asArray(value)
    .map(option => typeof option === 'string' ? option : firstValue(asRecord(option), ['name', 'label', 'status']))
    .filter(Boolean) as T[];
  if (current && !values.includes(current)) values.unshift(current);
  return [...new Set(values)];
};

export const normalizeEntry = (value: unknown, fallback: Partial<ComponentEntry> = {}): ComponentEntry => {
  const source = asRecord(value);
  const uploads = asArray(source.uploads || source.attachments || source.uploaded_reports || source.reports).map((upload, index) => {
    const item = asRecord(upload);
    return {
      id: firstValue(item, ['id'], `${fallback.id || source.id || 'upload'}-${index}`),
      name: firstValue(item, ['name', 'file_name', 'filename', 'url'], `Report ${index + 1}`),
      type: firstValue(item, ['type', 'content_type', 'mime_type'], 'file'),
      size: firstNumber(item, ['size']),
      uploaded_at: firstValue(item, ['uploaded_at', 'created_at'], new Date().toISOString()),
    };
  });
  return {
    id: firstValue(source, ['id', 'entry_id', 'sample_collection_id'], fallback.id || ''),
    appointment_id: firstValue(source, ['appointment_id'], fallback.appointment_id),
    temporary_local_id: firstValue(source, ['temporary_local_id'], fallback.temporary_local_id),
    user_id: firstValue(source, ['user_id'], fallback.user_id || ''),
    camp_id: firstValue(source, ['camp_id'], fallback.camp_id || ''),
    package_component_id: firstValue(source, ['package_component_id', 'test_id', 'component_id'], fallback.package_component_id || ''),
    section_name: firstValue(source, ['section_name', 'section'], fallback.section_name || ''),
    values: {
      ...asRecord(source.values || source.result_values || source.results),
      uploads,
    },
    status: String(source.status || fallback.status || 'draft_saved') as ComponentEntry['status'],
    saved_by: firstValue(source, ['saved_by', 'agent_id'], fallback.saved_by || ''),
    saved_at: normalizeDate(source.saved_at || source.created_at || fallback.saved_at),
    last_modified_at: normalizeDate(source.last_modified_at || source.updated_at || fallback.last_modified_at),
  };
};

export const normalizeTestModule = (section: unknown, index: number): MedicalModuleSchema => {
  const source = asRecord(section);
  const title = firstValue(source, ['section', 'title', 'name', 'section_name', 'test_name'], `Section ${index + 1}`);
  const tests = asArray(source.tests || source.components || source.appointment_tests || source.sample_collections);
  const firstTest = asRecord(tests[0]);
  const categoryText = firstValue(source, ['category'], firstValue(firstTest, ['category'], title));
  const category = normalizeProviderCategory(source.provider_category || categoryText, title);
  const provider = asRecord(source.provider);
  const providerId = firstValue(source, ['provider_id'], firstValue(provider, ['id', 'provider_id'], firstValue(firstTest, ['provider_id'])));
  const providerName = firstValue(source, ['provider_name'], firstValue(provider, ['name', 'provider_name'], firstValue(firstTest, ['provider_name'])));
  const resultReceived = source.result_received ?? firstTest.result_received;
  const collectionStatus = (resultReceived === true ? 'Completed' : firstValue(source, ['collection_status', 'sample_status', 'status'], 'Pending')) as SampleCollectionStatus;
  const reportStatus = firstValue(source, ['report_status'], 'Pending') as ReportStatus;

  const fields: MedicalField[] = tests.map((test, testIndex) => {
    const item = asRecord(test);
    const name = firstValue(item, ['test_component', 'label', 'name', 'test_name', 'component_name'], `Test ${testIndex + 1}`);
    return {
      id: firstValue(item, ['field_id', 'id', 'test_id', 'component_id'], `${slugify(title)}-${slugify(name)}-${testIndex}`),
      label: name,
      type: normalizeFieldType(item.field_type || item.type || item.input_type || item.value_type),
      group: firstValue(item, ['group', 'group_name', 'category', 'section_name'], title),
      required: item.required === undefined ? Boolean(item.is_required) : Boolean(item.required),
      unit: firstValue(item, ['unit', 'units']),
      placeholder: firstValue(item, ['placeholder']),
      options: normalizeStatusOptions<string>(item.options),
      normalRange: firstValue(item, ['normal_range', 'range', 'reference_range']),
      statusSensitive: Boolean(item.status_sensitive),
      defaultValue: firstValue(item, ['result', 'result_value', 'value']),
      resultReceived: Boolean(item.result_received),
    };
  });

  return {
    id: firstValue(source, ['id', 'section_id', 'key'], slugify(title)),
    title,
    providerCategory: category,
    allowAttachments: source.allow_attachments === undefined ? true : Boolean(source.allow_attachments || source.attachments_supported || tests.some(test => {
      const item = asRecord(test);
      return String(item.input_mode || item.type || '').toLowerCase().includes('attachment');
    })),
    defaultStatus: normalizeClinicalStatus(source.clinical_status || source.status),
    sampleCollectionId: firstValue(source, ['sample_collection_id', 'sample_id', 'id']),
    appointmentTestId: firstValue(source, ['appointment_test_id', 'test_assignment_id', 'id'], firstValue(firstTest, ['id'])),
    providerId,
    providerName,
    category: categoryText,
    collectionStatus,
    reportStatus,
    collectionStatusOptions: normalizeStatusOptions<SampleCollectionStatus>(source.collection_statuses || source.sample_statuses || source.status_options, collectionStatus),
    reportStatusOptions: normalizeStatusOptions<ReportStatus>(source.report_statuses, reportStatus),
    fields,
  };
};

export const extractProvidersFromSections = (sections: MedicalModuleSchema[], rawSections: unknown[]) => {
  const providers = rawSections.flatMap((section, index) => {
    const source = asRecord(section);
    const module = sections[index];
    const direct = [
      ...asArray(source.providers),
      source.provider,
      ...asArray(source.tests || source.components || source.appointment_tests).map(test => asRecord(test).provider),
    ].filter(Boolean);
    return direct.map(provider => normalizeProvider(provider, module.providerCategory));
  });

  const byId = new Map<string, HealthProvider>();
  providers.forEach(provider => byId.set(provider.id, provider));
  sections.forEach(section => {
    if (section.providerId && !byId.has(section.providerId)) {
      byId.set(section.providerId, {
        id: section.providerId,
        name: section.providerId,
        category: section.providerCategory,
        status: 'available',
      });
    }
  });
  return [...byId.values()];
};
