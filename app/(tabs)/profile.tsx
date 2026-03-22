// app/(tabs)/profile.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated, mockLogout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <Text>Не авторизован</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.full_name?.[0]?.toUpperCase() || '👤'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.full_name || 'Пользователь'}</Text>
        <Text style={styles.email}>{user?.bio || 'Нет информации'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Информация</Text>
        
        <View style={styles.row}>
          <Ionicons name="person" size={20} color="#777" />
          <Text style={styles.rowLabel}>Имя:</Text>
          <Text style={styles.rowValue}>{user?.full_name || '—'}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="location" size={20} color="#777" />
          <Text style={styles.rowLabel}>Город:</Text>
          <Text style={styles.rowValue}>{user?.city || '—'}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="briefcase" size={20} color="#777" />
          <Text style={styles.rowLabel}>Опыт:</Text>
          <Text style={styles.rowValue}>{user?.experience_years || 0} лет</Text>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#E74C3C" />
        <Text style={styles.logoutText}>Выйти из аккаунта</Text>
      </Pressable>

      {__DEV__ && (
        <Pressable style={styles.mockButton} onPress={mockLogout}>
          <Text style={styles.mockButtonText}>🧪 Mock Logout (dev)</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8E1E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#3E3A59',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3E3A59',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: '#777',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3E3A59',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowLabel: {
    fontSize: 14,
    color: '#777',
    marginLeft: 12,
    width: 80,
  },
  rowValue: {
    fontSize: 14,
    color: '#3E3A59',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  mockButton: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  mockButtonText: {
    color: '#999',
    fontSize: 13,
  },
});