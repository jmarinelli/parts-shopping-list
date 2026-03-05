const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  meta: Record<string, unknown>;

  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ApiError';
    this.meta = meta;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const json = await response.json();

  if (!response.ok) {
    const { message, ...rest } = json.error ?? {};
    throw new ApiError(message ?? 'An unexpected error occurred', rest);
  }

  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
