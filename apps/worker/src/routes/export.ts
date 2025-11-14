import { Hono } from 'hono';
import type { Env, TodoWithTags } from '../types';
import { TodoRepository, TagRepository } from '../db';
import { exportQuerySchema } from '../schemas';

const app = new Hono<{ Bindings: Env }>();

function convertToCSV(todos: TodoWithTags[]): string {
  const headers = [
    'ID',
    'Title',
    'Content',
    'Priority',
    'Completed',
    'Tags',
    'Created At',
    'Updated At',
  ];
  const rows = todos.map((todo) => [
    todo.id.toString(),
    escapeCSV(todo.title),
    escapeCSV(todo.content || ''),
    todo.priority,
    todo.completed ? 'true' : 'false',
    escapeCSV(todo.tags.map((t) => t.name).join(', ')),
    todo.created_at,
    todo.updated_at,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

app.get('/', async (c) => {
  try {
    const queryResult = exportQuerySchema.safeParse({
      format: c.req.query('format') || 'json',
    });

    if (!queryResult.success) {
      return c.json(
        {
          error: 'Invalid query parameters',
          details: queryResult.error.errors,
        },
        400
      );
    }

    const { format } = queryResult.data;

    const todoRepo = new TodoRepository(c.env.DB);
    const tagRepo = new TagRepository(c.env.DB);

    const [todos, tags] = await Promise.all([todoRepo.getAllTodos(), tagRepo.getAllTags()]);

    if (format === 'csv') {
      const csv = convertToCSV(todos);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="todos-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const exportData = {
      exported_at: new Date().toISOString(),
      todos: todos.map((todo) => ({
        ...todo,
        completed: Boolean(todo.completed),
      })),
      tags,
    };

    return c.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    return c.json({ error: 'Failed to export data' }, 500);
  }
});

export default app;
