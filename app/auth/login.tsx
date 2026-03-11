// app/auth/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../../api/auth';
import { ApiError } from '../../api/errors';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Заполните имя пользователя и пароль');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.login({ username, password });
      router.replace('/(tabs)/masters'); // Успех → главная
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Ошибка входа', error.getUserMessage());
        // Если 401 — редирект уже выполнен в interceptor
        if (error.code === 'UNAUTHORIZED') return;
      } else {
        Alert.alert('Ошибка', 'Непредвиденная ошибка. Попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>
      
      <TextInput
        placeholder="Имя пользователя"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        editable={!isLoading}
      />
      
      <Pressable 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={onLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#3E3A59" />
        ) : (
          <Text style={styles.buttonText}>Войти</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#F8E1E7', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#3E3A59', fontSize: 16, fontWeight: '500' },
});