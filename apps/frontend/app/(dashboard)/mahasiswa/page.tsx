'use client';

import { useQuery } from '@tanstack/react-query';
import { ClipboardList, FileText, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface StudentOverview {
  academicYear: { id: number; code: string; semester: string } | null;
  counts: { krsCourses: number; totalSks: number; publishedGrades: number };
}

export default function MahasiswaDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery<StudentOverview>({
    queryKey: ['dashboard', 'student', user?.studentId],
    queryFn: () => api.get('/dashboard/student'),
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard Mahasiswa</h2>
        <p className="text-sm text-slate-500">
          Tahun ajaran aktif: {data?.academicYear?.code ?? '—'} (
          {data?.academicYear?.semester ?? '—'})
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Mata Kuliah KRS"
          value={data?.counts.krsCourses ?? '—'}
          icon={ClipboardList}
          tone="brand"
        />
        <StatCard
          label="Total SKS"
          value={data?.counts.totalSks ?? '—'}
          icon={CalendarDays}
          tone="green"
        />
        <StatCard
          label="Nilai Terbit"
          value={data?.counts.publishedGrades ?? '—'}
          icon={FileText}
          tone="yellow"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Nama</dt>
              <dd className="font-medium text-slate-900">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">NPM</dt>
              <dd className="font-medium text-slate-900">{user?.username}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
