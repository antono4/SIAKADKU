'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { canAccess, ROUTE_PREFIX_BY_ROLE } from '@/lib/rbac';
import { AppShell } from '@/components/layout/app-shell';
import type { UserRole } from '@siakad/shared';

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin',
  AKADEMIK: '/admin',
  DOSEN: '/dosen',
  MAHASISWA: '/mahasiswa',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!user || !accessToken) {
      router.replace('/login');
      return;
    }
    // Enforce role-based access: redirect to the user's home if they try to
    // reach a route group belonging to another role (e.g. mahasiswa → /admin).
    if (!canAccess(user.role as UserRole, pathname)) {
      router.replace(ROLE_HOME[user.role as UserRole]);
    }
  }, [user, accessToken, pathname, router]);

  if (!user || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Mengarahkan ke halaman login...
      </div>
    );
  }

  // While redirecting due to role mismatch, render nothing.
  if (!canAccess(user.role as UserRole, pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Mengarahkan...
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}

// re-export for sidebar consumers
export { ROUTE_PREFIX_BY_ROLE };
