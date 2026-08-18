# SIAKAD Terpadu v2 — Project Notes

## Stack
- Monorepo: pnpm workspaces + turbo
- Backend: NestJS 10 (apps/backend), Prisma 5, PostgreSQL
- Frontend: Next.js 14 App Router (apps/frontend), Tailwind, TanStack Query, Zustand
- Shared: packages/shared (domain enums, grading logic) — built to dist, consumed by both apps

## Key conventions
- Validation: Zod schemas in `*.dto.ts`; applied via `ZodValidationPipe`
- Auth: JWT access (15m) + refresh (7d), stored in users table; `@Public()` skips JwtAuthGuard; `@Roles()` + `RolesGuard`
- Prisma input typing: when mixing relation + scalar optional fields, cast `as never` to satisfy the `Without<CreateInput, UncheckedCreateInput>` union
- Shared enums use UPPER keys, lowercase values; Day/StudentStatus etc must match Prisma enum values (lowercase)
- Frontend API: `lib/api.ts` fetch wrapper with Bearer token from `auth-store`; Next rewrite proxies `/api/*` → backend

## Commands
- `pnpm install` (root)
- `pnpm --filter @siakad/shared build` (must build before backend type-check)
- `pnpm --filter backend db:generate` then `prisma migrate dev`
- `pnpm --filter backend db:seed` (seed.ts via tsx)
- `pnpm --filter backend dev` / `pnpm --filter frontend dev`
- Backend type-check: `cd apps/backend && npx tsc --noEmit`

## Ports
- backend API: 4000 (docs at /api/docs)
- frontend: 3000
- postgres: 5432
