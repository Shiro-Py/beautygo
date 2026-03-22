// api/client.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import { router } from 'expo-router';

import { API_CONFIG, API_ENDPOINTS } from './constants';
import { apiLogger } from './logger';
import { ApiError } from './errors';
import { TokenManager } from './token-manager';

export class ApiClient {
  private instance: AxiosInstance;
  private static _instance: ApiClient;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient._instance) {
      ApiClient._instance = new ApiClient();
    }
    return ApiClient._instance;
  }

  private setupInterceptors(): void {
    // ─── REQUEST INTERCEPTOR ───
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const startTime = Date.now();
        const method = (config.method?.toUpperCase() || 'GET') as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        
        apiLogger.request({ 
          method, 
          url: config.url || '', 
          requestData: config.data 
        });

        const token = await TokenManager.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.headers) {
          config.headers['X-App-Type'] = 'client';
          // X-Device-Id: генерируем один раз, храним в SecureStore
          let deviceId = await SecureStore.getItemAsync('DEVICE_ID');
          if (!deviceId) {
            deviceId = Application.androidId
              ?? Application.getIosIdForVendorAsync
              ?? `device_${Date.now()}`;
            await SecureStore.setItemAsync('DEVICE_ID', String(deviceId));
          }
          config.headers['X-Device-Id'] = deviceId;
        }

        (config as any).requestStartTime = startTime;
        return config;
      },
      (error: AxiosError) => {
        apiLogger.error({
          method: error.config?.method?.toUpperCase() as any,
          url: error.config?.url || 'unknown',
          error,
          duration: 0,
        });
        return Promise.reject(ApiError.fromAxiosError(error));
      }
    );

    // ─── RESPONSE INTERCEPTOR ───
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const config = response.config as any;
        const duration = Date.now() - (config.requestStartTime || 0);
        
        apiLogger.response({
          method: config.method?.toUpperCase() as any,
          url: config.url,
          status: response.status,
          duration,
          responseData: response.data,
        });
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as any;
        const duration = Date.now() - (config.requestStartTime || 0);
        
        apiLogger.error({
          method: config.method?.toUpperCase() as any,
          url: config.url || 'unknown',
          error,
          duration,
        });

        const apiError = ApiError.fromAxiosError(error);

        // ─── ОБРАБОТКА 401 ───
        if (apiError.code === 'UNAUTHORIZED') {
  console.log('🔔 401 получен, проверяем тип запроса...');
  console.log('  URL:', config.url);
  
  // Проверяем, не является ли это запросом на refresh или login
  const isAuthRequest =
    config.url?.includes('/auth/send-otp/') ||
    config.url?.includes('/auth/verify-otp/') ||
    config.url?.includes('/auth/token/refresh/');
  
  console.log('  isAuthRequest:', isAuthRequest);
  
  if (!isAuthRequest) {
    console.log('🔄 Пытаемся refresh token...');
    // НЕ на экране авторизации → пробуем refresh
    try {
      const newAccess = await this.refreshAccessToken();
      console.log('✅ Token refresh успешен!');
      // Повторяем оригинальный запрос
      if (config.headers) {
        config.headers.Authorization = `Bearer ${newAccess}`;
      }
      return this.instance(config);
    } catch (refreshError) {
      console.log('❌ Refresh не удался:', refreshError);
      // Refresh не удался → logout
      await TokenManager.clearTokens();
      router.replace('/(auth)/login');
    }
  } else {
    console.log('⚠️ Это auth запрос, не делаем refresh');
  }
  // Если это запрос на login/refresh → просто отдаём ошибку экрану
}

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Refresh token flow для SimpleJWT
   */
  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => resolve(token));
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      // Прямой запрос без interceptor'а
      const response = await axios.post<{ access: string; refresh: string }>(
        `${API_CONFIG.baseURL}${API_ENDPOINTS.auth.refresh}`,
        { refresh: refreshToken },
        { timeout: 5000 }
      );

      const { access, refresh } = response.data;
      await TokenManager.saveTokens(access, refresh);

      this.refreshSubscribers.forEach((cb) => cb(access));
      this.refreshSubscribers = [];

      return access;
    } finally {
      this.isRefreshing = false;
    }
  }

  // ─── ПРОКСИ-МЕТОДЫ ───
  
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get<T>(url, config).then((res: AxiosResponse<T>) => res.data);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post<T>(url, data, config).then((res: AxiosResponse<T>) => res.data);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put<T>(url, data, config).then((res: AxiosResponse<T>) => res.data);
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch<T>(url, data, config).then((res: AxiosResponse<T>) => res.data);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete<T>(url, config).then((res: AxiosResponse<T>) => res.data);
  }
}

export const apiClient = ApiClient.getInstance();