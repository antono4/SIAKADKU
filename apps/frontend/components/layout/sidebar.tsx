'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  CalendarCheck,
  ClipboardCheck,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';
import type { UserRole } from '@siakad/shared';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Pengguna', icon: Users },
    { href: '/admin/students', label: 'Mahasiswa', icon: GraduationCap },
    { href: '/admin/lecturers', label: 'Dosen', icon: Users },
    { href: '/admin/courses', label: 'Mata Kuliah', icon: BookOpen },
    { href: '/admin/schedules', label: 'Jadwal Kuliah', icon: CalendarDays },
    { href: '/admin/krs-verification', label: 'Verifikasi KRS', icon: ClipboardCheck },
    { href: '/admin/grades', label: 'Entry Nilai', icon: ClipboardList },
    { href: '/admin/academic-years', label: 'Tahun Ajaran', icon: CalendarCheck },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
  ],
  AKADEMIK: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/students', label: 'Mahasiswa', icon: GraduationCap },
    { href: '/admin/lecturers', label: 'Dosen', icon: Users },
    { href: '/admin/courses', label: 'Mata Kuliah', icon: BookOpen },
    { href: '/admin/schedules', label: 'Jadwal Kuliah', icon: CalendarDays },
    { href: '/admin/krs-verification', label: 'Verifikasi KRS', icon: ClipboardCheck },
    { href: '/admin/grades', label: 'Entry Nilai', icon: ClipboardList },
    { href: '/admin/academic-years', label: 'Tahun Ajaran', icon: CalendarCheck },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
  ],
  DOSEN: [
    { href: '/dosen', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dosen/students', label: 'Mahasiswa Bimbingan', icon: GraduationCap },
    { href: '/dosen/schedules', label: 'Jadwal Mengajar', icon: CalendarDays },
    { href: '/dosen/grades', label: 'Entry Nilai', icon: ClipboardList },
  ],
  MAHASISWA: [
    { href: '/mahasiswa', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/mahasiswa/krs', label: 'KRS', icon: ClipboardList },
    { href: '/mahasiswa/schedule', label: 'Jadwal Kuliah', icon: CalendarDays },
    { href: '/mahasiswa/khs', label: 'KHS', icon: FileText },
    { href: '/mahasiswa/transcript', label: 'Transkrip', icon: FileText },
  ],
};

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin',
  AKADEMIK: '/admin',
  DOSEN: '/dosen',
  MAHASISWA: '/mahasiswa',
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear } = useAuthStore();

  if (!user) return null;
  const items = NAV_BY_ROLE[user.role] ?? [];

  const handleLogout = () => {
    clear();
    router.push('/login');
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          S
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-slate-900">SIAKAD</span>
          <span className="text-[11px] text-slate-500">Terpadu v2</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== ROLE_HOME[user.role] && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-3 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-slate-900">{user.name}</span>
            <span className="text-xs text-slate-500">{user.username}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
