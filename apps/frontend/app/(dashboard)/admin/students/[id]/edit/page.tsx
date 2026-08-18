'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudentForm } from '@/components/student-form';

export default function EditStudentPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/students/${id}`}>
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Edit Mahasiswa</h2>
          <p className="text-sm text-slate-500">Perbarui data mahasiswa</p>
        </div>
      </div>
      <StudentForm studentId={id} />
    </div>
  );
}
