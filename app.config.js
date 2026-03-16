import 'dotenv/config';

export default {
  expo: {
    name: 'beauty-booking-app',
    slug: 'beauty-booking-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.beautybooking.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.beautybooking.app',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
    // ✅ Добавляем переменные окружения
    extra: {
      API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
      ENV_NAME: process.env.EXPO_PUBLIC_ENV_NAME,
      API_TIMEOUT: process.env.EXPO_PUBLIC_API_TIMEOUT,
      USE_MOCK_SERVER: process.env.EXPO_PUBLIC_USE_MOCK_SERVER,
      MOCK_DELAY: process.env.EXPO_PUBLIC_MOCK_DELAY,
    },
  },
};