import { z } from 'zod';

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

export const UserIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'email', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
