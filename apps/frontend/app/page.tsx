'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import type { UserRole } from '@siakad/shared';

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin',
  AKADEMIK: '/admin',
  DOSEN: '/dosen',
  MAHASISWA: '/mahasiswa',
};

export default function Home() {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!user || !accessToken) {
      router.replace('/login');
    } else {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [user, accessToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-400">
      Memuat...
    </div>
  );
}
