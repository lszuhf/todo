import { z } from 'zod';

export const prioritySchema = z.enum(['low', 'medium', 'high']);

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().max(5000).optional(),
  priority: prioritySchema.default('medium'),
  completed: z.boolean().default(false),
  tagIds: z.array(z.number().int().positive()).optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().max(5000).nullable().optional(),
  priority: prioritySchema.optional(),
  completed: z.boolean().optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50),
});

export const todoQuerySchema = z.object({
  tagIds: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(',')
            .map(Number)
            .filter((n) => !isNaN(n))
        : undefined
    ),
  priority: prioritySchema.optional(),
  search: z.string().optional(),
  completed: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
});

export const exportQuerySchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type TodoQueryInput = z.infer<typeof todoQuerySchema>;
export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
