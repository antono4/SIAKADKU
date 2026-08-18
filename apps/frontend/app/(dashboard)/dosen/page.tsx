'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarDays, GraduationCap, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface LecturerOverview {
  counts: { schedules: number; courses: number; studentsSupervised: number };
  recentCourses: {
    id: number;
    course: { courseCode: string; courseName: string; sks: number };
    academicYear: { code: string; semester: string };
  }[];
}

export default function DosenDashboardPage() {
  const { data } = useQuery<LecturerOverview>({
    queryKey: ['dashboard', 'lecturer'],
    queryFn: () => api.get('/dashboard/lecturer'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard Dosen</h2>
        <p className="text-sm text-slate-500">Ringkasan aktivitas mengajar</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Jadwal Mengajar" value={data?.counts.schedules ?? '—'} icon={CalendarDays} tone="brand" />
        <StatCard label="Mata Kuliah" value={data?.counts.courses ?? '—'} icon={GraduationCap} tone="green" />
        <StatCard label="Mahasiswa Bimbingan" value={data?.counts.studentsSupervised ?? '—'} icon={Users} tone="yellow" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mata Kuliah Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>SKS</TableHead>
                <TableHead>Tahun Ajaran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.recentCourses ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.course.courseCode}</TableCell>
                  <TableCell>{c.course.courseName}</TableCell>
                  <TableCell>
                    <Badge variant="slate">{c.course.sks} SKS</Badge>
                  </TableCell>
                  <TableCell>
                    {c.academicYear.code} ({c.academicYear.semester})
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.recentCourses || data.recentCourses.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-400">
                    Belum ada jadwal mengajar
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
