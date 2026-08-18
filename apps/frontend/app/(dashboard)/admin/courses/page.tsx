'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

export default function CoursesPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useQuery<Page>({
    queryKey: ['courses', query],
    queryFn: () =>
      api.get(`/courses?perPage=30${query ? `&query=${encodeURIComponent(query)}` : ''}`),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Mata Kuliah</h2>
        <p className="text-sm text-slate-500">Daftar mata kuliah</p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">Memuat...</TableCell>
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
                </TableRow>
              ))}
              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">
                    Tidak ada data
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
