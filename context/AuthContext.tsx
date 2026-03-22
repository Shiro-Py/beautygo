// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TokenManager } from '../api/token-manager';
import { AuthService } from '../api/auth';
import { VerifyOtpResponse, CompleteRegistrationData, UserProfile } from '../api/constants';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  // OTP flow
  sendOtp: (phone: string) => Promise<{ retry_after: number }>;
  verifyOtp: (phone: string, code: string) => Promise<VerifyOtpResponse>;
  completeRegistration: (data: CompleteRegistrationData) => Promise<void>;
  // Session
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  // Dev helpers
  mockLogin: () => void;
  mockLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  /**
   * Проверка авторизации при старте
   */
  const checkAuth = async (): Promise<boolean> => {
    try {
      const hasTokens = await TokenManager.hasTokens();
      if (!hasTokens) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      try {
        const profile = await AuthService.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } catch {
        const refreshed = await refreshSession();
        if (refreshed) return true;
        await TokenManager.clearTokens();
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Обновление сессии (refresh token)
   */
  const refreshSession = async (): Promise<boolean> => {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const { apiClient } = await import('../api/client');
      const { API_ENDPOINTS } = await import('../api/constants');

      const response = await apiClient.post<any>(
        API_ENDPOINTS.auth.refresh,
        { refresh: refreshToken }
      );
      const data = response?.data ?? response;
      await TokenManager.saveTokens(data.access, data.refresh);

      const profile = await AuthService.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('❌ Refresh session error:', error);
      return false;
    }
  };

  /**
   * Шаг 1: Отправить OTP
   */
  const sendOtp = async (phone: string): Promise<{ retry_after: number }> => {
    return await AuthService.sendOtp(phone);
  };

  /**
   * Шаг 2: Верифицировать OTP → получить JWT
   * Токены сохраняются внутри AuthService.verifyOtp
   */
  const verifyOtp = async (phone: string, code: string): Promise<VerifyOtpResponse> => {
    const result = await AuthService.verifyOtp(phone, code);
    // Для существующих пользователей сразу загружаем профиль
    if (result.has_profile) {
      try {
        const profile = await AuthService.getProfile();
        setUser(profile);
      } catch {
        // Профиль загрузим позже
      }
      setIsAuthenticated(true);
    }
    return result;
  };

  /**
   * Шаг 3: Завершить регистрацию (только для новых пользователей)
   */
  const completeRegistration = async (data: CompleteRegistrationData): Promise<void> => {
    await AuthService.completeRegistration(data);
    try {
      const profile = await AuthService.getProfile();
      setUser(profile);
    } catch {
      // Профиль загрузим позже
    }
    setIsAuthenticated(true);
  };

  /**
   * Логаут
   */
  const logout = async (): Promise<void> => {
    await AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  /** DEV ONLY */
  const mockLogin = () => {
    setUser({
      id: 0,
      full_name: 'Mock User',
      avatar: null,
      bio: 'dev',
      city: 'Москва',
      experience_years: 0,
    });
    setIsAuthenticated(true);
  };

  const mockLogout = () => {
    TokenManager.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        sendOtp,
        verifyOtp,
        completeRegistration,
        logout,
        checkAuth,
        refreshSession,
        mockLogin,
        mockLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
