// api/services.ts
import { apiClient } from './client';
import { API_ENDPOINTS, Service } from './constants';

export const ServicesApi = {
  /**
   * Получить список услуг (можно фильтровать по специалисту)
   */
  async list(specialistId?: number): Promise<Service[]> {
    const params = specialistId ? { specialist: specialistId } : undefined;
    return await apiClient.get<Service[]>(API_ENDPOINTS.auth.services, { params });
  },

  /**
   * Создать новую услугу
   */
  async create(data: Omit<Service, 'id' | 'created_at' | 'specialist'>): Promise<Service> {
    return await apiClient.post<Service>(API_ENDPOINTS.auth.services, data);
  },

  /**
   * Получить услугу по ID
   */
  async getById(id: number): Promise<Service> {
    return await apiClient.get<Service>(API_ENDPOINTS.auth.serviceById(id));
  },

  /**
   * Обновить услугу (полностью)
   */
  async update(id: number, data: Partial<Service>): Promise<Service> {
    return await apiClient.put<Service>(API_ENDPOINTS.auth.serviceById(id), data);
  },

  /**
   * Частичное обновление услуги
   */
  async patch(id: number, data: Partial<Service>): Promise<Service> {
    return await apiClient.patch<Service>(API_ENDPOINTS.auth.serviceById(id), data);
  },

  /**
   * Удалить услугу
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.auth.serviceById(id));
  },
};