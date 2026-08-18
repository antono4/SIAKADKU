'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast, ConfirmDialog } from '@/components/ui/toast';
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
interface Course { id: number; courseCode: string; courseName: string }
interface Lecturer { id: number; name: string }
interface Classroom { id: number; name: string }
interface AcademicYear { id: number; code: string; semester: string; active: boolean }

const DAYS = [
  { value: 'senin', label: 'Senin' },
  { value: 'selasa', label: 'Selasa' },
  { value: 'rabu', label: 'Rabu' },
  { value: 'kamis', label: 'Kamis' },
  { value: 'jumat', label: 'Jumat' },
  { value: 'sabtu', label: 'Sabtu' },
  { value: 'minggu', label: 'Minggu' },
];
const DAY_LABEL: Record<string, string> = Object.fromEntries(DAYS.map((d) => [d.value, d.label]));

const empty = {
  courseId: '', lecturerId: '', classroomId: '', day: 'senin',
  sessionStart: '07:30', sessionEnd: '09:30', academicYearId: '', capacity: '40',
};

export default function SchedulesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [toDelete, setToDelete] = useState<number | null>(null);

  const { data, isLoading } = useQuery<Schedule[]>({
    queryKey: ['schedules'],
    queryFn: () => api.get('/schedules'),
  });
  const { data: courses } = useQuery<Course[]>({
    queryKey: ['courses-all'],
    queryFn: () => api.get('/courses?perPage=100'),
  });
  const { data: lecturers } = useQuery<Lecturer[]>({
    queryKey: ['lecturers-all'],
    queryFn: () => api.get('/lecturers?perPage=100'),
  });
  const { data: classrooms } = useQuery<Classroom[]>({
    queryKey: ['classrooms'],
    queryFn: () => api.get('/classrooms'),
  });
  const { data: academicYears } = useQuery<AcademicYear[]>({
    queryKey: ['academic-years-all'],
    queryFn: () => api.get('/academic-years'),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...empty, academicYearId: academicYears?.find((a) => a.active)?.id?.toString() ?? '' });
    setOpen(true);
  };
  const openEdit = (s: Schedule & { courseId?: number; lecturerId?: number; classroomId?: number; academicYearId?: number }) => {
    setEditingId(s.id);
    setForm({
      courseId: String((s as { courseId?: number }).courseId ?? ''),
      lecturerId: String((s as { lecturerId?: number }).lecturerId ?? ''),
      classroomId: String((s as { classroomId?: number }).classroomId ?? ''),
      day: s.day,
      sessionStart: s.sessionStart,
      sessionEnd: s.sessionEnd,
      academicYearId: String((s as { academicYearId?: number }).academicYearId ?? ''),
      capacity: String(s.capacity),
    });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        courseId: Number(form.courseId),
        lecturerId: form.lecturerId ? Number(form.lecturerId) : undefined,
        classroomId: form.classroomId ? Number(form.classroomId) : undefined,
        day: form.day,
        sessionStart: form.sessionStart,
        sessionEnd: form.sessionEnd,
        academicYearId: Number(form.academicYearId),
        capacity: Number(form.capacity),
      };
      if (editingId) return api.patch(`/schedules/${editingId}`, payload);
      return api.post('/schedules', payload);
    },
    onSuccess: () => {
      toast.success(editingId ? 'Jadwal diperbarui.' : 'Jadwal ditambahkan.');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.del(`/schedules/${id}`),
    onSuccess: () => {
      toast.success('Jadwal dihapus.');
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Jadwal Kuliah</h2>
          <p className="text-sm text-slate-500">Daftar jadwal perkuliahan</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah
        </Button>
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
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400">Memuat...</TableCell>
                </TableRow>
              )}
              {data?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{DAY_LABEL[s.day] ?? s.day}</TableCell>
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
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(s as never)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Hapus" onClick={() => setToDelete(s.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400">Tidak ada jadwal</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}
        className="max-w-2xl"
      >
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="courseId">Mata Kuliah *</Label>
            <Select id="courseId" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
              <option value="">— pilih —</option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lecturerId">Dosen</Label>
            <Select id="lecturerId" value={form.lecturerId} onChange={(e) => setForm({ ...form, lecturerId: e.target.value })}>
              <option value="">— pilih —</option>
              {(lecturers ?? []).map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="classroomId">Ruang</Label>
            <Select id="classroomId" value={form.classroomId} onChange={(e) => setForm({ ...form, classroomId: e.target.value })}>
              <option value="">— pilih —</option>
              {(classrooms ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="academicYearId">Tahun Ajaran *</Label>
            <Select id="academicYearId" value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value })} required>
              <option value="">— pilih —</option>
              {(academicYears ?? []).map((a) => (
                <option key={a.id} value={a.id}>{a.code} ({a.semester})</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="day">Hari *</Label>
            <Select id="day" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Kapasitas</Label>
            <Input id="capacity" type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionStart">Jam Mulai *</Label>
            <Input id="sessionStart" type="time" value={form.sessionStart} onChange={(e) => setForm({ ...form, sessionStart: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionEnd">Jam Selesai *</Label>
            <Input id="sessionEnd" type="time" value={form.sessionEnd} onChange={(e) => setForm({ ...form, sessionEnd: e.target.value })} required />
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete)}
        title="Hapus Jadwal"
        message="Yakin ingin menghapus jadwal ini?"
        loading={remove.isPending}
      />
    </div>
  );
}
