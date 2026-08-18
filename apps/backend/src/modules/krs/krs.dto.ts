import { z } from 'zod';

export const krsQuerySchema = z.object({
  academicYearId: z.coerce.number().int().optional(),
  studentId: z.coerce.number().int().optional(),
  npm: z.string().optional(),
  verified: z.enum(['true', 'false']).optional(),
});

export const createPlainStudySchema = z.object({
  studentId: z.number().int(),
  courseId: z.number().int(),
  scheduleId: z.number().int().optional(),
  academicYearId: z.number().int(),
});

export const bulkCreatePlainStudySchema = z.object({
  studentId: z.number().int(),
  academicYearId: z.number().int(),
  items: z.array(
    z.object({
      courseId: z.number().int(),
      scheduleId: z.number().int().optional(),
    }),
  ),
});

export const verifyKrsSchema = z.object({
  plainStudyIds: z.array(z.number().int()),
});

export type KrsQuery = z.infer<typeof krsQuerySchema>;
export type CreatePlainStudyDto = z.infer<typeof createPlainStudySchema>;
export type BulkCreatePlainStudyDto = z.infer<typeof bulkCreatePlainStudySchema>;
