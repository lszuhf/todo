import { z } from 'zod';

// Priority enum
export const PriorityEnum = z.enum(['low', 'medium', 'high']);
export type Priority = z.infer<typeof PriorityEnum>;

// User schema
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const InsertUserSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateUserSchema = InsertUserSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type InsertUser = z.infer<typeof InsertUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// Todo schema
export const TodoSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  priority: PriorityEnum,
  completed: z.number().int().min(0).max(1),
  completed_at: z.string().nullable(),
  due_date: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const InsertTodoSchema = TodoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  completed: z.number().int().min(0).max(1).default(0),
  priority: PriorityEnum.default('medium'),
});

export const UpdateTodoSchema = InsertTodoSchema.partial();

export type Todo = z.infer<typeof TodoSchema>;
export type InsertTodo = z.infer<typeof InsertTodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;

// Tag schema
export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const InsertTagSchema = TagSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateTagSchema = InsertTagSchema.partial();

export type Tag = z.infer<typeof TagSchema>;
export type InsertTag = z.infer<typeof InsertTagSchema>;
export type UpdateTag = z.infer<typeof UpdateTagSchema>;

// TodoTag junction schema
export const TodoTagSchema = z.object({
  id: z.number(),
  todo_id: z.number(),
  tag_id: z.number(),
  created_at: z.string(),
});

export const InsertTodoTagSchema = TodoTagSchema.omit({
  id: true,
  created_at: true,
});

export type TodoTag = z.infer<typeof TodoTagSchema>;
export type InsertTodoTag = z.infer<typeof InsertTodoTagSchema>;

// Todo with tags (for API responses)
export const TodoWithTagsSchema = TodoSchema.extend({
  tags: z.array(TagSchema),
});

export type TodoWithTags = z.infer<typeof TodoWithTagsSchema>;
