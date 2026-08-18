'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface Concentration { id: number; code: string; name: string }

export function StudentForm({ studentId }: { studentId?: number }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!studentId;

  const { data: concentrations } = useQuery<Concentration[]>({
    queryKey: ['concentrations'],
    queryFn: () => api.get('/concentrations'),
  });

  const [form, setForm] = useState({
    npm: '',
    name: '',
    gender: 'L',
    placeOfBirth: '',
    birthDate: '',
    address: '',
    phone: '',
    email: '',
    concentrationId: '',
    className: '',
    registerYear: String(new Date().getFullYear()),
    entryStatus: 'reguler',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  // load existing student when editing
  useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      const s = await api.get<Record<string, unknown>>(`/students/${studentId}`);
      setForm({
        npm: String(s.npm ?? ''),
        name: String(s.name ?? ''),
        gender: String(s.gender ?? 'L'),
        placeOfBirth: String(s.placeOfBirth ?? ''),
        birthDate: s.birthDate ? String(s.birthDate).slice(0, 10) : '',
        address: String(s.address ?? ''),
        phone: String(s.phone ?? ''),
        email: String(s.email ?? ''),
        concentrationId: s.concentrationId ? String(s.concentrationId) : '',
        className: String(s.className ?? ''),
        registerYear: String(s.registerYear ?? ''),
        entryStatus: String(s.entryStatus ?? 'reguler'),
        status: String(s.status ?? 'active'),
      });
      return s;
    },
    enabled: !!studentId,
  });

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        npm: form.npm,
        name: form.name,
        gender: form.gender,
        placeOfBirth: form.placeOfBirth || undefined,
        birthDate: form.birthDate ? new Date(form.birthDate) : undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        concentrationId: form.concentrationId ? Number(form.concentrationId) : undefined,
        className: form.className || undefined,
        registerYear: form.registerYear || undefined,
        entryStatus: form.entryStatus,
        status: form.status,
      };
      if (isEdit) {
        await api.patch(`/students/${studentId}`, payload);
        toast.success('Data mahasiswa diperbarui.');
      } else {
        await api.post('/students', payload);
        toast.success('Mahasiswa ditambahkan.');
      }
      router.push('/admin/students');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Mahasiswa' : 'Form Tambah Mahasiswa'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="npm">NPM *</Label>
            <Input id="npm" value={form.npm} onChange={(e) => set('npm', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Jenis Kelamin</Label>
            <Select id="gender" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeOfBirth">Tempat Lahir</Label>
            <Input id="placeOfBirth" value={form.placeOfBirth} onChange={(e) => set('placeOfBirth', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Tanggal Lahir</Label>
            <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input id="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="className">Kelas</Label>
            <Input id="className" value={form.className} onChange={(e) => set('className', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="concentrationId">Konsentrasi</Label>
            <Select id="concentrationId" value={form.concentrationId} onChange={(e) => set('concentrationId', e.target.value)}>
              <option value="">— pilih —</option>
              {(concentrations ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="registerYear">Tahun Masuk</Label>
            <Input id="registerYear" value={form.registerYear} onChange={(e) => set('registerYear', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entryStatus">Status Masuk</Label>
            <Select id="entryStatus" value={form.entryStatus} onChange={(e) => set('entryStatus', e.target.value)}>
              <option value="reguler">Reguler</option>
              <option value="pindahan">Pindahan</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status Mahasiswa</Label>
            <Select id="status" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="active">Aktif</option>
              <option value="nonactive">Nonaktif</option>
              <option value="graduated">Lulus</option>
              <option value="drop_out">Drop Out</option>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea id="address" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Mahasiswa'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
