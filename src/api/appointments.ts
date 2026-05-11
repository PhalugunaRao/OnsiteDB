import { apiClient, getApiErrorMessage } from './client';
import {
  asArray,
  asRecord,
  extractProvidersFromSections,
  firstValue,
  normalizeAppointment,
  normalizeEntry,
  normalizePackage,
  normalizeProvider,
  normalizeTestModule,
  normalizeUser,
  unwrapApiData,
} from './normalizers';
import type {
  Appointment,
  ComponentEntry,
  HealthProvider,
  MedicalModuleSchema,
  Package,
  User,
  UserSearchResult,
} from '../types';

export type AppointmentResult = Appointment & {
  user?: User;
  package?: Package;
};

export interface AppointmentDetails {
  appointment: Appointment;
  user: User;
  package?: Package;
  packages?: Package[];
  entries: ComponentEntry[];
  modules: MedicalModuleSchema[];
  providers: HealthProvider[];
}

export interface TestResultComponentPayload {
  id: string | number;
  type: 'test_component';
  result: string | number | boolean;
  status: 'done';
}

export interface SaveTestResultsPayload {
  components: TestResultComponentPayload[];
}

const extractAppointmentList = (payload: unknown) => {
  const source = asRecord(payload);
  if (source.customer || source.appointment) return [payload];
  return asArray(
    source.appointments
    || source.results
    || source.items
    || source.records
    || source.data
    || payload
  );
};

const normalizeAppointmentSearchItem = (value: unknown, campId: string): AppointmentResult => {
  const source = asRecord(value);
  const appointmentPayload = source.appointment || source.booking || source;
  const userPayload = source.customer || source.user || source.employee || source.member || asRecord(source.appointment).user;
  const packagePayload = source.package || source.health_package || asRecord(source.appointment).package || {
    name: firstValue(asRecord(appointmentPayload), ['package_name']),
  };
  const appointment = normalizeAppointment(appointmentPayload, { camp_id: campId });
  return {
    ...appointment,
    user: userPayload ? normalizeUser(userPayload) : undefined,
    package: packagePayload ? normalizePackage(packagePayload) : undefined,
  };
};

export const searchAppointments = async (campId: string, term: string): Promise<AppointmentResult[]> => {
  if (import.meta.env.DEV) console.log('SEARCH QUERY', term);
  try {
    const response = await apiClient.get(`/v3/onsite/camps/${campId}/search`, { params: { q: term } });
    if (import.meta.env.DEV) {
      console.group('SEARCH APPOINTMENTS');
      console.log('QUERY', term);
      console.log('RESPONSE', response.data);
      console.groupEnd();
    }
    const payload = unwrapApiData(response.data);
    return extractAppointmentList(payload).map(item => normalizeAppointmentSearchItem(item, campId));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to search appointments'), { cause: error });
  }
};

export const searchUser = async (campId: string, term: string): Promise<UserSearchResult | null> => {
  const results = await searchAppointments(campId, term);
  const first = results[0];
  if (!first?.user) return null;
  return {
    user: first.user,
    appointment: first,
    package: first.package,
    entries: [],
  };
};

const extractSections = (payload: unknown) => {
  const source = asRecord(payload);
  return asArray(
    source.test_sections
    || source.sections
    || source.modules
    || source.appointment_tests
    || source.sample_collections
  );
};

const normalizeAppointmentDetails = (
  detailsPayload: unknown,
  sectionsPayload: unknown,
  campId: string,
  appointmentId: string
): AppointmentDetails => {
  const detailsSource = asRecord(detailsPayload);
  const sectionsSource = asRecord(sectionsPayload);
  const appointmentPayload = detailsSource.appointment || detailsSource;
  const customerPayload = detailsSource.customer || asRecord(appointmentPayload).customer || detailsSource.user || detailsSource.member;
  const packagePayload = detailsSource.package || asRecord(appointmentPayload).package || {
    name: firstValue(asRecord(appointmentPayload), ['package_name']),
  };
  const providerPayload = detailsSource.provider || asRecord(appointmentPayload).provider || {
    id: firstValue(asRecord(appointmentPayload), ['provider_id']),
    name: firstValue(asRecord(appointmentPayload), ['provider_name']),
  };
  const sectionRows = extractSections(sectionsPayload);
  const appointmentTests = asArray(detailsSource.appointment_tests || asRecord(appointmentPayload).appointment_tests);
  const rawSections = sectionRows.length
    ? sectionRows
    : appointmentTests.map(test => ({
      section: firstValue(asRecord(test), ['test_name', 'category'], 'Tests'),
      tests: [test],
    }));
  const modules = rawSections.map(normalizeTestModule).filter(module => module.fields.length > 0);
  const directProviders = [
    providerPayload,
    ...asArray(detailsSource.providers || sectionsSource.providers || detailsSource.health_providers),
  ].filter(Boolean).map(provider => normalizeProvider(provider));
  const sectionProviders = extractProvidersFromSections(modules, rawSections);
  const providers = [...directProviders, ...sectionProviders].reduce((map, provider) => {
    map.set(provider.id, provider);
    return map;
  }, new Map<string, HealthProvider>());
  const appointment = normalizeAppointment(appointmentPayload, {
    id: appointmentId,
    camp_id: campId,
    provider_id: firstValue(asRecord(providerPayload), ['id', 'provider_id']),
    provider_name: firstValue(asRecord(providerPayload), ['name', 'provider_name']),
    package_name: firstValue(asRecord(packagePayload), ['name', 'package_name']),
  });
  const sampleCollections = asArray(
    sectionsSource.sample_collections
    || detailsSource.sample_collections
    || asRecord(appointmentPayload).sample_collections
  );

  return {
    appointment,
    user: normalizeUser(customerPayload),
    package: normalizePackage(packagePayload),
    packages: packagePayload ? [normalizePackage(packagePayload)] : [],
    entries: sampleCollections.map(entry => normalizeEntry(entry, {
      appointment_id: appointmentId,
      camp_id: campId,
    })),
    modules,
    providers: [...providers.values()],
  };
};

