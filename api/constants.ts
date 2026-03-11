// api/constants.ts
export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://dev.gobeauty.site/api',
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '15000', 10),
};

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login/',
    register: '/auth/register/',
    refresh: '/auth/refresh/',
    profileMe: '/auth/profile/me/',
    services: '/auth/services/',
    serviceById: (id: string | number) => `/auth/services/${id}/`,
  },
} as const;

// Типы запросов/ответов
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  email: string;
  phone: string;
  role: 'client' | 'specialist';
  full_name?: string;
}

export interface AuthTokens {
  access: string;   // ⚠️ именно access, не accessToken!
  refresh: string;  // ⚠️ именно refresh!
}

export interface UserProfile {
  id: number;
  full_name: string;
  avatar: string | null;
  bio: string;
  city: string;
  experience_years: number;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: string;  // Decimal как строка
  duration_minutes: number;
  created_at: string;
  specialist: number;
}