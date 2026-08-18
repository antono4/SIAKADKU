'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleBadge } from '@/components/ui/role-badge';
import { Badge } from '@/components/ui/badge';
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

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useQuery<Page>({
    queryKey: ['users', query],
    queryFn: () =>
      api.get(`/users?perPage=30${query ? `&query=${encodeURIComponent(query)}` : ''}`),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Pengguna</h2>
        <p className="text-sm text-slate-500">Akun pengguna sistem</p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400">Memuat...</TableCell>
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
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400">Tidak ada pengguna</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
