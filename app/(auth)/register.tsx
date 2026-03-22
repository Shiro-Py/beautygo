// app/(auth)/register.tsx — Шаг 3: завершение регистрации (только для новых пользователей)
import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/errors';

export default function RegisterScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; general?: string }>({});

  const router = useRouter();
  const { completeRegistration } = useAuth();

  const validate = (): boolean => {
    if (!firstName.trim()) {
      setErrors({ firstName: 'Введите имя' });
      return false;
    }
    return true;
  };

  const onComplete = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});

    try {
      await completeRegistration({
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
      });
      router.replace('/(tabs)/masters');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ general: err.getUserMessage() });
      } else {
        setErrors({ general: 'Не удалось завершить регистрацию. Попробуйте позже.' });
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
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>Добро пожаловать!</Text>
        <Text style={styles.subtitle}>
          Расскажите, как вас зовут{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        {errors.general ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Имя *</Text>
          <TextInput
            placeholder="Анна"
            value={firstName}
            onChangeText={(v) => { setFirstName(v); setErrors({}); }}
            style={[styles.input, errors.firstName && styles.inputError]}
            autoFocus
            autoCapitalize="words"
            editable={!isLoading}
          />
          {errors.firstName ? (
            <Text style={styles.fieldError}>{errors.firstName}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Фамилия <Text style={styles.optional}>(необязательно)</Text></Text>
          <TextInput
            placeholder="Иванова"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
            autoCapitalize="words"
            editable={!isLoading}
          />
        </View>

        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={onComplete}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#3E3A59" />
          ) : (
            <Text style={styles.buttonText}>Начать пользоваться →</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
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
  phone: { color: '#3E3A59', fontWeight: '600' },
  errorBanner: {
    backgroundColor: '#FDEDEC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
  },
  errorText: { color: '#C0392B', fontSize: 14 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#3E3A59', marginBottom: 8 },
  optional: { fontWeight: '400', color: '#aaa' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputError: { borderColor: '#E74C3C', backgroundColor: '#FDEDEC' },
  fieldError: { fontSize: 12, color: '#E74C3C', marginTop: 6, marginLeft: 4 },
  button: {
    backgroundColor: '#F8E1E7',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#3E3A59', fontSize: 17, fontWeight: '600' },
});
