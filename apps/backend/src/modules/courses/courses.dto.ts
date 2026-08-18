import { z } from 'zod';

export const courseQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().max(100).optional(),
  query: z.string().optional(),
  semester: z.coerce.number().int().optional(),
  concentrationId: z.coerce.number().int().optional(),
  active: z.enum(['true', 'false']).optional(),
});

export const createCourseSchema = z.object({
  courseCode: z.string().min(2),
  courseName: z.string().min(2),
  courseNameEnglish: z.string().optional(),
  sks: z.number().int().min(1).max(8).default(3),
  semester: z.number().int().min(1).max(8),
  concentrationId: z.number().int().optional(),
  requirementCourseId: z.number().int().optional(),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CourseQuery = z.infer<typeof courseQuerySchema>;
export type CreateCourseDto = z.infer<typeof createCourseSchema>;
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;
