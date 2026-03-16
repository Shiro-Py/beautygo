import config from '../config';

export const API_CONFIG = {
  baseURL: config.getBaseUrl(),
  timeout: config.get('API_TIMEOUT'),
  useMockServer: config.useMockServer(),
  mockDelay: config.get('MOCK_DELAY'),
};


export const API_ENDPOINTS = {
  // 🔐 Авторизация
  auth: {
    login: '/auth/login/',
    register: '/auth/register/',
    refresh: '/auth/refresh/',
    profileMe: '/auth/profile/me/',
    services: '/auth/services/',
    serviceById: (id: string | number) => `/auth/services/${id}/`,
  },
  
  // 👥 Мастера (добавь когда будут эндпоинты)
  masters: {
    list: '/masters/',
    byId: (id: string | number) => `/masters/${id}/`,
    search: '/masters/search/',
  },
  
  // 📅 Бронирования (добавь когда будут эндпоинты)
  booking: {
    create: '/booking/',
    list: '/booking/list/',
    byId: (id: string | number) => `/booking/${id}/`,
    cancel: (id: string | number) => `/booking/${id}/cancel/`,
  },
} as const;

export interface LoginCredentials {
  username: string;
  password: string;
}

// Данные для регистрации
export interface RegisterCredentials extends LoginCredentials {
  email: string;
  phone: string;
  role: 'client' | 'specialist';
  full_name?: string;  // Опциональное поле
}

// Ответ от сервера при логине/регистации
export interface AuthTokens {
  access: string;   // Access токен (JWT)
  refresh: string;  // Refresh токен
}

// Профиль пользователя
export interface UserProfile {
  id: number;
  full_name: string;
  avatar: string | null;  // Может быть null
  bio: string;
  city: string;
  experience_years: number;
}

// Услуга мастера
export interface Service {
  id: number;
  name: string;
  description: string;
  price: string;  // Decimal как строка
  duration_minutes: number;
  created_at: string;  // ISO дата
  specialist: number;  // ID специалиста
}

/**
 * ============================================
 * DEVELOPMENT LOGGING
 * Логируем конфигурацию при старте (только в dev)
 * ============================================
 */
if (__DEV__) {
  console.log('🔧 API Config loaded:', {
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    useMockServer: API_CONFIG.useMockServer,
    mockDelay: API_CONFIG.mockDelay,
    env: config.getEnvName(),
  });
}