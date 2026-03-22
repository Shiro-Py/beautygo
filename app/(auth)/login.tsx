// app/(auth)/login.tsx — Шаг 1: ввод телефона
import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/errors';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { sendOtp, mockLogin } = useAuth();

  // Форматирует строку в маску +7 (XXX) XXX-XX-XX
  const applyPhoneMask = (raw: string): string => {
    let d = raw.replace(/\D/g, '');
    if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1);
    d = d.slice(0, 10);
    if (!d) return '';
    let result = '+7 (' + d.slice(0, 3);
    if (d.length > 3) result += ') ' + d.slice(3, 6);
    if (d.length > 6) result += '-' + d.slice(6, 8);
    if (d.length > 8) result += '-' + d.slice(8, 10);
    return result;
  };

  // Возвращает номер для API: +79991234567
  const getApiPhone = (): string => '+' + phone.replace(/\D/g, '');

  const validate = (): boolean => {
    const digits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      setError('Введите номер телефона');
      return false;
    }
    if (digits.length < 11) {
      setError('Введите полный номер телефона');
      return false;
    }
    return true;
  };

  const onSendOtp = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setError('');

    const apiPhone = getApiPhone();
    try {
      await sendOtp(apiPhone);
      router.push({ pathname: '/otp' as any, params: { phone: apiPhone } });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.getUserMessage());
      } else {
        setError('Не удалось отправить код. Проверьте номер.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emoji}>💄</Text>
        <Text style={styles.title}>Войти в BeautyGO</Text>
        <Text style={styles.subtitle}>
          Введите номер телефона — отправим SMS с кодом
        </Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Номер телефона</Text>
          <TextInput
            placeholder="+7 (999) 000-00-00"
            value={phone}
            onChangeText={(v) => { setPhone(applyPhoneMask(v)); setError(''); }}
            style={[styles.input, error ? styles.inputError : null]}
            keyboardType="phone-pad"
            autoFocus
            editable={!isLoading}
          />
        </View>

        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={onSendOtp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#3E3A59" />
          ) : (
            <Text style={styles.buttonText}>Получить код →</Text>
          )}
        </Pressable>

        <Text style={styles.hint}>
          Нет аккаунта? Просто введите телефон — мы создадим его автоматически.
        </Text>

        {__DEV__ && (
          <Pressable style={styles.mockButton} onPress={mockLogin}>
            <Text style={styles.mockButtonText}>🧪 Mock Login (dev)</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: '#fff' },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3E3A59',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorBanner: {
    backgroundColor: '#FDEDEC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
  },
  errorText: { color: '#C0392B', fontSize: 14 },
  field: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3E3A59',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: '#FAFAFA',
    letterSpacing: 1,
  },
  inputError: { borderColor: '#E74C3C', backgroundColor: '#FDEDEC' },
  button: {
    backgroundColor: '#F8E1E7',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#3E3A59', fontSize: 17, fontWeight: '600' },
  hint: {
    marginTop: 20,
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 18,
  },
  mockButton: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  mockButtonText: { color: '#999', fontSize: 13 },
});
