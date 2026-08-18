/**
 * Shared domain types and enums for SIAKAD Terpadu.
 * Consumed by both the NestJS backend and the Next.js frontend.
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  AKADEMIK = 'AKADEMIK',
  DOSEN = 'DOSEN',
  MAHASISWA = 'MAHASISWA',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.AKADEMIK]: 'Bagian Akademik',
  [UserRole.DOSEN]: 'Dosen',
  [UserRole.MAHASISWA]: 'Mahasiswa',
};

export enum Semester {
  GANJIL = 'ganjil',
  GENAP = 'genap',
  PENDEK = 'pendek',
}

export enum StudentStatus {
  ACTIVE = 'active',
  NONACTIVE = 'nonactive',
  GRADUATED = 'graduated',
  DROP_OUT = 'drop_out',
}

export enum Gender {
  L = 'L',
  P = 'P',
}

export enum Day {
  SENIN = 'senin',
  SELASA = 'selasa',
  RABU = 'rabu',
  KAMIS = 'kamis',
  JUMAT = 'jumat',
  SABTU = 'sabtu',
  MINGGU = 'minggu',
}

export const DAY_ORDER: Day[] = [
  Day.SENIN,
  Day.SELASA,
  Day.RABU,
  Day.KAMIS,
  Day.JUMAT,
  Day.SABTU,
  Day.MINGGU,
];

/** Weighting used by the original siakad-terpadu Penilaian library. */
export const GRADE_WEIGHTS = {
  absent: 0.15,
  midterms: 0.3,
  task: 0.1,
  final: 0.45,
} as const;

export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export interface GradeComponents {
  absent: number;
  midterms: number;
  task: number;
  final: number;
}

/** Final score = 15% absent + 30% midterms + 10% task + 45% final. */
export function computeFinalScore(c: GradeComponents): number {
  return (
    c.absent * GRADE_WEIGHTS.absent +
    c.midterms * GRADE_WEIGHTS.midterms +
    c.task * GRADE_WEIGHTS.task +
    c.final * GRADE_WEIGHTS.final
  );
}

export function scoreToGrade(score: number): GradeLetter {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'E';
}

export const GRADE_WEIGHT: Record<GradeLetter, number> = {
  A: 4,
  B: 3,
  C: 2,
  D: 1,
  E: 0,
};

export function gradeToWeight(grade: GradeLetter): number {
  return GRADE_WEIGHT[grade];
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  perPage?: number;
  query?: string;
}
