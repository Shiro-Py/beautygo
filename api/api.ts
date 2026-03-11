import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LoginResponse } from '../types/todos';


const api = axios.create({
  baseURL: 'http://194.87.99.126:8000/api/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});



class TokenManager {
  static async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  }

  static async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem('accessToken');
  }

  static async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem('refreshToken');
  }

  static async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  }
}



// export const handleLogin = async (email: string, password: string) => {
//   try {
//     const res = await api.post<LoginResponse>('/login/', {
//       email,
//       password,
//     });

//     const { accessToken, refreshToken } = res.data;
//     await TokenManager.saveTokens(accessToken, refreshToken);

//     console.log('Успешный вход');
//     router.replace('/(tabs)/masters');
//     return true;
//   } catch (err) {
//     console.log('Ошибка входа', 'Неверный логин или пароль');
//     return false;
//   }
// };

export const handleLogin = async (username: string, password: string) => {
  try {
    const res = await api.post<LoginResponse>('/login/', {
      username,
      password,
    });

    const { accessToken, refreshToken } = res.data;
    await TokenManager.saveTokens(accessToken, refreshToken);

    console.log('Успешный вход');
    router.replace('/(tabs)/masters');
    return true;
  } catch (err) {
    console.log('Ошибка входа', 'Неверный логин или пароль');
    return false;
  }
};



export default api;