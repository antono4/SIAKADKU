'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { downloadPdf, openPrintablePdf } from '@/lib/download';
import { useAuthStore } from '@/lib/auth-store';

interface KhsResult {
  student: { npm: string; name: string; className: string | null; concentration?: { name: string } | null };
  academicYear: { code: string; semester: string };
  rows: {
    courseCode: string; courseName: string; sks: number;
    finalScore: number | null; grade: string | null; weight: number | null; qualityPoints: number | null;
  }[];
  totalSks: number;
  ips: number;
  ipk: number;
}

const GRADE_TONE: Record<string, 'green' | 'default' | 'yellow' | 'red' | 'slate'> = {
  A: 'green', B: 'default', C: 'yellow', D: 'red', E: 'red',
};

export default function MahasiswaKhsPage() {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.studentId ?? 0;
  const { data: activeYear } = useQuery<{ id: number } | null>({
    queryKey: ['active-year'],
    queryFn: async () => {
      try {
        return await api.get('/academic-years/active');
      } catch {
        return null;
      }
    },
  });

  const [ayId, setAyId] = useState<number | null>(null);
  const targetAy = ayId ?? activeYear?.id ?? null;

  const { data, isLoading } = useQuery<KhsResult>({
    queryKey: ['khs', studentId, targetAy],
    queryFn: () => api.get(`/khs/student/${studentId}?academicYearId=${targetAy}`),
    enabled: !!studentId && !!targetAy,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kartu Hasil Studi (KHS)</h2>
          <p className="text-sm text-slate-500">
            {data ? `${data.academicYear.code} — Semester ${data.academicYear.semester}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => targetAy && openPrintablePdf(`/exports/khs/${studentId}/pdf?academicYearId=${targetAy}`)}
            disabled={!targetAy}
          >
            Cetak
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => targetAy && downloadPdf(`/exports/khs/${studentId}/pdf?academicYearId=${targetAy}`, `KHS-${user?.username ?? ''}`)}
            disabled={!targetAy}
          >
            Unduh PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Total SKS Semester</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{data?.totalSks ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">IPS (Indeks Semester)</p>
            <p className="mt-1 text-2xl font-bold text-brand-600">{data?.ips ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">IPK (Indeks Kumulatif)</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{data?.ipk ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rincian Nilai</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>SKS</TableHead>
                <TableHead>Nilai Akhir</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Bobot</TableHead>
                <TableHead>N x SKS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400">Memuat...</TableCell>
                </TableRow>
              )}
              {data?.rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.courseCode}</TableCell>
                  <TableCell>{r.courseName}</TableCell>
                  <TableCell>{r.sks}</TableCell>
                  <TableCell>{r.finalScore ?? '—'}</TableCell>
                  <TableCell>{r.grade ? <Badge variant={GRADE_TONE[r.grade] ?? 'slate'}>{r.grade}</Badge> : '—'}</TableCell>
                  <TableCell>{r.weight ?? '—'}</TableCell>
                  <TableCell>{r.qualityPoints ?? '—'}</TableCell>
                </TableRow>
              ))}
              {data && data.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400">
                    Belum ada nilai yang terbit untuk semester ini
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
