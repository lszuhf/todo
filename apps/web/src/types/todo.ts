import { z } from 'zod';

export const TodoPriority = z.enum(['low', 'medium', 'high']);
export type TodoPriority = z.infer<typeof TodoPriority>;

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: TodoPriority,
  tags: z.array(z.string()),
  completed: z.boolean(),
  dueDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: TodoPriority,
  tags: z.array(z.string()).optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().optional(),
});

export const UpdateTodoSchema = CreateTodoSchema.partial();

export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
