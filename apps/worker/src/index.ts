import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import todosRouter from './routes/todos';
import tagsRouter from './routes/tags';
import searchRouter from './routes/search';
import exportRouter from './routes/export';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

app.get('/', (c) => {
  return c.json({
    message: 'Todo API',
    version: '1.0.0',
    endpoints: {
      todos: '/api/todos',
      tags: '/api/tags',
      search: '/api/search',
      export: '/api/export',
    },
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.route('/api/todos', todosRouter);
app.route('/api/tags', tagsRouter);
app.route('/api/search', searchRouter);
app.route('/api/export', exportRouter);

export default app;
