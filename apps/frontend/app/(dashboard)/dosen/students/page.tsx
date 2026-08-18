'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface KrsItem {
  id: number;
  student: { npm: string; name: string; className: string | null };
  course: { courseCode: string; courseName: string; sks: number };
  academicYear: { code: string; semester: string };
  verified: boolean;
}

export default function DosenStudentsPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useQuery<KrsItem[]>({
    queryKey: ['dosen-krs'],
    queryFn: () => api.get('/krs'),
  });

  const filtered = (data ?? []).filter(
    (k) =>
      !query ||
      k.student.npm.includes(query) ||
      k.student.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Mahasiswa Bimbingan</h2>
        <p className="text-sm text-slate-500">Daftar mahasiswa per mata kuliah Anda</p>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari NPM/nama..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NPM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>SKS</TableHead>
                <TableHead>Status KRS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">Memuat...</TableCell>
                </TableRow>
              )}
              {filtered.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.student.npm}</TableCell>
                  <TableCell>{k.student.name}</TableCell>
                  <TableCell>{k.student.className ?? '—'}</TableCell>
                  <TableCell>
                    <div className="font-medium">{k.course.courseCode}</div>
                    <div className="text-xs text-slate-500">{k.course.courseName}</div>
                  </TableCell>
                  <TableCell><Badge variant="slate">{k.course.sks}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={k.verified ? 'green' : 'yellow'}>
                      {k.verified ? 'Terverifikasi' : 'Menunggu'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">Tidak ada data</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
