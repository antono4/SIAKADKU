import { ROLE_LABELS } from '@siakad/shared';
import { cn } from '@/lib/utils';

export type RoleLike = 'ADMIN' | 'AKADEMIK' | 'DOSEN' | 'MAHASISWA';

export function RoleBadge({ role, className }: { role: RoleLike; className?: string }) {
  const variant =
    role === 'ADMIN'
      ? 'bg-red-100 text-red-700'
      : role === 'AKADEMIK'
        ? 'bg-brand-100 text-brand-700'
        : role === 'DOSEN'
          ? 'bg-purple-100 text-purple-700'
          : 'bg-green-100 text-green-700';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant,
        className,
      )}
    >
      {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}
    </span>
  );
}
