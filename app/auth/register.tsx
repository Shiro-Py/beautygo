import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../../api/auth';
import { ApiError } from '../../api/errors';
import { RegisterCredentials } from '../../api/constants';

type Role = 'client' | 'specialist';

export default function RegisterScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Форма
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('client');

  // Валидация
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterCredentials | 'confirmPassword', string>>>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = 'Введите имя пользователя';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Минимум 3 символа';
    }

    if (!email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Введите телефон';
    } else if (phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Минимум 10 цифр';
    }

    if (!password) {
      newErrors.password = 'Введите пароль';
    } else if (password.length < 6) {
      newErrors.password = 'Минимум 6 символов';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Ошибка', 'Исправьте ошибки в форме');
      return;
    }

    setIsLoading(true);

    try {
      const data: RegisterCredentials = {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      };

      await AuthService.register(data);

      Alert.alert(
        'Успешно!',
        'Аккаунт создан. Теперь войдите.',
        [
          {
            text: 'Войти',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } catch (error) {
      if (error instanceof ApiError) {
        // Показываем конкретную ошибку от сервера
        Alert.alert('Ошибка регистрации', error.getUserMessage());
      } else {
        Alert.alert('Ошибка', 'Непредвиденная ошибка. Попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Регистрация</Text>
        <Text style={styles.subtitle}>Создайте аккаунт для продолжения</Text>

        {/* Имя пользователя */}
        <View style={styles.field}>
          <Text style={styles.label}>Имя пользователя *</Text>
          <TextInput
            placeholder="username"
            value={username}
            onChangeText={setUsername}
            style={[styles.input, errors.username && styles.inputError]}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
        </View>

        {/* Email */}
        <View style={styles.field}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            placeholder="example@mail.ru"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, errors.email && styles.inputError]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Телефон */}
        <View style={styles.field}>
          <Text style={styles.label}>Телефон *</Text>
          <TextInput
            placeholder="+7 999 123 45 67"
            value={phone}
            onChangeText={setPhone}
            style={[styles.input, errors.phone && styles.inputError]}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Пароль */}
        <View style={styles.field}>
          <Text style={styles.label}>Пароль *</Text>
          <TextInput
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, errors.password && styles.inputError]}
            secureTextEntry
            editable={!isLoading}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* Подтверждение пароля */}
        <View style={styles.field}>
          <Text style={styles.label}>Подтвердите пароль *</Text>
          <TextInput
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            secureTextEntry
            editable={!isLoading}
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        {/* Роль */}
        <View style={styles.field}>
          <Text style={styles.label}>Я хочу зарегистрироваться как *</Text>
          <View style={styles.roleContainer}>
            <Pressable
              style={[styles.roleButton, role === 'client' && styles.roleButtonActive]}
              onPress={() => setRole('client')}
              disabled={isLoading}
            >
              <Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>
                👤 Клиент
              </Text>
            </Pressable>
            <Pressable
              style={[styles.roleButton, role === 'specialist' && styles.roleButtonActive]}
              onPress={() => setRole('specialist')}
              disabled={isLoading}
            >
              <Text style={[styles.roleText, role === 'specialist' && styles.roleTextActive]}>
              💼 Специалист
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Кнопка регистрации */}
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#3E3A59" />
          ) : (
            <Text style={styles.buttonText}>Зарегистрироваться</Text>
          )}
        </Pressable>

        {/* Вход вместо регистрации */}
        <Pressable
          style={styles.loginLink}
          onPress={() => router.push('/auth/login')}
          disabled={isLoading}
        >
          <Text style={styles.loginLinkText}>
            Уже есть аккаунт? <Text style={styles.loginLinkBold}>Войти</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 50 : 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3E3A59',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginBottom: 32,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
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
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FDEDEC',
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 6,
    marginLeft: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#F8E1E7',
    backgroundColor: '#F8E1E7',
  },
  roleText: {
    fontSize: 15,
    color: '#777',
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#3E3A59',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#F8E1E7',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#3E3A59',
    fontSize: 17,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginLinkText: {
    fontSize: 15,
    color: '#777',
  },
  loginLinkBold: {
    color: '#3E3A59',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});