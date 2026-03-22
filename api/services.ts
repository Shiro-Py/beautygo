// api/services.ts
import { apiClient } from './client';
import { API_ENDPOINTS, Service } from './constants';

export const ServicesApi = {
  async list(specialistId?: number): Promise<Service[]> {
    const params = specialistId ? { specialist: specialistId } : undefined;
    return await apiClient.get<Service[]>(API_ENDPOINTS.services.list, { params });
  },

  async create(data: Omit<Service, 'id' | 'created_at' | 'specialist'>): Promise<Service> {
    return await apiClient.post<Service>(API_ENDPOINTS.services.list, data);
  },

  async getById(id: number): Promise<Service> {
    return await apiClient.get<Service>(API_ENDPOINTS.services.byId(id));
  },

  async update(id: number, data: Partial<Service>): Promise<Service> {
    return await apiClient.put<Service>(API_ENDPOINTS.services.byId(id), data);
  },

  async patch(id: number, data: Partial<Service>): Promise<Service> {
    return await apiClient.patch<Service>(API_ENDPOINTS.services.byId(id), data);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.services.byId(id));
  },
};
