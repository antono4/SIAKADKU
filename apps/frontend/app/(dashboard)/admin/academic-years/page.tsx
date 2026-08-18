'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface AcademicYear {
  id: number;
  code: string;
  semester: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export default function AcademicYearsPage() {
  const { data, isLoading } = useQuery<AcademicYear[]>({
    queryKey: ['academic-years'],
    queryFn: () => api.get('/academic-years'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Tahun Ajaran</h2>
        <p className="text-sm text-slate-500">Kelola periode tahun ajaran & semester</p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400">Memuat...</TableCell>
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
                </TableRow>
              ))}
              {data && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400">
                    Belum ada tahun ajaran
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
