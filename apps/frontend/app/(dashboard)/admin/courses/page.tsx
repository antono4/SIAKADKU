'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast, ConfirmDialog } from '@/components/ui/toast';
import { CourseFormFields } from '@/components/course-form-fields';
import { api } from '@/lib/api';

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  courseNameEnglish: string | null;
  sks: number;
  semester: number;
  active: boolean;
  concentration?: { name: string | null } | null;
}
interface Page { data: Course[]; total: number; page: number; perPage: number; totalPages: number }

const empty = {
  courseCode: '', courseName: '', courseNameEnglish: '', sks: '3',
  semester: '1', concentrationId: '', description: '',
};

export default function CoursesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [toDelete, setToDelete] = useState<number | null>(null);

  const { data, isLoading } = useQuery<Page>({
    queryKey: ['courses', query],
    queryFn: () =>
      api.get(`/courses?perPage=30${query ? `&query=${encodeURIComponent(query)}` : ''}`),
  });

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({
      courseCode: c.courseCode,
      courseName: c.courseName,
      courseNameEnglish: c.courseNameEnglish ?? '',
      sks: String(c.sks),
      semester: String(c.semester),
      concentrationId: '',
      description: '',
    });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        courseCode: form.courseCode,
        courseName: form.courseName,
        courseNameEnglish: form.courseNameEnglish || undefined,
        sks: Number(form.sks),
        semester: Number(form.semester),
        concentrationId: form.concentrationId ? Number(form.concentrationId) : undefined,
        description: form.description || undefined,
        active: true,
      };
      if (editing) {
        return api.patch(`/courses/${editing.id}`, payload);
      }
      return api.post('/courses', payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Mata kuliah diperbarui.' : 'Mata kuliah ditambahkan.');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.del(`/courses/${id}`),
    onSuccess: () => {
      toast.success('Mata kuliah dihapus.');
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mata Kuliah</h2>
          <p className="text-sm text-slate-500">Daftar mata kuliah</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari kode/nama..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>SKS</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Konsentrasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400">Memuat...</TableCell>
                </TableRow>
              )}
              {data?.data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.courseCode}</TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{c.courseName}</div>
                    {c.courseNameEnglish && (
                      <div className="text-xs text-slate-500">{c.courseNameEnglish}</div>
                    )}
                  </TableCell>
                  <TableCell><Badge variant="slate">{c.sks} SKS</Badge></TableCell>
                  <TableCell>{c.semester}</TableCell>
                  <TableCell>{c.concentration?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={c.active ? 'green' : 'red'}>
                      {c.active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Hapus" onClick={() => setToDelete(c.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
        className="max-w-2xl"
      >
        <form
          onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
          className="space-y-4"
        >
          <CourseFormFields value={form} onChange={setForm} />
          <div className="flex justify-end gap-2">
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
        title="Hapus Mata Kuliah"
        message="Yakin ingin menghapus mata kuliah ini?"
        loading={remove.isPending}
      />
    </div>
  );
}
