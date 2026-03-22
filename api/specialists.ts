import { apiClient } from './client';
import { API_ENDPOINTS, Specialist, PaginatedResponse, Service, TimeSlot, Review } from './constants';

export interface SpecialistsListParams {
  city?: string;
  service?: string;
  rating_min?: number;
  page?: number;
}

export const SpecialistsApi = {
  async list(params?: SpecialistsListParams): Promise<PaginatedResponse<Specialist>> {
    return apiClient.get<PaginatedResponse<Specialist>>(API_ENDPOINTS.specialists.list, { params });
  },

  async getById(id: number | string): Promise<Specialist> {
    return apiClient.get<Specialist>(API_ENDPOINTS.specialists.byId(id));
  },

  async getServices(id: number | string): Promise<Service[]> {
    return apiClient.get<Service[]>(API_ENDPOINTS.specialists.services(id));
  },

  async getSlots(id: number | string, date?: string): Promise<TimeSlot[]> {
    const params = date ? { date } : undefined;
    return apiClient.get<TimeSlot[]>(API_ENDPOINTS.specialists.slots(id), { params });
  },

  async getReviews(id: number | string): Promise<Review[]> {
    return apiClient.get<Review[]>(API_ENDPOINTS.specialists.reviews(id));
  },
};
