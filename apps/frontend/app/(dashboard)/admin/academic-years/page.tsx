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

interface AcademicYear {
  id: number;
  code: string;
  semester: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

const empty = { code: '', semester: 'ganjil', startDate: '', endDate: '', active: 'false' };

export default function AcademicYearsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicYear | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [toDelete, setToDelete] = useState<number | null>(null);

  const { data, isLoading } = useQuery<AcademicYear[]>({
    queryKey: ['academic-years'],
    queryFn: () => api.get('/academic-years'),
  });

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (ay: AcademicYear) => {
    setEditing(ay);
    setForm({
      code: ay.code,
      semester: ay.semester,
      startDate: ay.startDate.slice(0, 10),
      endDate: ay.endDate.slice(0, 10),
      active: String(ay.active),
    });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        code: form.code,
        semester: form.semester,
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        active: form.active === 'true',
      };
      if (editing) return api.patch(`/academic-years/${editing.id}`, payload);
      return api.post('/academic-years', payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Tahun ajaran diperbarui.' : 'Tahun ajaran ditambahkan.');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.del(`/academic-years/${id}`),
    onSuccess: () => {
      toast.success('Tahun ajaran dihapus.');
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tahun Ajaran</h2>
          <p className="text-sm text-slate-500">Kelola periode tahun ajaran & semester</p>
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
                <TableHead>Kode</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Mulai</TableHead>
                <TableHead>Berakhir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">Memuat...</TableCell>
                </TableRow>
              )}
              {data?.map((ay) => (
                <TableRow key={ay.id}>
                  <TableCell className="font-medium">{ay.code}</TableCell>
                  <TableCell className="capitalize">{ay.semester}</TableCell>
                  <TableCell>{new Date(ay.startDate).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{new Date(ay.endDate).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    <Badge variant={ay.active ? 'green' : 'slate'}>
                      {ay.active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(ay)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Hapus" onClick={() => setToDelete(ay.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">
                    Belum ada tahun ajaran
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
        title={editing ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}
      >
        <form
          onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="code">Kode (YYYY/YYYY) *</Label>
            <Input id="code" placeholder="2025/2026" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Select id="semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
              <option value="pendek">Pendek</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Mulai *</Label>
              <Input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Berakhir *</Label>
              <Input id="endDate" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
              checked={form.active === 'true'}
              onChange={(e) => setForm({ ...form, active: String(e.target.checked) })}
            />
            <Label htmlFor="active">Set sebagai tahun ajaran aktif</Label>
          </div>
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
        title="Hapus Tahun Ajaran"
        message="Yakin ingin menghapus tahun ajaran ini?"
        loading={remove.isPending}
      />
    </div>
  );
}
