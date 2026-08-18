'use client';

import { useQuery } from '@tanstack/react-query';
import { GraduationCap, BookOpen, Users, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';

interface Overview {
  counts: {
    totalStudents: number;
    activeStudents: number;
    nonactiveStudents: number;
    graduatedStudents: number;
    totalCourses: number;
    totalLecturers: number;
    totalSchedules: number;
  };
  studentsByYear: { year: string; reguler: number; pindahan: number }[];
}

export default function AdminDashboardPage() {
  const { data } = useQuery<Overview>({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.get('/dashboard'),
  });

  const counts = data?.counts;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard Akademik</h2>
        <p className="text-sm text-slate-500">Ringkasan data institusi</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Mahasiswa Aktif"
          value={counts?.activeStudents ?? '—'}
          icon={GraduationCap}
          tone="green"
        />
        <StatCard
          label="Mahasiswa Nonaktif"
          value={counts?.nonactiveStudents ?? '—'}
          icon={Users}
          tone="yellow"
        />
        <StatCard
          label="Mata Kuliah"
          value={counts?.totalCourses ?? '—'}
          icon={BookOpen}
          tone="brand"
        />
        <StatCard
          label="Dosen & Jadwal"
          value={`${counts?.totalLecturers ?? '—'} / ${counts?.totalSchedules ?? '—'}`}
          icon={CalendarDays}
          tone="slate"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mahasiswa per Tahun Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tahun Masuk</TableHead>
                <TableHead>Reguler</TableHead>
                <TableHead>Pindahan</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.studentsByYear ?? []).map((row) => (
                <TableRow key={row.year}>
                  <TableCell className="font-medium">{row.year}</TableCell>
                  <TableCell>{row.reguler}</TableCell>
                  <TableCell>{row.pindahan}</TableCell>
                  <TableCell className="font-semibold">
                    {row.reguler + row.pindahan}
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.studentsByYear || data.studentsByYear.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-400">
                    Belum ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
