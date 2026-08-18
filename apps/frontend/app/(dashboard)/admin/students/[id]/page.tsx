'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface Student {
  id: number;
  npm: string;
  name: string;
  gender: string | null;
  placeOfBirth: string | null;
  birthDate: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  className: string | null;
  registerYear: string | null;
  entryStatus: string;
  status: string;
  concentration?: { name: string | null } | null;
  user?: { username: string; active: boolean } | null;
}

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading } = useQuery<Student>({
    queryKey: ['student', id],
    queryFn: () => api.get(`/students/${id}`),
  });

  const rows: [string, string | null | undefined][] = [
    ['NPM', data?.npm],
    ['Nama', data?.name],
    ['Jenis Kelamin', data?.gender],
    ['Tempat Lahir', data?.placeOfBirth],
    ['Tanggal Lahir', data?.birthDate ? new Date(data.birthDate).toLocaleDateString('id-ID') : null],
    ['Alamat', data?.address],
    ['Telepon', data?.phone],
    ['Email', data?.email],
    ['Kelas', data?.className],
    ['Angkatan', data?.registerYear],
    ['Status Masuk', data?.entryStatus],
    ['Konsentrasi', data?.concentration?.name],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/students">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Detail Mahasiswa</h2>
          <p className="text-sm text-slate-500">{data?.name}</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Biodata</span>
            {data && (
              <Badge variant={data.status === 'active' ? 'green' : 'yellow'}>{data.status}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400">Memuat...</p>
          ) : (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {rows.map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <dt className="text-sm text-slate-500">{label}</dt>
                  <dd className="text-sm font-medium text-slate-900">{value ?? '—'}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
