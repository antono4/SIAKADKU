'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { AppShell } from '@/components/layout/app-shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!user || !accessToken) {
      router.replace('/login');
    }
  }, [user, accessToken, router]);

  if (!user || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Mengarahkan ke halaman login...
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
