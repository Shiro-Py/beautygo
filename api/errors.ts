// api/errors.ts
export type ApiErrorCode = 
  | 'UNAUTHORIZED' 
  | 'FORBIDDEN' 
  | 'NOT_FOUND' 
  | 'SERVER_ERROR' 
  | 'TIMEOUT' 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN';

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public message: string,
    public status?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromAxiosError(error: any): ApiError {
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return new ApiError('TIMEOUT', 'Нет ответа от сервера. Проверьте подключение.', 0, error);
      }
      return new ApiError('NETWORK_ERROR', 'Ошибка сети. Проверьте интернет-соединение.', 0, error);
    }

    const { status } = error.response;
    const data = error.response.data;

    switch (status) {
      case 401:
        return new ApiError('UNAUTHORIZED', 'Сессия истекла. Пожалуйста, войдите снова.', status, error);
      case 403:
        return new ApiError('FORBIDDEN', 'Доступ запрещён.', status, error);
      case 404:
        return new ApiError('NOT_FOUND', data?.detail || 'Ресурс не найден.', status, error);
      case 400:
      case 422:
        return new ApiError('VALIDATION_ERROR', data?.detail || data?.message || 'Ошибка валидации данных.', status, error);
      case 500:
      case 502:
      case 503:
        return new ApiError('SERVER_ERROR', 'Ошибка сервера. Попробуйте позже.', status, error);
      default:
        return new ApiError('UNKNOWN', data?.detail || data?.message || 'Произошла непредвиденная ошибка.', status, error);
    }
  }

  getUserMessage(): string {
    return this.message;
  }
}