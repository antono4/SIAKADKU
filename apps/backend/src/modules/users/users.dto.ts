import { z } from 'zod';
import { UserRole } from '@siakad/shared';

export const createUserSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).max(40),
  email: z.string().email().optional(),
  password: z.string().min(8).max(72),
  role: z.nativeEnum(UserRole),
  active: z.boolean().default(true),
  studentId: z.number().int().optional(),
  lecturerId: z.number().int().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ role: true });

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
