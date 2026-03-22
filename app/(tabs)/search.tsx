// app/(tabs)/search.tsx — SearchMapScreen (stub)
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🗺️</Text>
      <Text style={styles.title}>Карта мастеров</Text>
      <Text style={styles.subtitle}>Здесь будет карта с мастерами рядом с вами</Text>

      <View style={styles.nav}>
        <Pressable style={styles.navButton} onPress={() => router.push('/(tabs)/masters')}>
          <Text style={styles.navButtonText}>← Мастера</Text>
        </Pressable>
        <Pressable style={styles.navButton} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.navButtonText}>Профиль →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F7',
    padding: 24,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3E3A59',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 40,
  },
  nav: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    backgroundColor: '#F8E1E7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  navButtonText: {
    color: '#3E3A59',
    fontWeight: '600',
    fontSize: 14,
  },
});
