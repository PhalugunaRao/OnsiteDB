import { apiClient, getApiErrorMessage } from './client';
import { asArray, asRecord, firstNumber, normalizeCamp, unwrapApiData } from './normalizers';
import type { Camp } from '../types';

export interface CampDashboardStats {
  total_appointments: number;
  completed: number;
  confirmed: number;
  in_progress: number;
}

export interface CampDashboardData {
  camp: Camp;
  stats: CampDashboardStats;
}

export const getActiveCamps = async (): Promise<Camp[]> => {
  try {
    const response = await apiClient.get('/v3/onsite/camps');
    console.group('GET CAMPS');
    console.log('RESPONSE', response.data);
    console.groupEnd();
    const payload = unwrapApiData(response.data);
    const source = asRecord(payload);
    const camps = asArray(source.camps);
    return camps.map(normalizeCamp);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to fetch camps'), { cause: error });
  }
};

export const getCampDashboard = async (campId: string): Promise<CampDashboardData> => {
  try {
    const response = await apiClient.get(`/v3/onsite/camps/${campId}/dashboard`);
    console.group('GET CAMP DASHBOARD');
    console.log('CAMP ID', campId);
    console.log('DATA', response.data);
    console.groupEnd();
    const payload = asRecord(unwrapApiData(response.data));
    const stats = asRecord(payload.stats);
    return {
      camp: normalizeCamp(payload.camp),
      stats: {
        total_appointments: firstNumber(stats, ['total_appointments']),
        completed: firstNumber(stats, ['completed']),
        confirmed: firstNumber(stats, ['confirmed']),
        in_progress: firstNumber(stats, ['in_progress']),
      },
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to fetch dashboard'), { cause: error });
  }
};
