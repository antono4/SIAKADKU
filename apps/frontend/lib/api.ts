import { useAuthStore } from './auth-store';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = opts;
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new ApiError(
      (typeof data === 'object' && data && 'message' in data
        ? String((data as { message: unknown }).message)
        : res.statusText) || 'Request gagal',
      res.status,
      data,
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  del: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'DELETE' }),
};

export async function login(username: string, password: string) {
  return api.post<{ accessToken: string; refreshToken: string; user: AuthUserShape }>(
    '/auth/login',
    { username, password },
    { auth: false },
  );
}

export type AuthUserShape = {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'AKADEMIK' | 'DOSEN' | 'MAHASISWA';
  studentId?: number | null;
  lecturerId?: number | null;
};
