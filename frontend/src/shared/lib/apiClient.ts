import { useAuthStore } from '@/features/auth/store/auth.store';

const BASE_URL = (
  import.meta.env.VITE_API_URL as string | undefined
)?.replace(/\/+$/, '') ?? 'http://localhost:3000';

const REFRESH_PATH = '/api/auth/refresh';

const AUTH_EXEMPT_PATHS = new Set<string>([
  '/api/auth/client/login',
  '/api/auth/admin/login',
  '/api/auth/client/register',
  '/api/auth/refresh',
]);

export interface ApiErrorBody {
  message?: string;
}

export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${BASE_URL}${REFRESH_PATH}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new ApiError(`Refresh failed with status ${res.status}`, res.status);
      }

      const data = (await res.json()) as { accessToken: string };
      useAuthStore.setState({ accessToken: data.accessToken });
      return data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as ApiErrorBody;
      if (typeof body.message === 'string' && body.message.length > 0) {
        message = body.message;
      }
    } catch {
      // No se pudo leer un cuerpo JSON (respuesta vacía o texto plano)
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const headers = new Headers();

  const isForm = body instanceof FormData;
  if (!isForm) {
    headers.set('Content-Type', 'application/json');
  }

  const token = useAuthStore.getState().accessToken;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const init: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  if (body !== undefined) {
    init.body = isForm ? (body as FormData) : JSON.stringify(body);
  }

  let res = await fetch(`${BASE_URL}${path}`, init);

  if (res.status === 401 && !AUTH_EXEMPT_PATHS.has(path)) {
    try {
      const newToken = await refreshAccessToken();
      headers.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(`${BASE_URL}${path}`, init);
    } catch (error) {
      useAuthStore.getState().clearSession();
      throw error;
    }
  }

  return parseResponse<T>(res);
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, 'GET');
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, 'POST', body);
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, 'PUT', body);
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, 'PATCH', body);
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, 'DELETE');
  },
};