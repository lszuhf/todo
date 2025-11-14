import { Hono } from 'hono';
import type { Env } from '../types';
import { TodoRepository } from '../db';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  try {
    const keyword = c.req.query('q') || c.req.query('keyword') || '';

    if (!keyword) {
      return c.json({ error: 'Search keyword is required' }, 400);
    }

    const repo = new TodoRepository(c.env.DB);
    const todos = await repo.getAllTodos({ search: keyword });

    return c.json({
      query: keyword,
      results: todos.map((todo) => ({
        ...todo,
        completed: Boolean(todo.completed),
      })),
      count: todos.length,
    });
  } catch (error) {
    console.error('Error searching todos:', error);
    return c.json({ error: 'Failed to search todos' }, 500);
  }
});

export default app;
