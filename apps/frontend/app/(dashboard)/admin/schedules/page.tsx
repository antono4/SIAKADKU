'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface Schedule {
  id: number;
  day: string;
  sessionStart: string;
  sessionEnd: string;
  capacity: number;
  enrolledCount: number;
  course: { courseCode: string; courseName: string; sks: number };
  lecturer: { name: string } | null;
  classroom: { name: string } | null;
}

const DAYS: Record<string, string> = {
  senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu', kamis: 'Kamis',
  jumat: 'Jumat', sabtu: 'Sabtu', minggu: 'Minggu',
};

export default function SchedulesPage() {
  const { data, isLoading } = useQuery<Schedule[]>({
    queryKey: ['schedules'],
    queryFn: () => api.get('/schedules'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Jadwal Kuliah</h2>
        <p className="text-sm text-slate-500">Daftar jadwal perkuliahan</p>
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
                <TableHead>Kapasitas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">Memuat...</TableCell>
                </TableRow>
              )}
              {data?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{DAYS[s.day] ?? s.day}</TableCell>
                  <TableCell>
                    <Badge variant="slate">{s.sessionStart} - {s.sessionEnd}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{s.course.courseCode}</div>
                    <div className="text-xs text-slate-500">{s.course.courseName} ({s.course.sks} SKS)</div>
                  </TableCell>
                  <TableCell>{s.lecturer?.name ?? '—'}</TableCell>
                  <TableCell>{s.classroom?.name ?? '—'}</TableCell>
                  <TableCell>{s.enrolledCount}/{s.capacity}</TableCell>
                </TableRow>
              ))}
              {data && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">Tidak ada jadwal</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
