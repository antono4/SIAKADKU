'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface KrsItem {
  id: number;
  verified: boolean;
  student: { npm: string; name: string; className: string | null };
  course: { courseCode: string; courseName: string; sks: number };
  academicYear: { code: string; semester: string };
}

export default function KrsVerificationPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery<KrsItem[]>({
    queryKey: ['krs-unverified'],
    queryFn: () => api.get('/krs?verified=false'),
  });

  const verify = useMutation({
    mutationFn: (ids: number[]) => api.patch('/krs/verify', { plainStudyIds: ids }),
    onSuccess: () => {
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ['krs-unverified'] });
    },
  });

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Verifikasi KRS</h2>
          <p className="text-sm text-slate-500">Setujui Kartu Rencana Studi mahasiswa</p>
        </div>
        <Button
          disabled={selected.size === 0 || verify.isPending}
          onClick={() => verify.mutate(Array.from(selected))}
        >
          Verifikasi ({selected.size})
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">Pilih</TableHead>
                <TableHead>NPM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>SKS</TableHead>
                <TableHead>Tahun Ajaran</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400">Memuat...</TableCell>
                </TableRow>
              )}
              {data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggle(item.id)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.student.npm}</TableCell>
                  <TableCell>{item.student.name}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.course.courseCode}</div>
                    <div className="text-xs text-slate-500">{item.course.courseName}</div>
                  </TableCell>
                  <TableCell>{item.course.sks}</TableCell>
                  <TableCell>
                    {item.academicYear.code} ({item.academicYear.semester})
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.verified ? 'green' : 'yellow'}>
                      {item.verified ? 'Terverifikasi' : 'Menunggu'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400">
                    Tidak ada KRS yang menunggu verifikasi 🎉
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {verify.isError && (
            <p className="mt-2 text-sm text-red-600">
              {(verify.error as Error)?.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
