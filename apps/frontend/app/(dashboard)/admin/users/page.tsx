'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleBadge } from '@/components/ui/role-badge';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast, ConfirmDialog } from '@/components/ui/toast';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: 'ADMIN' | 'AKADEMIK' | 'DOSEN' | 'MAHASISWA';
  active: boolean;
}
interface Page { data: User[]; total: number; page: number; perPage: number; totalPages: number }

const empty = { name: '', username: '', email: '', password: '', role: 'MAHASISWA', active: 'true' };

export default function UsersPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery<Page>({
    queryKey: ['users', query],
    queryFn: () =>
      api.get(`/users?perPage=30${query ? `&query=${encodeURIComponent(query)}` : ''}`),
  });

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ ...empty, name: u.name, username: u.username, email: u.email ?? '', role: u.role, active: String(u.active) });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        username: form.username,
        email: form.email || undefined,
        role: form.role,
        active: form.active === 'true',
        ...(form.password ? { password: form.password } : {}),
      };
      if (editing) return api.patch(`/users/${editing.id}`, payload);
      return api.post('/users', payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Pengguna diperbarui.' : 'Pengguna ditambahkan.');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/users/${id}`),
    onSuccess: () => {
      toast.success('Pengguna dihapus.');
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengguna</h2>
          <p className="text-sm text-slate-500">Akun pengguna sistem</p>
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
              placeholder="Cari nama/username/email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
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
              {data?.data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email ?? '—'}</TableCell>
                  <TableCell><RoleBadge role={u.role} /></TableCell>
                  <TableCell>
                    <Badge variant={u.active ? 'green' : 'red'}>
                      {u.active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(u)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Hapus" onClick={() => setToDelete(u.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">Tidak ada pengguna</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Pengguna' : 'Tambah Pengguna'}
      >
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {editing ? '(kosongkan jika tidak diubah)' : '*'}
            </Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Peran</Label>
              <Select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="ADMIN">Administrator</option>
                <option value="AKADEMIK">Bagian Akademik</option>
                <option value="DOSEN">Dosen</option>
                <option value="MAHASISWA">Mahasiswa</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="active">Status</Label>
              <Select id="active" value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value })}>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </Select>
            </div>
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
        title="Hapus Pengguna"
        message="Yakin ingin menghapus pengguna ini?"
        loading={remove.isPending}
      />
    </div>
  );
}
