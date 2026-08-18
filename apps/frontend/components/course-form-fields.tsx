'use client';

import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

interface Concentration { id: number; code: string; name: string }

export function CourseFormFields({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  const { data: concentrations } = useQuery<Concentration[]>({
    queryKey: ['concentrations'],
    queryFn: () => api.get('/concentrations'),
  });

  const set = (field: string, v: string) => onChange({ ...value, [field]: v });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="courseCode">Kode MK *</Label>
        <Input id="courseCode" value={value.courseCode ?? ''} onChange={(e) => set('courseCode', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="courseName">Nama MK *</Label>
        <Input id="courseName" value={value.courseName ?? ''} onChange={(e) => set('courseName', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="courseNameEnglish">Nama Inggris</Label>
        <Input id="courseNameEnglish" value={value.courseNameEnglish ?? ''} onChange={(e) => set('courseNameEnglish', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sks">SKS *</Label>
        <Input id="sks" type="number" min={1} max={8} value={value.sks ?? '3'} onChange={(e) => set('sks', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="semester">Semester *</Label>
        <Input id="semester" type="number" min={1} max={8} value={value.semester ?? '1'} onChange={(e) => set('semester', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="concentrationId">Konsentrasi</Label>
        <Select id="concentrationId" value={value.concentrationId ?? ''} onChange={(e) => set('concentrationId', e.target.value)}>
          <option value="">— pilih —</option>
          {(concentrations ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea id="description" value={value.description ?? ''} onChange={(e) => set('description', e.target.value)} />
      </div>
    </div>
  );
}
