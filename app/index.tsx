import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Привет 👋</Text>
      <Text style={styles.subtitle}>Найди мастера рядом с тобой</Text>

      <Pressable style={styles.button} onPress={() => router.push('/masters')}>
        <Ionicons name="search" size={18} color="#3E3A59" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Найти мастера</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.push('/auth/login')}>
        <Text style={styles.secondaryText}>Войти</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.push('/auth/register')}>
        <Text style={styles.secondaryText}>Регистрация</Text>
      </Pressable>
       {/* 🧪 НОВАЯ КНОПКА ДЛЯ ТЕСТА (добавь в конец) */}
      <Pressable 
        style={styles.button} 
        onPress={() => router.push('/test-401')}
      >
        <Text style={styles.buttonText}>🧪 Тест 401</Text>
      </Pressable>
      <Pressable 
        style={[styles.button, { marginTop: 32, backgroundColor: '#FFE4E1' }]} 
        onPress={() => router.push('/debug')}
      >
        <Text style={styles.buttonText}>🔧 Debug</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 12,
    color: '#3E3A59',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#F8E1E7',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#3E3A59',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#3E3A59',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});