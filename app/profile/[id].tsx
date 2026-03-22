import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet,
  Image, Pressable, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SpecialistsApi } from '../../api/specialists';
import { Specialist, Service, Review } from '../../api/constants';

export default function MasterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [master, setMaster] = useState<Specialist | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      SpecialistsApi.getById(id),
      SpecialistsApi.getServices(id).catch(() => [] as Service[]),
      SpecialistsApi.getReviews(id).catch(() => [] as Review[]),
    ])
      .then(([m, s, r]) => {
        setMaster(m);
        setServices(s);
        setReviews(r);
      })
      .catch((err) => setError(err?.getUserMessage?.() ?? 'Не удалось загрузить профиль'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3E3A59" />
      </View>
    );
  }

  if (error || !master) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Мастер не найден'}</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Назад</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Аватар */}
      {master.avatar ? (
        <Image source={{ uri: master.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{master.full_name?.[0] ?? '?'}</Text>
        </View>
      )}

      <Text style={styles.name}>{master.full_name}</Text>
      <Text style={styles.meta}>
        ★ {parseFloat(master.rating).toFixed(1)} · {master.reviews_count} отзывов · {master.experience_years} лет опыта
      </Text>
      {master.city ? <Text style={styles.city}>📍 {master.city}</Text> : null}

      {master.bio ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О мастере</Text>
          <Text style={styles.bio}>{master.bio}</Text>
        </View>
      ) : null}

      {/* Услуги */}
      {services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Услуги</Text>
          {services.map((s) => (
            <View key={s.id} style={styles.serviceRow}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{s.name}</Text>
                <Text style={styles.serviceDuration}>{s.duration_minutes} мин</Text>
              </View>
              <Text style={styles.servicePrice}>{s.price} ₽</Text>
            </View>
          ))}
        </View>
      )}

      {/* Кнопка записи */}
      <Pressable
        style={styles.bookButton}
        onPress={() => router.push(`/(tabs)/booking?id=${id}` as any)}
      >
        <Text style={styles.bookButtonText}>Записаться</Text>
      </Pressable>

      {/* Отзывы */}
      {reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Отзывы</Text>
          {reviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{r.author_name}</Text>
                <Text style={styles.reviewRating}>★ {r.rating}</Text>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center', paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#E6E6FA', justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  avatarText: { color: '#3E3A59', fontSize: 36, fontWeight: '600' },
  name: { fontSize: 22, fontWeight: '700', color: '#3E3A59', textAlign: 'center' },
  meta: { fontSize: 14, color: '#777', marginTop: 6, textAlign: 'center' },
  city: { fontSize: 14, color: '#999', marginTop: 4 },
  section: {
    width: '100%', backgroundColor: '#fff',
    borderRadius: 12, padding: 16, marginTop: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#3E3A59', marginBottom: 12 },
  bio: { fontSize: 15, color: '#444', lineHeight: 22 },
  serviceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, color: '#3E3A59', fontWeight: '500' },
  serviceDuration: { fontSize: 12, color: '#999', marginTop: 2 },
  servicePrice: { fontSize: 15, fontWeight: '600', color: '#3E3A59' },
  bookButton: {
    width: '100%', backgroundColor: '#F8E1E7',
    paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 20,
  },
  bookButtonText: { color: '#3E3A59', fontSize: 17, fontWeight: '600' },
  reviewCard: {
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewAuthor: { fontSize: 14, fontWeight: '600', color: '#3E3A59' },
  reviewRating: { fontSize: 14, color: '#F39C12' },
  reviewComment: { fontSize: 14, color: '#555', lineHeight: 20 },
  errorText: { color: '#E74C3C', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  backBtn: { backgroundColor: '#F8E1E7', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  backBtnText: { color: '#3E3A59', fontWeight: '600' },
});
