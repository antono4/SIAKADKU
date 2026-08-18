'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface KrsItem {
  id: number;
  verified: boolean;
  course: { courseCode: string; courseName: string; sks: number; semester: number };
  schedule: { lecturer: { name: string } | null; classroom: { name: string } | null } | null;
  academicYear: { code: string; semester: string };
}

export default function MahasiswaKrsPage() {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.studentId ?? 0;
  const { data, isLoading } = useQuery<KrsItem[]>({
    queryKey: ['krs', 'student', studentId],
    queryFn: () => api.get(`/krs/student/${studentId}`),
    enabled: !!studentId,
  });

  const totalSks = (data ?? []).reduce((sum, item) => sum + item.course.sks, 0);
  const ay = data?.[0]?.academicYear;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kartu Rencana Studi (KRS)</h2>
          <p className="text-sm text-slate-500">
            {ay ? `${ay.code} — Semester ${ay.semester}` : 'Belum ada tahun ajaran aktif'}
          </p>
        </div>
        <Badge variant="slate">Total {totalSks} SKS</Badge>
      </div>
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>SKS</TableHead>
                <TableHead>Dosen</TableHead>
                <TableHead>Ruang</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">Memuat...</TableCell>
                </TableRow>
              )}
              {data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.course.courseCode}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.course.courseName}</div>
                    <div className="text-xs text-slate-500">Semester {item.course.semester}</div>
                  </TableCell>
                  <TableCell>{item.course.sks}</TableCell>
                  <TableCell>{item.schedule?.lecturer?.name ?? '—'}</TableCell>
                  <TableCell>{item.schedule?.classroom?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={item.verified ? 'green' : 'yellow'}>
                      {item.verified ? 'Terverifikasi' : 'Menunggu'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">
                    Anda belum menyusun KRS
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
