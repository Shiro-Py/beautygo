// api/logger.ts
type LogMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface LogOptions {
  method: LogMethod;
  url: string | undefined;
  status?: number;
  duration?: number;
  error?: unknown;
  requestData?: unknown;
  responseData?: unknown;
}

export const apiLogger = {
  request: ({ method, url, requestData }: LogOptions) => {
    if (__DEV__) {
      console.log(`[API] ➡️ ${method} ${url}`, {
        payload: requestData,
        timestamp: new Date().toISOString(),
      });
    }
  },

  response: ({ method, url, status, duration, responseData }: LogOptions) => {
    if (__DEV__) {
      console.log(`[API] ⬅️ ${method} ${url} — ${status} (${duration}ms)`, {
        response: responseData,
        timestamp: new Date().toISOString(),
      });
    }
  },

  error: ({ method, url, error, duration }: LogOptions) => {
    if (__DEV__) {
      console.error(`[API] ❌ ${method} ${url} — ERROR (${duration}ms)`, {
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString(),
      });
    }
  },
};