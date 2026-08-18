import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@siakad/shared';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to one or more roles. Use `@Roles(UserRole.ADMIN)`.
 * Combine with `@UseGuards(JwtAuthGuard, RolesGuard)`.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
