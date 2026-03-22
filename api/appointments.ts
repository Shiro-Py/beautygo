import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';

export interface CreateAppointmentData {
  specialist: number;
  service: number;
  slot: number;
}

export interface Appointment {
  id: number;
  specialist: number;
  specialist_name: string;
  service: number;
  service_name: string;
  scheduled_at: string;   // ISO datetime
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price: string;
  created_at: string;
}

export const AppointmentsApi = {
  async create(data: CreateAppointmentData): Promise<Appointment> {
    return apiClient.post<Appointment>(API_ENDPOINTS.appointments.create, data);
  },

  async list(): Promise<Appointment[]> {
    const res = await apiClient.get<any>(API_ENDPOINTS.appointments.list);
    return Array.isArray(res) ? res : (res?.results ?? []);
  },

  async cancel(id: number): Promise<void> {
    await apiClient.post(API_ENDPOINTS.appointments.cancel(id));
  },
};
