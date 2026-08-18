'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { downloadPdf } from '@/lib/download';

interface Grade {
  id: number;
  absent: number; task: number; midterms: number; final: number;
  finalScore: number | null;
  grade: string | null;
  published: boolean;
  student: { npm: string; name: string; className: string | null };
  course: { courseCode: string; courseName: string; sks: number };
  academicYear: { code: string; semester: string };
}

const GRADE_TONE: Record<string, 'green' | 'default' | 'yellow' | 'red' | 'slate'> = {
  A: 'green', B: 'default', C: 'yellow', D: 'red', E: 'red',
};

export default function GradesPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery<Grade[]>({
    queryKey: ['grades'],
    queryFn: () => api.get('/grades'),
  });
  // active academic year for CSV export
  const { data: activeYear } = useQuery<{ id: number } | null>({
    queryKey: ['active-year'],
    queryFn: async () => {
      try { return await api.get('/academic-years/active'); } catch { return null; }
    },
  });

  const filtered = (data ?? []).filter((g) =>
    !search ||
    g.student.npm.includes(search) ||
    g.student.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Daftar Nilai</h2>
          <p className="text-sm text-slate-500">Pantau nilai seluruh mahasiswa</p>
        </div>
        <Button
          variant="outline"
          disabled={!activeYear}
          onClick={() => activeYear && downloadPdf(`/exports/grades/csv?academicYearId=${activeYear.id}`, 'data-nilai')}
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 max-w-sm">
            <Input
              placeholder="Cari NPM/nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NPM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>Nilai Akhir</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">Memuat...</TableCell>
                </TableRow>
              )}
              {filtered.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.student.npm}</TableCell>
                  <TableCell>{g.student.name}</TableCell>
                  <TableCell>
                    <div className="font-medium">{g.course.courseCode}</div>
                    <div className="text-xs text-slate-500">{g.course.courseName}</div>
                  </TableCell>
                  <TableCell>{g.finalScore ?? '—'}</TableCell>
                  <TableCell>
                    {g.grade ? (
                      <Badge variant={GRADE_TONE[g.grade] ?? 'slate'}>{g.grade}</Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={g.published ? 'green' : 'yellow'}>
                      {g.published ? 'Terbit' : 'Draft'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">
                    Tidak ada data nilai
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
