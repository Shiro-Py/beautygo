// app/(auth)/otp.tsx — Шаг 2: ввод OTP-кода
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Pressable,
  StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/errors';

const CODE_LENGTH = 6;
const IS_MOCK = process.env.EXPO_PUBLIC_OTP_MOCK === 'true';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const { verifyOtp, sendOtp } = useAuth();

  // Таймер обратного отсчёта
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const onVerify = async (code: string) => {
    if (code.length !== CODE_LENGTH) return;
    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyOtp(phone!, code);
      if (!result.has_profile) {
        router.replace({ pathname: '/register' as any, params: { phone: phone! } });
      } else {
        router.replace('/(tabs)/masters');
      }
    } catch (err) {
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      if (err instanceof ApiError) {
        setError(err.getUserMessage());
      } else {
        setError('Неверный код. Попробуйте ещё раз.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (text: string, index: number) => {
    setError('');
    const newDigits = [...digits];

    // Обработка вставки / SMS AutoFill (несколько цифр сразу)
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
      const filled = [...pasted.split(''), ...Array(CODE_LENGTH).fill('')].slice(0, CODE_LENGTH);
      setDigits(filled);
      const nextFocus = Math.min(pasted.length, CODE_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      if (pasted.length === CODE_LENGTH) {
        onVerify(pasted);
      }
      return;
    }

    const digit = text.replace(/\D/g, '');
    newDigits[index] = digit;
    setDigits(newDigits);

    // Автопереход на следующее поле
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Автоверификация при заполнении последнего поля
    const fullCode = newDigits.join('');
    if (!newDigits.includes('') && fullCode.length === CODE_LENGTH) {
      onVerify(fullCode);
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onResend = async () => {
    if (countdown > 0 || !phone) return;
    setIsResending(true);
    setError('');
    try {
      const result = await sendOtp(phone);
      setCountdown(result.retry_after ?? 60);
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.getUserMessage());
      } else {
        setError('Не удалось отправить код повторно.');
      }
    } finally {
      setIsResending(false);
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
      >
        {/* Кнопка назад */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Назад</Text>
        </Pressable>

        <Text style={styles.emoji}>📱</Text>
        <Text style={styles.title}>Введите код</Text>
        <Text style={styles.subtitle}>
          Отправили SMS на{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        {IS_MOCK && (
          <View style={styles.mockBanner}>
            <Text style={styles.mockText}>🧪 Mock режим — используй код 1234</Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 6 отдельных полей для кода */}
        <View style={styles.codeContainer}>
          {digits.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              value={digit}
              onChangeText={(text) => handleChange(text, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              style={[
                styles.codeCell,
                digit ? styles.codeCellFilled : null,
                error ? styles.codeCellError : null,
              ]}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              textAlign="center"
              selectTextOnFocus
              editable={!isVerifying}
              autoFocus={i === 0}
              // iOS: автозаполнение из SMS
              textContentType={i === 0 ? 'oneTimeCode' : 'none'}
              // Android: подсказка системе автозаполнения
              autoComplete={i === 0 ? 'sms-otp' : 'off'}
            />
          ))}
        </View>

        {isVerifying && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#3E3A59" />
            <Text style={styles.loadingText}>Проверяем код...</Text>
          </View>
        )}

        {/* Повторная отправка */}
        <Pressable
          style={[styles.resendButton, (countdown > 0 || isResending) && styles.resendDisabled]}
          onPress={onResend}
          disabled={countdown > 0 || isResending}
        >
          {isResending ? (
            <ActivityIndicator color="#3E3A59" size="small" />
          ) : countdown > 0 ? (
            <Text style={styles.resendText}>Отправить повторно через {countdown}с</Text>
          ) : (
            <Text style={[styles.resendText, styles.resendActive]}>Отправить код повторно</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  backButton: { marginBottom: 24 },
  backText: { color: '#3E3A59', fontSize: 16, fontWeight: '500' },
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  mockBanner: {
    backgroundColor: '#FFF8DC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F39C12',
  },
  mockText: { color: '#856404', fontSize: 13, textAlign: 'center' },
  codeCell: {
    width: 48,
    height: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#3E3A59',
    backgroundColor: '#FAFAFA',
  },
  codeCellFilled: { borderColor: '#3E3A59', backgroundColor: '#F0EEF8' },
  codeCellError: { borderColor: '#E74C3C', backgroundColor: '#FDEDEC' },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loadingText: { color: '#777', fontSize: 14 },
  resendButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendDisabled: { opacity: 0.5 },
  resendText: { fontSize: 15, color: '#aaa' },
  resendActive: { color: '#3E3A59', fontWeight: '600', textDecorationLine: 'underline' },
});
