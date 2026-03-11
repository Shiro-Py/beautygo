// api/auth.ts
import { apiClient } from './client';
import { API_ENDPOINTS, LoginCredentials, RegisterCredentials, AuthTokens, UserProfile } from './constants';
import { TokenManager } from './token-manager';
import { router } from 'expo-router';

export const AuthService = {
  /**
   * Логин: получаем access/refresh токены
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    console.log('📤 Login запрос:', credentials);
    const tokens = await apiClient.post<AuthTokens>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    console.log('📥 Получены токены:', {
      access: tokens.access ? tokens.access.substring(0, 20) + '...' : 'нет',
      refresh: tokens.refresh ? tokens.refresh.substring(0, 20) + '...' : 'нет',
    });
    await TokenManager.saveTokens(tokens.access, tokens.refresh);
    console.log('✅ Токены сохранены в AsyncStorage');
    return tokens;
  },

  /**
   * Регистрация
   * ⚠️ Схема в docs пустая — передаём данные как есть, бэкенд разберёт
   */
  async register(data: RegisterCredentials): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.register, data);
    // После успешной регистрации можно сразу залогинить пользователя
    // или попросить войти вручную — зависит от твоей логики
  },

  /**
   * Получить профиль текущего пользователя
   */
  async getProfile(): Promise<UserProfile> {
    return await apiClient.get<UserProfile>(API_ENDPOINTS.auth.profileMe);
  },

  /**
   * Обновить профиль (частично или полностью)
   */
  async updateProfile(data: Partial<UserProfile>, patch = true): Promise<UserProfile> {
    if (patch) {
      return await apiClient.patch<UserProfile>(API_ENDPOINTS.auth.profileMe, data);
    }
    return await apiClient.put<UserProfile>(API_ENDPOINTS.auth.profileMe, data);
  },

  /**
   * Логаут: очищаем токены + редирект
   */
  async logout(): Promise<void> {
    // Опционально: уведомить сервер (не блокируем юзера, если ошибка)
    await apiClient.post(API_ENDPOINTS.auth.refresh, {}, { timeout: 2000 })
      .catch(() => { /* игнорируем */ });
    
    await TokenManager.clearTokens();
    router.replace('/auth/login');
  },

  /**
   * Проверка: авторизован ли пользователь
   */
  async isAuthenticated(): Promise<boolean> {
    return await TokenManager.hasTokens();
  },
};