'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Sidebar } from '@/components/layout/sidebar';
import { RoleBadge } from '@/components/ui/role-badge';

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Selamat datang, {user.name.split(' ')[0]} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <RoleBadge role={user.role} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
