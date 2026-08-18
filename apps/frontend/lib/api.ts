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

// Refresh token is stored in localStorage parallel to the access token kept in
// the zustand persisted store. On 401 we attempt a single refresh, then retry.
async function getRefreshToken(): Promise<string> {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('siakad-refresh') ?? '';
}

export function setRefreshToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('siakad-refresh', token);
}

export function clearRefreshToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('siakad-refresh');
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

function doRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const rt = await getRefreshToken();
      if (!rt) return null;
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) throw new Error('refresh failed');
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      const state = useAuthStore.getState();
      if (state.user) state.setSession(state.user, data.accessToken);
      setRefreshToken(data.refreshToken);
      return data.accessToken;
    } catch {
      useAuthStore.getState().clear();
      clearRefreshToken();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = opts;
  let token = useAuthStore.getState().accessToken;

  const doFetch = (t: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(auth && t ? { Authorization: `Bearer ${t}` } : {}),
        ...(headers as Record<string, string>),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch(token);

  // 401 → attempt single refresh, then retry once
  if (res.status === 401 && auth && token) {
    const newToken = await doRefresh();
    if (newToken) {
      token = newToken;
      res = await doFetch(newToken);
    }
  }

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
  // raw blob download (for PDF/Excel exports) — also handles 401 refresh
  download: async (path: string): Promise<Blob> => {
    let token = useAuthStore.getState().accessToken;
    const doFetch = (t: string | null) =>
      fetch(`${API_BASE}${path}`, {
        headers: t ? { Authorization: `Bearer ${t}` } : {},
      });
    let res = await doFetch(token);
    if (res.status === 401 && token) {
      const newToken = await doRefresh();
      if (newToken) {
        token = newToken;
        res = await doFetch(newToken);
      }
    }
    if (!res.ok) throw new ApiError('Unduhan gagal', res.status, await res.text());
    return res.blob();
  },
};

export async function login(username: string, password: string) {
  const result = await api.post<{ accessToken: string; refreshToken: string; user: AuthUserShape }>(
    '/auth/login',
    { username, password },
    { auth: false },
  );
  setRefreshToken(result.refreshToken);
  return result;
}

export async function logout() {
  try {
    await api.post('/auth/logout', { userId: useAuthStore.getState().user?.id });
  } catch {
    // ignore
  }
  clearRefreshToken();
  useAuthStore.getState().clear();
}

export type AuthUserShape = {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'AKADEMIK' | 'DOSEN' | 'MAHASISWA';
  studentId?: number | null;
  lecturerId?: number | null;
};
