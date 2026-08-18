'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface Transcript {
  student: { npm: string; name: string; concentration?: { name: string } | null };
  semesters: {
    academicYear: { code: string; semester: string };
    rows: { courseCode: string; courseName: string; sks: number; grade: string; qualityPoints: number }[];
    totalSks: number;
    ips: number;
  }[];
  totalSks: number;
  ipk: number;
}

const GRADE_TONE: Record<string, 'green' | 'default' | 'yellow' | 'red' | 'slate'> = {
  A: 'green', B: 'default', C: 'yellow', D: 'red', E: 'red',
};

export default function MahasiswaTranscriptPage() {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.studentId ?? 0;
  const { data, isLoading } = useQuery<Transcript>({
    queryKey: ['transcript', studentId],
    queryFn: () => api.get(`/khs/transcript/${studentId}`),
    enabled: !!studentId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Transkrip Nilai</h2>
          <p className="text-sm text-slate-500">
            {data ? `${data.student.npm} — ${data.student.name}` : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Total SKS / IPK</p>
          <p className="text-lg font-bold text-slate-900">
            {data?.totalSks ?? '—'} SKS · <span className="text-green-600">{data?.ipk ?? '—'}</span>
          </p>
        </div>
      </div>

      {isLoading && <p className="text-slate-400">Memuat transkrip...</p>}

      {data?.semesters.map((sem, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>{sem.academicYear.code} — Semester {sem.academicYear.semester}</span>
              <Badge variant="slate">IPS {sem.ips} · {sem.totalSks} SKS</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Mata Kuliah</TableHead>
                  <TableHead>SKS</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>N x SKS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sem.rows.map((r, j) => (
                  <TableRow key={j}>
                    <TableCell className="font-medium">{r.courseCode}</TableCell>
                    <TableCell>{r.courseName}</TableCell>
                    <TableCell>{r.sks}</TableCell>
                    <TableCell><Badge variant={GRADE_TONE[r.grade] ?? 'slate'}>{r.grade}</Badge></TableCell>
                    <TableCell>{r.qualityPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {data && data.semesters.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-slate-400">
            Belum ada nilai yang terbit.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
