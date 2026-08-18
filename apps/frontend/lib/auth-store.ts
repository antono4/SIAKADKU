import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'AKADEMIK' | 'DOSEN' | 'MAHASISWA';
  studentId?: number | null;
  lecturerId?: number | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setSession: (user: AuthUser, token: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setSession: (user, token) => set({ user, accessToken: token }),
      clear: () => set({ user: null, accessToken: null }),
    }),
    { name: 'siakad-auth' },
  ),
);
