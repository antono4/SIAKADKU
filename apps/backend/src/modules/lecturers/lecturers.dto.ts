import { z } from 'zod';
import { Gender } from '@siakad/shared';

export const lecturerQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().max(100).optional(),
  query: z.string().optional(),
  status: z.string().optional(),
  concentrationId: z.coerce.number().int().optional(),
});

export const createLecturerSchema = z.object({
  lecturerCode: z.string().min(2),
  nidn: z.string().optional(),
  name: z.string().min(2),
  gender: z.nativeEnum(Gender).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  status: z.string().default('active'),
  concentrationId: z.number().int().optional(),
  photo: z.string().optional(),
});

export const updateLecturerSchema = createLecturerSchema.partial();

export type LecturerQuery = z.infer<typeof lecturerQuerySchema>;
export type CreateLecturerDto = z.infer<typeof createLecturerSchema>;
export type UpdateLecturerDto = z.infer<typeof updateLecturerSchema>;
