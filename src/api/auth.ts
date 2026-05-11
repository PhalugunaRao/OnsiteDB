import {
  AGENT_STORAGE_KEY,
  CAMPS_STORAGE_KEY,
  SELECTED_CAMP_STORAGE_KEY,
  apiClient,
  clearStoredAuth,
  getApiErrorMessage,
  setStoredAuthTokens,
} from './client';
import { asArray, asRecord, firstValue, normalizeAgent, normalizeCamp, unwrapApiData } from './normalizers';
import type { Agent, Camp } from '../types';

const normalizeIndianMobile = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits;
};

export const isValidIndianMobile = (value: string) => /^[6-9]\d{9}$/.test(normalizeIndianMobile(value));

const extractCamps = (payload: unknown): Camp[] => {
  const source = asRecord(payload);
  const camps = source.camps || source.active_camps || source.activeCamps || source.camp;
  if (Array.isArray(camps)) return camps.map(normalizeCamp);
  if (camps) return [normalizeCamp(camps)];
  return [];
};

export interface VerifyOtpResult {
  agent: Agent;
  activeCamps: Camp[];
  xAgentKey: string;
  token: string;
}

export const sendOtp = async (mobile: string) => {
  const mobileNumber = normalizeIndianMobile(mobile);
  if (!isValidIndianMobile(mobileNumber)) throw new Error('Enter a valid Indian mobile number.');

  const payload = { mobile_number: mobileNumber };
  if (import.meta.env.DEV) console.log('SEND OTP REQUEST', payload);

  try {
    const response = await apiClient.post('/v3/onsite/sessions/send_otp', payload);
    if (import.meta.env.DEV) console.log('SEND OTP RESPONSE', response.data);
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) console.log('SEND OTP ERROR', error);
    throw new Error(getApiErrorMessage(error, 'Unable to send OTP'), { cause: error });
  }
};

export const verifyOtp = async (mobile: string, otp: string): Promise<VerifyOtpResult> => {
  const mobileNumber = normalizeIndianMobile(mobile);
  const payload = { mobile_number: mobileNumber, otp };
  if (import.meta.env.DEV) console.log('VERIFY OTP REQUEST', payload);

  try {
    const response = await apiClient.post('/v3/onsite/sessions/verify_otp', payload);
    if (import.meta.env.DEV) console.log('VERIFY OTP RESPONSE', response.data);
    const payloadData = unwrapApiData(response.data);
    const source = asRecord(payloadData);
    const token = firstValue(source, ['token']);
    if (import.meta.env.DEV) console.log('X-AGENT-KEY', token);

    if (!token) throw new Error('X-AGENT-KEY missing from verify OTP response.');

    setStoredAuthTokens(token);

    const agentPayload = source.agent || {};
    const agent = normalizeAgent(agentPayload, mobileNumber);
    const activeCamps = extractCamps(payloadData);
    localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agent));
    localStorage.setItem(CAMPS_STORAGE_KEY, JSON.stringify(activeCamps));
    sessionStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agent));
    sessionStorage.setItem(CAMPS_STORAGE_KEY, JSON.stringify(activeCamps));
    return {
      agent,
      activeCamps,
      xAgentKey: token,
      token,
    };
  } catch (error) {
    if (import.meta.env.DEV) console.log('VERIFY OTP ERROR', error);
    throw new Error(getApiErrorMessage(error, 'Invalid OTP'), { cause: error });
  }
};

export const logout = async () => {
  try {
    const response = await apiClient.delete('/v3/onsite/logout');
    if (import.meta.env.DEV) console.log('LOGOUT RESPONSE', response.data);
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) console.log('LOGOUT ERROR', error);
    throw new Error(getApiErrorMessage(error, 'Unable to logout'), { cause: error });
  } finally {
    clearStoredAuth();
  }
};

export const hydrateAuthState = () => {
  try {
    const rawAgent = localStorage.getItem(AGENT_STORAGE_KEY) || sessionStorage.getItem(AGENT_STORAGE_KEY);
    const rawCamps = localStorage.getItem(CAMPS_STORAGE_KEY) || sessionStorage.getItem(CAMPS_STORAGE_KEY);
    const rawSelectedCamp = localStorage.getItem(SELECTED_CAMP_STORAGE_KEY) || sessionStorage.getItem(SELECTED_CAMP_STORAGE_KEY);
    return {
      agent: rawAgent ? normalizeAgent(JSON.parse(rawAgent)) : null,
      activeCamps: rawCamps ? asArray(JSON.parse(rawCamps)).map(normalizeCamp) : [],
      selectedCamp: rawSelectedCamp ? normalizeCamp(JSON.parse(rawSelectedCamp)) : null,
    };
  } catch {
    return null;
  }
};

export const persistAuthState = (state: { agent: Agent | null; activeCamps: Camp[]; selectedCamp: Camp | null }) => {
  if (state.agent) {
    localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(state.agent));
    sessionStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(state.agent));
  }
  localStorage.setItem(CAMPS_STORAGE_KEY, JSON.stringify(state.activeCamps));
  sessionStorage.setItem(CAMPS_STORAGE_KEY, JSON.stringify(state.activeCamps));
  if (state.selectedCamp) {
    localStorage.setItem(SELECTED_CAMP_STORAGE_KEY, JSON.stringify(state.selectedCamp));
    sessionStorage.setItem(SELECTED_CAMP_STORAGE_KEY, JSON.stringify(state.selectedCamp));
  } else {
    localStorage.removeItem(SELECTED_CAMP_STORAGE_KEY);
    sessionStorage.removeItem(SELECTED_CAMP_STORAGE_KEY);
  }
};
