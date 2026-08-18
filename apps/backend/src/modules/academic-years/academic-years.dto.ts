import { z } from 'zod';
import { Semester } from '@siakad/shared';

export const academicYearQuerySchema = z.object({
  active: z.enum(['true', 'false']).optional(),
});

export const createAcademicYearSchema = z.object({
  code: z.string().regex(/^\d{4}\/\d{4}$/, 'Format tahun ajaran harus YYYY/YYYY'),
  semester: z.nativeEnum(Semester),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  active: z.boolean().default(false),
});

export const updateAcademicYearSchema = createAcademicYearSchema.partial();

export type CreateAcademicYearDto = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearDto = z.infer<typeof updateAcademicYearSchema>;
