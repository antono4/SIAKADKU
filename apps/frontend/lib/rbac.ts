import type { UserRole } from '@siakad/shared';

/**
 * Role-based access control for frontend routes.
 * A user may only access routes whose prefix is listed for their role.
 */
export const ROUTE_PREFIX_BY_ROLE: Record<UserRole, string[]> = {
  ADMIN: ['/admin'],
  AKADEMIK: ['/admin'],
  DOSEN: ['/dosen'],
  MAHASISWA: ['/mahasiswa'],
};

/**
 * Returns true if the given role is allowed to access the given pathname.
 * `/admin/...` requires ADMIN/AKADEMIK, `/dosen/...` requires DOSEN, etc.
 */
export function canAccess(
  role: UserRole,
  pathname: string,
): boolean {
  const allowed = ROUTE_PREFIX_BY_ROLE[role] ?? [];
  return allowed.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
