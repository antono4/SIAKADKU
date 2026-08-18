'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { data, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Pengaturan</h2>
        <p className="text-sm text-slate-500">Konfigurasi aplikasi</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Opsi Aplikasi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400">Memuat...</p>
          ) : (
            <dl className="divide-y divide-slate-100">
              {Object.entries(data ?? {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3">
                  <dt className="text-sm font-medium text-slate-700">{key}</dt>
                  <dd className="text-sm text-slate-900">{value}</dd>
                </div>
              ))}
              {(!data || Object.keys(data).length === 0) && (
                <p className="text-slate-400">Belum ada pengaturan.</p>
              )}
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
