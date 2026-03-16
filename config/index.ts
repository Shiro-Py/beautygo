interface EnvConfig {
  API_BASE_URL: string;
  ENV_NAME: 'dev' | 'stage' | 'prod' | 'mock';
  API_TIMEOUT: number;
  USE_MOCK_SERVER: boolean;
  MOCK_DELAY: number;
  isDev: boolean;
  isStage: boolean;
  isProd: boolean;
  isMock: boolean;
}

class Config {
  private static _instance: Config;
  private config: EnvConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  public static getInstance(): Config {
    if (!Config._instance) {
      Config._instance = new Config();
    }
    return Config._instance;
  }

  private loadConfig(): EnvConfig {
    // ✅ Читаем ТОЛЬКО из process.env (с префиксом EXPO_PUBLIC_)
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';
    const ENV_NAME = (process.env.EXPO_PUBLIC_ENV_NAME || 'dev') as EnvConfig['ENV_NAME'];
    const API_TIMEOUT = process.env.EXPO_PUBLIC_API_TIMEOUT || '15000';
    const USE_MOCK_SERVER = process.env.EXPO_PUBLIC_USE_MOCK_SERVER || 'false';
    const MOCK_DELAY = process.env.EXPO_PUBLIC_MOCK_DELAY || '0';

    return {
      API_BASE_URL,
      ENV_NAME,
      API_TIMEOUT: parseInt(API_TIMEOUT, 10),
      USE_MOCK_SERVER: String(USE_MOCK_SERVER).toLowerCase() === 'true',
      MOCK_DELAY: parseInt(MOCK_DELAY, 10),
      isDev: ENV_NAME === 'dev',
      isStage: ENV_NAME === 'stage',
      isProd: ENV_NAME === 'prod',
      isMock: ENV_NAME === 'mock',
    };
  }

  private validateConfig(): void {
    const errors: string[] = [];

    if (!this.config.API_BASE_URL) {
      errors.push('API_BASE_URL is not configured');
    }

    if (!['dev', 'stage', 'prod', 'mock'].includes(this.config.ENV_NAME)) {
      errors.push(`Invalid ENV_NAME: ${this.config.ENV_NAME}`);
    }

    if (errors.length > 0) {
      console.error('❌ Configuration errors:', errors);
      if (__DEV__) {
       // throw new Error(`Configuration error: ${errors.join(', ')}`);
       console.warn('⚠️ Приложение может работать некорректно');
      }
    }
  }

  public get<T extends keyof EnvConfig>(key: T): EnvConfig[T] {
    return this.config[key];
  }

  public getAll(): EnvConfig {
    return { ...this.config };
  }

  public getBaseUrl(): string {
    return this.config.API_BASE_URL;
  }

  public getEnvName(): string {
    return this.config.ENV_NAME;
  }

  public isDevelopment(): boolean {
    return this.config.isDev;
  }

  public isProduction(): boolean {
    return this.config.isProd;
  }

  public useMockServer(): boolean {
    return this.config.USE_MOCK_SERVER;
  }

  public printConfig(): void {
    console.log('📋 Current Configuration:');
    console.log('  ENV_NAME:', this.config.ENV_NAME);
    console.log('  API_BASE_URL:', this.config.API_BASE_URL);
    console.log('  API_TIMEOUT:', this.config.API_TIMEOUT);
  }
}

export const config = Config.getInstance();
export default config;