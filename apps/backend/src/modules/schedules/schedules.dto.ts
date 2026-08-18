import { z } from 'zod';
import { Day } from '@siakad/shared';

export const scheduleQuerySchema = z.object({
  academicYearId: z.coerce.number().int().optional(),
  lecturerId: z.coerce.number().int().optional(),
  day: z.nativeEnum(Day).optional(),
  courseId: z.coerce.number().int().optional(),
});

export const createScheduleSchema = z.object({
  courseId: z.number().int(),
  lecturerId: z.number().int().optional(),
  classroomId: z.number().int().optional(),
  day: z.nativeEnum(Day),
  sessionStart: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam mulai HH:MM'),
  sessionEnd: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam selesai HH:MM'),
  academicYearId: z.number().int(),
  capacity: z.number().int().min(1).default(40),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export type ScheduleQuery = z.infer<typeof scheduleQuerySchema>;
export type CreateScheduleDto = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleDto = z.infer<typeof updateScheduleSchema>;
