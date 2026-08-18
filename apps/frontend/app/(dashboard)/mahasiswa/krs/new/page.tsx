'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  sks: number;
  semester: number;
  active: boolean;
}
interface Schedule {
  id: number;
  day: string;
  sessionStart: string;
  sessionEnd: string;
  courseId: number;
  lecturer: { name: string } | null;
  classroom: { name: string } | null;
  capacity: number;
  enrolledCount: number;
}
interface ExistingKrs {
  id: number;
  course: { id: number; courseCode: string; courseName: string; sks: number };
  scheduleId: number | null;
}

const DAYS: Record<string, string> = {
  senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu', kamis: 'Kamis',
  jumat: 'Jumat', sabtu: 'Sabtu', minggu: 'Minggu',
};

export default function SusunKrsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const studentId = user?.studentId ?? 0;

  const { data: activeYear } = useQuery<{ id: number; code: string; semester: string } | null>({
    queryKey: ['active-year'],
    queryFn: async () => {
      try {
        return await api.get('/academic-years/active');
      } catch {
        return null;
      }
    },
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['courses-all'],
    queryFn: () => api.get('/courses?perPage=100'),
  });

  const { data: schedules } = useQuery<Schedule[]>({
    queryKey: ['schedules-all'],
    queryFn: async () => {
      if (!activeYear) return [];
      const all: Schedule[] = await api.get('/schedules');
      return all.filter((s) => (s as { academicYearId?: number }).academicYearId === activeYear.id);
    },
    enabled: !!activeYear,
  });

  const { data: existingKrs } = useQuery<ExistingKrs[]>({
    queryKey: ['krs', 'student', studentId],
    queryFn: () => api.get(`/krs/student/${studentId}`),
    enabled: !!studentId,
  });

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Map<number, number>>(new Map()); // courseId -> scheduleId

  const existingCourseIds = new Set((existingKrs ?? []).map((k) => k.course.id));

  const filteredCourses = (courses ?? []).filter(
    (c) =>
      c.active &&
      !existingCourseIds.has(c.id) &&
      (!query ||
        c.courseCode.toLowerCase().includes(query.toLowerCase()) ||
        c.courseName.toLowerCase().includes(query.toLowerCase())),
  );

  const totalSks = Array.from(selected.keys()).reduce((sum, id) => {
    const c = courses?.find((x) => x.id === id);
    return sum + (c?.sks ?? 0);
  }, 0);

  const schedulesByCourse = (courseId: number) =>
    (schedules ?? []).filter((s) => s.courseId === courseId);

  const toggle = (courseId: number, scheduleId: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(courseId)) {
        if (next.get(courseId) === scheduleId) {
          next.delete(courseId);
        } else {
          next.set(courseId, scheduleId);
        }
      } else {
        next.set(courseId, scheduleId);
      }
      return next;
    });
  };

  const submit = useMutation({
    mutationFn: async () => {
      if (!activeYear) throw new Error('Tahun ajaran aktif tidak ditemukan.');
      const items = Array.from(selected.entries()).map(([courseId, scheduleId]) => ({
        courseId,
        scheduleId: scheduleId || undefined,
      }));
      return api.post('/krs/bulk', {
        studentId,
        academicYearId: activeYear.id,
        items,
      });
    },
    onSuccess: () => {
      toast.success('KRS berhasil disimpan. Menunggu verifikasi.');
      queryClient.invalidateQueries({ queryKey: ['krs'] });
      router.push('/mahasiswa/krs');
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/mahasiswa/krs">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">Susun KRS</h2>
          <p className="text-sm text-slate-500">
            Tahun ajaran: {activeYear?.code ?? '—'} ({activeYear?.semester ?? '—'})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="slate">{selected.size} MK · {totalSks} SKS</Badge>
          <Button
            disabled={selected.size === 0 || submit.isPending || !activeYear}
            onClick={() => submit.mutate()}
          >
            {submit.isPending ? 'Menyimpan...' : 'Simpan KRS'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari mata kuliah..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {!activeYear && (
            <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
              Belum ada tahun ajaran aktif. Hubungi bagian akademik.
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pilih</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>SKS</TableHead>
                <TableHead>Smt</TableHead>
                <TableHead>Jadwal Tersedia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((c) => {
                const avail = schedulesByCourse(c.id);
                const sel = selected.get(c.id);
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-brand-600"
                        checked={selected.has(c.id)}
                        onChange={() => {
                          if (selected.has(c.id)) {
                            setSelected((prev) => {
                              const next = new Map(prev);
                              next.delete(c.id);
                              return next;
                            });
                          } else if (avail.length > 0) {
                            toggle(c.id, avail[0].id);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{c.courseCode}</TableCell>
                    <TableCell>{c.courseName}</TableCell>
                    <TableCell><Badge variant="slate">{c.sks}</Badge></TableCell>
                    <TableCell>{c.semester}</TableCell>
                    <TableCell>
                      {avail.length === 0 ? (
                        <span className="text-xs text-slate-400">Belum ada jadwal</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {avail.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => toggle(c.id, s.id)}
                              className={`rounded-md border px-2 py-1 text-xs ${
                                sel === s.id
                                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {DAYS[s.day] ?? s.day} {s.sessionStart}-{s.sessionEnd}
                              {s.lecturer ? ` · ${s.lecturer.name}` : ''}
                            </button>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">
                    Tidak ada mata kuliah yang dapat diambil
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
