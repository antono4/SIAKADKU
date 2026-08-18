'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/students">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tambah Mahasiswa</h2>
          <p className="text-sm text-slate-500">Form pendaftaran mahasiswa baru</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Form Tambah Mahasiswa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">
              Form tambah mahasiswa tersedia via REST API{' '}
              <code className="rounded bg-slate-200 px-1">POST /api/students</code>. Gunakan
              endpoint ini untuk integrasi atau admin backend. Lihat dokumentasi Swagger di{' '}
              <code className="rounded bg-slate-200 px-1">/api/docs</code>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
