import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CreateTodoSchema, UpdateTodoSchema } from './schema';
import { todoStorage } from './storage';

const app = new Hono();

app.use('/*', cors());

app.get('/', (c) => {
  return c.json({
    message: 'Hello from Cloudflare Worker!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.get('/api/todos', (c) => {
  const todos = todoStorage.getAll();
  return c.json(todos);
});

app.get('/api/todos/:id', (c) => {
  const id = c.req.param('id');
  const todo = todoStorage.getById(id);
  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404);
  }
  return c.json(todo);
});

app.post('/api/todos', async (c) => {
  try {
    const body = await c.req.json();
    const input = CreateTodoSchema.parse(body);
    const todo = todoStorage.create(input);
    return c.json(todo, 201);
  } catch (error) {
    return c.json({ error: 'Invalid input', details: error }, 400);
  }
});

app.put('/api/todos/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const input = UpdateTodoSchema.parse(body);
    const todo = todoStorage.update(id, input);
    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404);
    }
    return c.json(todo);
  } catch (error) {
    return c.json({ error: 'Invalid input', details: error }, 400);
  }
});

app.delete('/api/todos/:id', (c) => {
  const id = c.req.param('id');
  const success = todoStorage.delete(id);
  if (!success) {
    return c.json({ error: 'Todo not found' }, 404);
  }
  return c.json({ success: true });
});

app.get('/api/tags', (c) => {
  const tags = todoStorage.getAllTags();
  return c.json(tags);
});

export default app;
