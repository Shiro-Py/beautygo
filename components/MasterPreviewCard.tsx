import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';

type Props = {
  name: string;
  service: string;
  rating: number;
  onPress: () => void;
  avatarPlaceholder?: string;
};

export default function MasterPreviewCard({ name, service, rating, onPress, avatarPlaceholder }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {avatarPlaceholder ? (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{avatarPlaceholder}</Text>
        </View>
      ) : (
        <Image
          source={{ uri: 'https://via.placeholder.com/60x60.png?text=👩‍🎨' }}
          style={styles.avatar}
        />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.service}>{service} · ★{rating}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8E1E7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F7E7CE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6E6FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6E6FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#3E3A59',
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3E3A59',
    marginBottom: 4,
  },
  service: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#F8E1E7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 14,
    color: '#3E3A59',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
});