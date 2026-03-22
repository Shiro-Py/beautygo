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
    sendOtp: '/auth/send-otp/',
    verifyOtp: '/auth/verify-otp/',
    register: '/auth/register/',
    refresh: '/auth/token/refresh/',
    logout: '/auth/logout/',
    profileMe: '/clients/me',
  },
  
  // 👥 Специалисты
  specialists: {
    list: '/specialists/',
    byId: (id: string | number) => `/specialists/${id}/`,
    services: (id: string | number) => `/specialists/${id}/services/`,
    slots: (id: string | number) => `/specialists/${id}/slots/`,
    reviews: (id: string | number) => `/specialists/${id}/reviews/`,
    favorite: (id: string | number) => `/specialists/${id}/favorite/`,
  },

  // 🛎️ Услуги
  services: {
    categories: '/services/categories/',
    list: '/services/',
    byId: (id: string | number) => `/services/${id}/`,
  },

  // 📅 Бронирования
  appointments: {
    create: '/appointments/',
    list: '/appointments/',
    byId: (id: string | number) => `/appointments/${id}/`,
    cancel: (id: string | number) => `/appointments/${id}/cancel/`,
    reschedule: (id: string | number) => `/appointments/${id}/reschedule/`,
  },

  // 🤖 AI
  ai: {
    chat: '/ai/chat/',
    conversations: '/ai/conversations/',
    conversation: (id: string | number) => `/ai/conversations/${id}/`,
  },
} as const;

// OTP flow types
export interface VerifyOtpResponse {
  access: string;
  refresh: string;
  has_profile: boolean;   // false → онбординг, true → Main Screen
}

export interface CompleteRegistrationData {
  first_name: string;
  last_name?: string;
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

// Специалист (мастер)
export interface Specialist {
  id: number;
  full_name: string;
  avatar: string | null;
  bio: string;
  city: string;
  experience_years: number;
  rating: string;        // Decimal как строка, напр. "4.80"
  reviews_count: number;
  services: Service[];   // Может быть пустым массивом
}

// Пагинированный ответ
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Слот записи
export interface TimeSlot {
  id: number;
  date: string;          // "2025-04-20"
  time: string;          // "14:00"
  is_available: boolean;
}

// Отзыв
export interface Review {
  id: number;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
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