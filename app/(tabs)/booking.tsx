import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import BookingForm from '../../components/BookingForm';
import { useLocalSearchParams } from 'expo-router';

const mockMasters = [
  {
    id: '1',
    name: 'Мария',
    service: 'Маникюр',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Ольга',
    service: 'Массаж',
    rating: 4.9,
  },
];

export default function BookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const master = mockMasters.find((m) => String(m.id) === String(id));

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Запись к мастеру</Text>
      {master && (
        <View style={styles.masterInfo}>
          <Text style={styles.masterName}>{master.name}</Text>
          <Text style={styles.masterService}>{master.service} · ★{master.rating}</Text>
        </View>
      )}
      <BookingForm />
      <Pressable style={styles.backButton} onPress={router.back}>
        <Text style={styles.backText}>← Назад</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: '#3E3A59',
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#3E3A59',
  },
  masterInfo: {
    marginBottom: 16,
    alignItems: 'center',
  },
  masterName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3E3A59',
  },
  masterService: {
    fontSize: 16,
    color: '#777',
  },
});