import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, Pressable, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SpecialistsApi } from '../../api/specialists';
import { Specialist } from '../../api/constants';
import MasterPreviewCard from '../../components/MasterPreviewCard';

export default function MastersScreen() {
  const router = useRouter();
  const [masters, setMasters] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchMasters = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (pageNum === 1) setError(null);
      const data = await SpecialistsApi.list({ page: pageNum });
      const results = data.results ?? (Array.isArray(data) ? data as any : []);
      if (pageNum === 1 || refresh) {
        setMasters(results);
      } else {
        setMasters((prev) => [...prev, ...results]);
      }
      setHasMore(!!data.next);
      setPage(pageNum);
    } catch (err: any) {
      setError(err?.getUserMessage?.() ?? 'Не удалось загрузить мастеров');
    }
  }, []);

  useEffect(() => {
    fetchMasters(1).finally(() => setIsLoading(false));
  }, [fetchMasters]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchMasters(1, true);
    setIsRefreshing(false);
  };

  const onLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    await fetchMasters(page + 1);
    setIsLoadingMore(false);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3E3A59" />
        <Text style={styles.loadingText}>Загружаем мастеров...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => { setIsLoading(true); fetchMasters(1).finally(() => setIsLoading(false)); }}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Мастера</Text>
        <Text style={styles.subtitle}>Найдите своего специалиста</Text>
      </View>

      <FlatList
        data={masters}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MasterPreviewCard
            name={item.full_name}
            service={item.services?.[0]?.name ?? item.bio ?? '—'}
            rating={parseFloat(item.rating) || 0}
            onPress={() => router.push(`/profile/${item.id}` as any)}
            avatarPlaceholder={item.full_name?.[0] ?? '?'}
            avatarUri={item.avatar ?? undefined}
          />
        )}
        contentContainerStyle={masters.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#3E3A59" />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Мастера не найдены</Text>
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color="#3E3A59" /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: { fontSize: 26, fontWeight: '700', color: '#3E3A59' },
  subtitle: { fontSize: 14, color: '#777', marginTop: 4 },
  list: { padding: 16, gap: 12 },
  loadingText: { marginTop: 12, color: '#777', fontSize: 15 },
  errorText: { color: '#E74C3C', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: '#F8E1E7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: { color: '#3E3A59', fontWeight: '600', fontSize: 15 },
  emptyText: { color: '#777', fontSize: 16 },
});
