import { z } from 'zod';
import { Gender, StudentStatus } from '@siakad/shared';

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().max(100).optional(),
  query: z.string().optional(),
  class: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  registration: z.string().optional(),
  status: z.nativeEnum(StudentStatus).optional(),
  concentrationId: z.coerce.number().int().optional(),
});

export const createStudentSchema = z.object({
  npm: z.string().min(3),
  name: z.string().min(2),
  gender: z.nativeEnum(Gender).optional(),
  placeOfBirth: z.string().optional(),
  birthDate: z.coerce.date().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  photo: z.string().optional(),
  concentrationId: z.number().int().optional(),
  className: z.string().optional(),
  registerYear: z.string().optional(),
  entryStatus: z.enum(['reguler', 'pindahan']).default('reguler'),
  status: z.nativeEnum(StudentStatus).default(StudentStatus.ACTIVE),
  parent: z
    .object({
      fatherName: z.string().optional(),
      motherName: z.string().optional(),
      parentPhone: z.string().optional(),
      parentAddress: z.string().optional(),
      parentJob: z.string().optional(),
    })
    .optional(),
  originSchool: z
    .object({
      schoolName: z.string().optional(),
      schoolYear: z.string().optional(),
      major: z.string().optional(),
      graduationGrade: z.string().optional(),
    })
    .optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export type StudentQuery = z.infer<typeof studentQuerySchema>;
export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
