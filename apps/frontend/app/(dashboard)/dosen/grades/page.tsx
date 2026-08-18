'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { computeFinalScore, scoreToGrade } from '@siakad/shared';

interface EntryItem {
  plainStudyId: number;
  student: { id: number; npm: string; name: string };
  point: {
    id: number;
    absent: number; task: number; midterms: number; final: number;
  } | null;
}

interface GradeForm {
  absent: string;
  task: string;
  midterms: string;
  final: string;
}

export default function DosenGradesPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [forms, setForms] = useState<Record<number, GradeForm>>({});

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

  useEffect(() => {
    if (activeYear?.id && !academicYearId) setAcademicYearId(activeYear.id);
  }, [activeYear, academicYearId]);

  const { data: courses } = useQuery<{ id: number; courseCode: string; courseName: string }[]>({
    queryKey: ['courses-all'],
    queryFn: () => api.get('/courses?perPage=100'),
  });

  const { data: entry, isLoading } = useQuery<EntryItem[]>({
    queryKey: ['grade-entry', academicYearId, courseId],
    queryFn: () =>
      api.get(`/grades/entry?academicYearId=${academicYearId}&courseId=${courseId}`),
    enabled: !!academicYearId && !!courseId,
  });

  useEffect(() => {
    const next: Record<number, GradeForm> = {};
    for (const item of entry ?? []) {
      next[item.student.id] = {
        absent: String(item.point?.absent ?? ''),
        task: String(item.point?.task ?? ''),
        midterms: String(item.point?.midterms ?? ''),
        final: String(item.point?.final ?? ''),
      };
    }
    setForms(next);
  }, [entry]);

  const save = useMutation({
    mutationFn: (studentId: number) => {
      if (!academicYearId || !courseId) throw new Error('Pilih tahun ajaran & mata kuliah');
      const f = forms[studentId];
      const payload = {
        studentId,
        courseId,
        academicYearId,
        lecturerId: user?.lecturerId ?? undefined,
        absent: Number(f.absent || 0),
        task: Number(f.task || 0),
        midterms: Number(f.midterms || 0),
        final: Number(f.final || 0),
      };
      return api.post('/grades', payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grade-entry', academicYearId, courseId] }),
  });

  const setField = (studentId: number, field: keyof GradeForm, value: string) =>
    setForms((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Entry Nilai</h2>
        <p className="text-sm text-slate-500">Input komponen nilai mahasiswa per kelas</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 p-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Mata Kuliah</label>
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              value={courseId ?? ''}
              onChange={(e) => setCourseId(Number(e.target.value))}
            >
              <option value="">Pilih mata kuliah...</option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} — {c.courseName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Tahun Ajaran</label>
            <Input
              value={academicYearId ?? ''}
              onChange={(e) => setAcademicYearId(Number(e.target.value))}
              className="w-32"
              type="number"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Mahasiswa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NPM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="w-20">Absen</TableHead>
                <TableHead className="w-20">Tugas</TableHead>
                <TableHead className="w-20">UTS</TableHead>
                <TableHead className="w-20">UAS</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-slate-400">Memuat...</TableCell>
                </TableRow>
              )}
              {entry?.map((item) => {
                const f = forms[item.student.id];
                const absent = Number(f?.absent || 0);
                const task = Number(f?.task || 0);
                const midterms = Number(f?.midterms || 0);
                const final = Number(f?.final || 0);
                const score = computeFinalScore({ absent, task, midterms, final });
                const grade = scoreToGrade(score);
                return (
                  <TableRow key={item.student.id}>
                    <TableCell className="font-medium">{item.student.npm}</TableCell>
                    <TableCell>{item.student.name}</TableCell>
                    <TableCell>
                      <Input
                        className="h-8 w-16 px-2"
                        value={f?.absent ?? ''}
                        onChange={(e) => setField(item.student.id, 'absent', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 w-16 px-2"
                        value={f?.task ?? ''}
                        onChange={(e) => setField(item.student.id, 'task', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 w-16 px-2"
                        value={f?.midterms ?? ''}
                        onChange={(e) => setField(item.student.id, 'midterms', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 w-16 px-2"
                        value={f?.final ?? ''}
                        onChange={(e) => setField(item.student.id, 'final', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold">{Math.round(score)}</TableCell>
                    <TableCell><Badge variant="default">{grade}</Badge></TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        disabled={save.isPending}
                        onClick={() => save.mutate(item.student.id)}
                      >
                        Simpan
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {entry && entry.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-slate-400">
                    Belum ada mahasiswa terdaftar untuk kelas ini
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {save.isError && (
            <p className="mt-2 text-sm text-red-600">{(save.error as Error)?.message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
