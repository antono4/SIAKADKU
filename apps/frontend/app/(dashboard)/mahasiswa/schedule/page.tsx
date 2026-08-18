'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface KrsItem {
  id: number;
  course: { courseCode: string; courseName: string; sks: number };
  schedule: {
    day: string; sessionStart: string; sessionEnd: string;
    lecturer: { name: string } | null; classroom: { name: string } | null;
  } | null;
}

const DAYS: Record<string, string> = {
  senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu', kamis: 'Kamis',
  jumat: 'Jumat', sabtu: 'Sabtu', minggu: 'Minggu',
};

export default function MahasiswaSchedulePage() {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.studentId ?? 0;
  const { data, isLoading } = useQuery<KrsItem[]>({
    queryKey: ['schedule', 'student', studentId],
    queryFn: () => api.get(`/krs/student/${studentId}`),
    enabled: !!studentId,
  });

  const withSchedule = (data ?? []).filter((k) => k.schedule);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Jadwal Kuliah</h2>
        <p className="text-sm text-slate-500">Jadwal perkuliahan Anda</p>
      </div>
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hari</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>Dosen</TableHead>
                <TableHead>Ruang</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400">Memuat...</TableCell>
                </TableRow>
              )}
              {withSchedule.map((item) => item.schedule && (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{DAYS[item.schedule.day] ?? item.schedule.day}</TableCell>
                  <TableCell>
                    <Badge variant="slate">{item.schedule.sessionStart} - {item.schedule.sessionEnd}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.course.courseCode}</div>
                    <div className="text-xs text-slate-500">{item.course.courseName}</div>
                  </TableCell>
                  <TableCell>{item.schedule.lecturer?.name ?? '—'}</TableCell>
                  <TableCell>{item.schedule.classroom?.name ?? '—'}</TableCell>
                </TableRow>
              ))}
              {withSchedule.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400">
                    Belum ada jadwal
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
