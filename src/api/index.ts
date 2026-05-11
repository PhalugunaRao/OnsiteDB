import * as auth from './auth';
import * as camps from './camps';
import * as appointments from './appointments';

export const api = {
  validateAgent: auth.sendOtp,
  resendOtp: auth.sendOtp,
  verifyOtp: auth.verifyOtp,
  logout: auth.logout,
  getActiveCamps: camps.getActiveCamps,
  getCampDashboard: camps.getCampDashboard,
  searchAppointments: appointments.searchAppointments,
  searchUser: appointments.searchUser,
  getAppointmentDetails: appointments.getAppointmentDetails,
  getTestSections: appointments.getTestSections,
  saveComponentEntry: appointments.saveSampleCollection,
  saveSampleCollection: appointments.saveSampleCollection,
  updateAppointmentTestProvider: appointments.updateAppointmentTestProvider,
  createBooking: appointments.createBooking,
};

export type { AppointmentDetails, AppointmentResult } from './appointments';
export type { CampDashboardData, CampDashboardStats } from './camps';
