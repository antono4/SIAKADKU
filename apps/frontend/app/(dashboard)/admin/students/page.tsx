'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast, ConfirmDialog } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { downloadPdf } from '@/lib/download';

interface Student {
  id: number;
  npm: string;
  name: string;
  gender: string | null;
  className: string | null;
  registerYear: string | null;
  entryStatus: string;
  status: string;
  concentration?: { name: string | null } | null;
}

interface Page {
  data: Student[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const STATUS_VARIANT: Record<string, 'green' | 'yellow' | 'red' | 'slate'> = {
  active: 'green',
  nonactive: 'yellow',
  graduated: 'slate',
  drop_out: 'red',
};

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<number | null>(null);

  const { data, isLoading } = useQuery<Page>({
    queryKey: ['students', query, page],
    queryFn: () =>
      api.get(
        `/students?perPage=15&page=${page}${query ? `&query=${encodeURIComponent(query)}` : ''}`,
      ),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.del(`/students/${id}`),
    onSuccess: () => {
      toast.success('Mahasiswa dihapus.');
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Data Mahasiswa</h2>
          <p className="text-sm text-slate-500">Kelola data mahasiswa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadPdf('/exports/students/csv', 'data-mahasiswa')}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button asChild>
            <Link href="/admin/students/new">
              <Plus className="h-4 w-4" /> Tambah Mahasiswa
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari NPM, nama..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NPM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>L/P</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Konsentrasi</TableHead>
                <TableHead>Angkatan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-400">
                    Memuat...
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.npm}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.gender ?? '—'}</TableCell>
                  <TableCell>{s.className ?? '—'}</TableCell>
                  <TableCell>{s.concentration?.name ?? '—'}</TableCell>
                  <TableCell>{s.registerYear ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[s.status] ?? 'slate'}>{s.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/students/${s.id}`}>Detail</Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" aria-label="Edit">
                        <Link href={`/admin/students/${s.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Hapus"
                        onClick={() => setToDelete(s.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-400">
                    Tidak ada data mahasiswa
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Halaman {data.page} dari {data.totalPages} ({data.total} data)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete)}
        title="Hapus Mahasiswa"
        message="Yakin ingin menghapus data mahasiswa ini? Tindakan tidak dapat dibatalkan."
        loading={remove.isPending}
      />
    </div>
  );
}