export const getAppointmentDetails = async (campId: string, appointmentId: string): Promise<AppointmentDetails> => {
  try {
    const [detailsResponse, sectionsResponse] = await Promise.all([
      apiClient.get(`/v3/onsite/camps/${campId}/appointments/${appointmentId}`),
      apiClient.get(`/v3/onsite/camps/${campId}/appointments/${appointmentId}/test_sections`),
    ]);
    if (import.meta.env.DEV) {
      console.group('APPOINTMENT DETAILS');
      console.log('RESPONSE', detailsResponse.data);
      console.groupEnd();
      console.group('TEST SECTIONS RESPONSE');
      console.log('RESPONSE', sectionsResponse.data);
      console.groupEnd();
    }
    return normalizeAppointmentDetails(
      unwrapApiData(detailsResponse.data),
      unwrapApiData(sectionsResponse.data),
      campId,
      appointmentId
    );
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to fetch appointment details'), { cause: error });
  }
};

export const getTestSections = async (campId: string, appointmentId: string): Promise<AppointmentDetails> => {
  try {
    const response = await apiClient.get(`/v3/onsite/camps/${campId}/appointments/${appointmentId}/test_sections`);
    if (import.meta.env.DEV) {
      console.group('TEST SECTIONS RESPONSE');
      console.log('RESPONSE', response.data);
      console.groupEnd();
    }
    return normalizeAppointmentDetails({}, unwrapApiData(response.data), campId, appointmentId);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to fetch test sections'), { cause: error });
  }
};

export const saveSampleCollection = async (
  campId: string,
  appointmentId: string,
  sampleCollectionId: string,
  payload: Record<string, unknown>
): Promise<ComponentEntry> => {
  if (import.meta.env.DEV) console.log('SAVE SAMPLE REQUEST', payload);
  try {
    const response = await apiClient.put(
      `/v3/onsite/camps/${campId}/appointments/${appointmentId}/sample_collections/${sampleCollectionId}`,
      payload
    );
    if (import.meta.env.DEV) console.log('SAVE SAMPLE RESPONSE', response.data);
    return normalizeEntry(unwrapApiData(response.data), {
      id: sampleCollectionId,
      appointment_id: appointmentId,
      camp_id: campId,
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to save sample collection'), { cause: error });
  }
};

export const saveTestResults = async (
  campId: string,
  appointmentId: string,
  payload: SaveTestResultsPayload
) => {
  try {
    const response = await apiClient.put(
      `/v3/onsite/camps/${campId}/appointments/${appointmentId}/test_results`,
      payload
    );
    if (import.meta.env.DEV) {
      console.group('SAVE TEST RESULTS');
      console.log('PAYLOAD', payload);
      console.log('RESPONSE', response.data);
      console.groupEnd();
    }
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to save test results'), { cause: error });
  }
};

export const updateAppointmentTestProvider = async (
  campId: string,
  appointmentId: string,
  appointmentTestId: string,
  payload: Record<string, unknown>
) => {
  if (import.meta.env.DEV) console.log('PROVIDER UPDATE REQUEST', payload);
  try {
    const response = await apiClient.put(
      `/v3/onsite/camps/${campId}/appointments/${appointmentId}/appointment_tests/${appointmentTestId}`,
      payload
    );
    if (import.meta.env.DEV) console.log('PROVIDER UPDATE RESPONSE', response.data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to update provider'), { cause: error });
  }
};

export const attachProviderToAppointment = async (
  campId: string,
  appointmentId: string,
  providerId: string | number
) => {
  try {
    const response = await apiClient.put(
      `/v3/onsite/camps/${campId}/appointments/${appointmentId}`,
      { provider_id: providerId }
    );
    if (import.meta.env.DEV) {
      console.group('ATTACH PROVIDER');
      console.log('PROVIDER ID', providerId);
      console.log('RESPONSE', response.data);
      console.groupEnd();
    }
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to attach provider'), { cause: error });
  }
};

export const createBooking = async (request?: Record<string, unknown>): Promise<{ appointment_id: string }> => {
  void request;
  throw new Error('Booking API endpoint is not configured for this app.');
};

export const appointmentIdFromResult = (result: UserSearchResult) => (
  firstValue(asRecord(result.appointment), ['id', 'appointment_id'])
);
