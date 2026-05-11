import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = 'https://thanos.ekincare.com';
export const AGENT_KEY_STORAGE_KEY = 'X-AGENT-KEY';
export const AGENT_STORAGE_KEY = 'agent';
export const CAMPS_STORAGE_KEY = 'camps';
export const SELECTED_CAMP_STORAGE_KEY = 'selectedCamp';

export const getStoredAgentKey = () => (
  localStorage.getItem(AGENT_KEY_STORAGE_KEY)
  || sessionStorage.getItem(AGENT_KEY_STORAGE_KEY)
  || ''
);

export const setStoredAuthTokens = (agentKey?: string) => {
  if (agentKey) {
    localStorage.setItem(AGENT_KEY_STORAGE_KEY, agentKey);
    sessionStorage.setItem(AGENT_KEY_STORAGE_KEY, agentKey);
  }
};

export const clearStoredAuth = () => {
  localStorage.clear();
  sessionStorage.clear();
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredAgentKey();
  if (token) config.headers.set('X-AGENT-KEY', token);

  if (import.meta.env.DEV) {
    console.group('API REQUEST');
    console.log('URL', `${config.baseURL || ''}${config.url || ''}`);
    console.log('METHOD', config.method?.toUpperCase());
    console.log('HEADERS', config.headers.toJSON());
    console.log('BODY', config.data);
    console.groupEnd();
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.group('API RESPONSE');
      console.log('URL', response.config.url);
      console.log('STATUS', response.status);
      console.log('DATA', response.data);
      console.groupEnd();
    }
    return response;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.group('API ERROR');
      console.log('URL', error.config?.url);
      console.log('STATUS', error.response?.status);
      console.log('DATA', error.response?.data);
      console.log('ERROR', error);
      console.groupEnd();
    }

    if (error.response?.status === 401) {
      clearStoredAuth();
      window.dispatchEvent(new CustomEvent('onsite:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      const payload = data as Record<string, unknown>;
      const message = payload.message || payload.error || payload.errors || payload.detail;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.filter(Boolean).join(', ');
    }
    if (error.code === 'ECONNABORTED') return 'API timeout. Please try again.';
    if (!error.response) return 'Network failure. Please check your connection.';
  }
  return error instanceof Error ? error.message : fallback;
};
