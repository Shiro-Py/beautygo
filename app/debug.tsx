import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import config from '../config';
import { TokenManager } from '../api/token-manager';

export default function DebugScreen() {
  const router = useRouter();
  const envConfig = config.getAll();

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('✅ Скопировано', `${label} скопирован в буфер обмена`);
  };

  const clearStorage = async () => {
    Alert.alert(
      '⚠️ Очистка данных',
      'Вы уверены, что хотите удалить все токены?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            await TokenManager.clearTokens();
            Alert.alert('✅ Очищено', 'Все токены удалены');
          },
        },
      ]
    );
  };

  const switchEnvironment = (env: 'dev' | 'stage' | 'prod' | 'mock') => {
    Alert.alert(
      '🔄 Смена окружения',
      `Переключиться на ${env}? Приложение перезапустится.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Переключить',
          onPress: () => {
            // В реальном приложении здесь можно было бы:
            // 1. Сохранить выбор в AsyncStorage
            // 2. Перезагрузить приложение
            // 3. Использовать expo-updates для горячей перезагрузки
            Alert.alert(
              'ℹ️ Информация',
              `Для смены окружения выполните:\n\n` +
                `1. Скопируйте .env.${env} в .env\n` +
                `2. Перезапустите: npx expo start -c\n\n` +
                `Или используйте: npx expo start --config app.config.${env}.js`
            );
          },
        },
      ]
    );
  };

  const CopyableRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Pressable onPress={() => copyToClipboard(value, label)} style={styles.valueContainer}>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.copyIcon}>📋</Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🔧 Debug Screen</Text>

      {/* Environment Badge */}
      <View style={[styles.badge, styles[`badge_${envConfig.ENV_NAME}`]]}>
        <Text style={styles.badgeText}>{envConfig.ENV_NAME.toUpperCase()}</Text>
      </View>

      {/* Configuration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Configuration</Text>
        
        <CopyableRow label="ENV_NAME" value={envConfig.ENV_NAME} />
        <CopyableRow label="API_BASE_URL" value={envConfig.API_BASE_URL} />
        <CopyableRow label="API_TIMEOUT" value={String(envConfig.API_TIMEOUT)} />
        <CopyableRow label="USE_MOCK_SERVER" value={String(envConfig.USE_MOCK_SERVER)} />
        <CopyableRow label="MOCK_DELAY" value={String(envConfig.MOCK_DELAY)} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        
        <Pressable style={styles.actionButton} onPress={clearStorage}>
          <Text style={styles.actionButtonText}>🗑️ Clear Tokens</Text>
        </Pressable>

        <Pressable 
          style={styles.actionButton} 
          onPress={() => config.printConfig()}
        >
          <Text style={styles.actionButtonText}>📝 Print Config to Console</Text>
        </Pressable>
      </View>

      {/* Environment Switcher */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Switch Environment</Text>
        
        <View style={styles.envButtons}>
          <Pressable
            style={[styles.envButton, envConfig.ENV_NAME === 'dev' && styles.envButtonActive]}
            onPress={() => switchEnvironment('dev')}
          >
            <Text style={[styles.envButtonText, envConfig.ENV_NAME === 'dev' && styles.envButtonTextActive]}>
              Dev
            </Text>
          </Pressable>

          <Pressable
            style={[styles.envButton, envConfig.ENV_NAME === 'stage' && styles.envButtonActive]}
            onPress={() => switchEnvironment('stage')}
          >
            <Text style={[styles.envButtonText, envConfig.ENV_NAME === 'stage' && styles.envButtonTextActive]}>
              Stage
            </Text>
          </Pressable>

          <Pressable
            style={[styles.envButton, envConfig.ENV_NAME === 'prod' && styles.envButtonActive]}
            onPress={() => switchEnvironment('prod')}
          >
            <Text style={[styles.envButtonText, envConfig.ENV_NAME === 'prod' && styles.envButtonTextActive]}>
              Prod
            </Text>
          </Pressable>

          <Pressable
            style={[styles.envButton, envConfig.ENV_NAME === 'mock' && styles.envButtonActive]}
            onPress={() => switchEnvironment('mock')}
          >
            <Text style={[styles.envButtonText, envConfig.ENV_NAME === 'mock' && styles.envButtonTextActive]}>
              Mock
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3E3A59',
    marginBottom: 16,
    textAlign: 'center',
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badge_dev: {
    backgroundColor: '#FFE4E1',
  },
  badge_stage: {
    backgroundColor: '#FFF8DC',
  },
  badge_prod: {
    backgroundColor: '#F0FFF0',
  },
  badge_mock: {
    backgroundColor: '#E6E6FA',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3E3A59',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E3A59',
    marginBottom: 12,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#3E3A59',
    fontFamily: 'monospace',
  },
  copyIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: '#F8E1E7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#3E3A59',
    fontSize: 16,
    fontWeight: '600',
  },
  envButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  envButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  envButtonActive: {
    backgroundColor: '#F8E1E7',
  },
  envButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777',
  },
  envButtonTextActive: {
    color: '#3E3A59',
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonText: {
    color: '#3E3A59',
    fontSize: 16,
    fontWeight: '600',
  },
});