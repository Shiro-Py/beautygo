import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';
import { TokenManager } from '../api/token-manager';
import { useRouter } from 'expo-router';

export default function Test401Screen() {
  const router = useRouter();

  // Тест 1: Удалить access токен → проверить refresh
  const testRefreshFlow = async () => {
    try {
      console.log('🧪 ТЕСТ 1: Удаляем access token...');
      await AsyncStorage.removeItem('@gobeauty:access');
      
      console.log('🧪 Делаем запрос к защищённому эндпоинту...');
      const profile = await apiClient.get('/auth/profile/me/');
      
      Alert.alert('✅ Успех', 'Token refresh сработал!');
      console.log('📥 Профиль:', profile);
    } catch (error: any) {
      console.log('❌ Ошибка:', error.message);
      Alert.alert('❌ Ошибка', error.message);
    }
  };

  // Тест 2: Удалить оба токена → проверить logout
  const testLogoutFlow = async () => {
    try {
      console.log('🧪 ТЕСТ 2: Удаляем все токены...');
      await TokenManager.clearTokens();
      
      console.log('🧪 Делаем запрос к защищённому эндпоинту...');
      const profile = await apiClient.get('/auth/profile/me/');
      
      Alert.alert('❌ Неожиданно', 'Запрос прошёл без токенов!');
    } catch (error: any) {
      console.log('❌ Ошибка (ожидаемо):', error.message);
      // Должен сработать редирект на логин
      Alert.alert('⚠️ Logout', 'Перенаправление на логин...');
    }
  };

  // Тест 3: Проверить текущие токены
  const checkTokens = async () => {
  try {
    const access = await AsyncStorage.getItem('@gobeauty:access');
    const refresh = await AsyncStorage.getItem('@gobeauty:refresh');
    
    console.log('🔍 ПРОВЕРКА ТОКЕНОВ:');
    console.log('  Access token:', access ? access.substring(0, 30) + '...' : 'НЕТ');
    console.log('  Refresh token:', refresh ? refresh.substring(0, 30) + '...' : 'НЕТ');
    
    // Проверим ВСЕ ключи в AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📋 Все ключи в AsyncStorage:', allKeys);
    
    Alert.alert(
      '📦 Токены',
      `Access: ${access ? '✅ Есть' : '❌ Нет'}\n\nRefresh: ${refresh ? '✅ Есть' : '❌ Нет'}\n\nВсе ключи: ${allKeys.join(', ')}`
    );
  } catch (error) {
    console.error('❌ Ошибка при проверке токенов:', error);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Тест 401 Flow</Text>
      
      <Pressable style={styles.button} onPress={checkTokens}>
        <Text style={styles.buttonText}>1️⃣ Проверить токены</Text>
      </Pressable>
      
      <Pressable style={styles.button} onPress={testRefreshFlow}>
        <Text style={styles.buttonText}>2️⃣ Тест Refresh Flow</Text>
      </Pressable>
      
      <Pressable style={styles.button} onPress={testLogoutFlow}>
        <Text style={styles.buttonText}>3️⃣ Тест Logout Flow</Text>
      </Pressable>
      
      <Pressable style={styles.buttonSecondary} onPress={() => router.back()}>
        <Text style={styles.buttonSecondaryText}>← Назад</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
    color: '#3E3A59',
  },
  button: {
    backgroundColor: '#F8E1E7',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#3E3A59',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonSecondaryText: {
    color: '#777',
    fontSize: 16,
  },
});