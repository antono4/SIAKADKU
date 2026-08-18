import { z } from 'zod';

export const gradeQuerySchema = z.object({
  academicYearId: z.coerce.number().int().optional(),
  studentId: z.coerce.number().int().optional(),
  lecturerId: z.coerce.number().int().optional(),
  courseId: z.coerce.number().int().optional(),
  published: z.enum(['true', 'false']).optional(),
});

export const upsertGradeSchema = z.object({
  studentId: z.number().int(),
  courseId: z.number().int(),
  lecturerId: z.number().int().optional(),
  academicYearId: z.number().int(),
  absent: z.number().min(0).max(100).default(0),
  task: z.number().min(0).max(100).default(0),
  midterms: z.number().min(0).max(100).default(0),
  final: z.number().min(0).max(100).default(0),
  plainStudyId: z.number().int().optional(),
});

export const bulkUpsertGradeSchema = z.object({
  academicYearId: z.number().int(),
  lecturerId: z.number().int().optional(),
  items: z.array(upsertGradeSchema).min(1),
});

export const publishGradesSchema = z.object({
  studyPointIds: z.array(z.number().int()).min(1),
});

export type GradeQuery = z.infer<typeof gradeQuerySchema>;
export type UpsertGradeDto = z.infer<typeof upsertGradeSchema>;
export type BulkUpsertGradeDto = z.infer<typeof bulkUpsertGradeSchema>;
