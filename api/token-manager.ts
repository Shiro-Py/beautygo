// api/token-manager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@gobeauty:access';
const REFRESH_TOKEN_KEY = '@gobeauty:refresh';

export const TokenManager = {
  async saveTokens(access: string, refresh: string): Promise<void> {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, access],
      [REFRESH_TOKEN_KEY, refresh],
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },

  async hasTokens(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  },
};