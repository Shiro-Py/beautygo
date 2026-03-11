import React from 'react';
import { ScrollView, View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const mockMasters = [
  {
    id: '1',
    name: 'Мария',
    service: 'Маникюр',
    rating: 4.8,
    avatar: 'https://via.placeholder.com/100x100.png?text=👩‍🎨',
    description: 'Сертифицированный мастер с 5-летним опытом. Использую только качественные материалы.',
  },
  {
    id: '2',
    name: 'Ольга',
    service: 'Массаж',
    rating: 4.9,
    avatar: 'https://via.placeholder.com/100x100.png?text=💆‍♀️',
    description: 'Профессиональный массажист с медицинским образованием.',
  },
];

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const master = mockMasters.find((m) => String(m.id) === String(id));

  if (!master) {
    return (
      <View style={styles.centered}>
        <Text>Мастер не найден</Text>
        <Pressable onPress={() => router.replace('/masters')}>
          <Text style={styles.back}>← Назад</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {master.avatar ? (
        <Image source={{ uri: master.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{master.name[0]}</Text>
        </View>
      )}
      <Text style={styles.name}>{master.name}</Text>
      <Text style={styles.service}>{master.service} · ★{master.rating}</Text>
      <Pressable style={styles.button} onPress={() => router.push(`/booking?id=${id}`)}>
        <Text style={styles.buttonText}>Записаться</Text>
      </Pressable>
      <Text style={styles.description}>{master.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6E6FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#3E3A59',
    fontSize: 32,
    fontWeight: '600',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3E3A59',
  },
  service: {
    fontSize: 16,
    color: '#666',
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#F8E1E7',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#3E3A59',
    fontWeight: '500',
    fontSize: 16,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  back: {
    marginTop: 12,
    color: '#3E3A59',
  },
});