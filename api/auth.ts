// api/auth.ts
import { apiClient } from './client';
import { API_ENDPOINTS, VerifyOtpResponse, CompleteRegistrationData, UserProfile } from './constants';
import { TokenManager } from './token-manager';
import { router } from 'expo-router';

export const AuthService = {
  /**
   * Шаг 1: Отправить OTP на телефон
   */
  async sendOtp(phone: string): Promise<{ retry_after: number }> {
    const response = await apiClient.post<any>(API_ENDPOINTS.auth.sendOtp, { phone });
    // Поддержка обёрнутого { data: {...} } и прямого ответа
    return response?.data ?? response ?? { retry_after: 60 };
  },

  /**
   * Шаг 2: Проверить OTP-код → получить JWT + флаг is_new_user
   */
  async verifyOtp(phone: string, code: string): Promise<VerifyOtpResponse> {
    const response = await apiClient.post<any>(API_ENDPOINTS.auth.verifyOtp, { phone, code });
    const result: VerifyOtpResponse = response?.data ?? response;
    await TokenManager.saveTokens(result.access, result.refresh);
    return result;
  },

  /**
   * Шаг 3 (только для новых пользователей): Завершить регистрацию
   */
  async completeRegistration(data: CompleteRegistrationData): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.register, data);
  },

  /**
   * Получить профиль текущего пользователя
   */
  async getProfile(): Promise<UserProfile> {
    return await apiClient.get<UserProfile>(API_ENDPOINTS.auth.profileMe);
  },

  /**
   * Обновить профиль (частично)
   */
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return await apiClient.patch<UserProfile>(API_ENDPOINTS.auth.profileMe, data);
  },

  /**
   * Логаут: инвалидируем refresh token на сервере + чистим локально
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (refreshToken) {
        await apiClient.post(
          API_ENDPOINTS.auth.logout,
          { refresh: refreshToken },
          { timeout: 2000 }
        );
      }
    } catch {
      // Игнорируем ошибки сервера при logout
    } finally {
      await TokenManager.clearTokens();
      router.replace('/(auth)/login');
    }
  },

  /**
   * Проверка: есть ли токены локально
   */
  async isAuthenticated(): Promise<boolean> {
    return await TokenManager.hasTokens();
  },
};
